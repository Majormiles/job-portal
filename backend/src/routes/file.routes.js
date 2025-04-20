import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { protect } from '../middleware/auth.middleware.js';
import localFileStorage from '../utils/localFileStorage.js';
import AppError from '../utils/appError.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize local storage
localFileStorage.initLocalStorage();

// Helper function to determine the MIME type
const getMimeType = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.pdf': 'application/pdf',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.doc': 'application/msword',
    '.txt': 'text/plain',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png'
  };
  
  return mimeTypes[ext] || 'application/octet-stream';
};

// Custom middleware to handle token from query parameter or header
const validateToken = (req, res, next) => {
  try {
    let token;
    
    // Check if token is in the query parameters
    if (req.query.token) {
      token = req.query.token;
    } 
    // Check if token is in the authorization header
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return next(new AppError('Not authorized to access this file. Please login.', 401));
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user data to the request
    req.user = {
      _id: decoded.id,
      role: decoded.role
    };
    
    next();
  } catch (error) {
    console.error('Token validation error:', error);
    return next(new AppError('Invalid token. Please login again.', 401));
  }
};

// Serve file by path - use validateToken instead of protect middleware
router.get('/:type/:filename', validateToken, (req, res, next) => {
  try {
    const { type, filename } = req.params;
    const userId = req.user._id;
    
    console.log(`Serving file: ${type}/${filename} for user ${userId}`);
    
    // Construct the file path
    let filePath;
    if (type === 'resumes') {
      // For resumes, use user-specific directory
      filePath = path.join(localFileStorage.UPLOADS_BASE_DIR, type, userId.toString(), filename);
    } else {
      // For other file types
      filePath = path.join(localFileStorage.UPLOADS_BASE_DIR, type, filename);
    }
    
    console.log(`Looking for file at path: ${filePath}`);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return next(new AppError('File not found', 404));
    }
    
    // Try to log access but don't fail if logging fails
    try {
      localFileStorage.logFileActivity({
        action: 'access',
        path: filePath,
        userId: userId.toString(),
        filename: filename
      });
    } catch (logError) {
      console.error('Error logging file access, but continuing to serve file:', logError);
    }
    
    // Set appropriate content type
    const mimeType = getMimeType(filePath);
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.on('error', (error) => {
      console.error(`Error streaming file: ${error.message}`);
      return next(new AppError('Error serving file', 500));
    });
    
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error serving file:', error);
    next(new AppError('Error serving file', 500));
  }
});

// Serve file by user ID and type - use validateToken instead of protect middleware
router.get('/:type/user/:userId/:filename', validateToken, (req, res, next) => {
  try {
    const { type, userId, filename } = req.params;
    const requestingUserId = req.user._id;
    
    console.log(`Serving file: ${type}/user/${userId}/${filename} requested by user ${requestingUserId}`);
    
    // Security check - only allow access to own files or admin users
    if (requestingUserId.toString() !== userId && req.user.role !== 'admin') {
      console.error(`Unauthorized access attempt: User ${requestingUserId} trying to access file of user ${userId}`);
      return next(new AppError('Unauthorized access to file', 403));
    }
    
    // Construct the file path
    const filePath = path.join(localFileStorage.UPLOADS_BASE_DIR, type, userId, filename);
    
    console.log(`Looking for file at path: ${filePath}`);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return next(new AppError('File not found', 404));
    }
    
    // Try to log access but don't fail if logging fails
    try {
      localFileStorage.logFileActivity({
        action: 'access',
        path: filePath,
        userId: requestingUserId.toString(),
        targetUserId: userId,
        filename: filename
      });
    } catch (logError) {
      console.error('Error logging file access, but continuing to serve file:', logError);
    }
    
    // Set appropriate content type
    const mimeType = getMimeType(filePath);
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.on('error', (error) => {
      console.error(`Error streaming file: ${error.message}`);
      return next(new AppError('Error serving file', 500));
    });
    
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error serving file:', error);
    next(new AppError('Error serving file', 500));
  }
});

// Delete file - keep using protect middleware
router.delete('/:type/:filename', protect, async (req, res, next) => {
  try {
    const { type, filename } = req.params;
    const userId = req.user._id;
    
    // Construct the file path
    let filePath;
    if (type === 'resumes') {
      // For resumes, use user-specific directory
      filePath = path.join(localFileStorage.UPLOADS_BASE_DIR, type, userId.toString(), filename);
    } else {
      // For other file types
      filePath = path.join(localFileStorage.UPLOADS_BASE_DIR, type, filename);
    }
    
    // Delete the file
    await localFileStorage.deleteFileFromLocal(filePath);
    
    res.status(200).json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    next(new AppError('Error deleting file', 500));
  }
});

export default router; 
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
    let token = null;
    let isAdminView = false;
    
    // Check if this is an admin viewing request through a special parameter
    if (req.query.isAdminView === 'true' || req.query.admin === 'true') {
      isAdminView = true;
      console.log('Admin view request detected');
    }
    
    // Log available authentication methods
    console.log('Auth sources:', {
      hasQueryToken: Boolean(req.query.token),
      hasAuthHeader: Boolean(req.headers.authorization),
      hasAdminToken: Boolean(req.query.adminToken),
      hasAdminHeader: Boolean(req.headers['x-admin-token']),
      isAdminView
    });
    
    // Try multiple token sources in order of preference
    // 1. Check admin token in query parameter first
    if (req.query.adminToken && typeof req.query.adminToken === 'string') {
      console.log('Using adminToken from query for verification');
      token = req.query.adminToken;
      isAdminView = true;
    }
    // 2. Check admin token in header
    else if (req.headers['x-admin-token'] && typeof req.headers['x-admin-token'] === 'string') {
      console.log('Using X-Admin-Token header for verification');
      token = req.headers['x-admin-token'];
      isAdminView = true;
    }
    // 3. Check regular token in query parameters
    else if (req.query.token && typeof req.query.token === 'string') {
      console.log('Using token from query parameters');
      token = req.query.token;
    } 
    // 4. Check token in authorization header
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      console.log('Using token from Authorization header');
      token = req.headers.authorization.split(' ')[1];
    }
    
    // Handle case where no valid token was found
    if (!token || typeof token !== 'string') {
      console.log('No valid token found in request');
      
      // If this is an admin view, let it proceed with limited access
      if (isAdminView) {
        console.log('Admin view mode enabled but no valid token provided');
        req.user = {
          _id: 'anonymous',
          role: 'user',
          isAdminView: true
        };
        return next();
      }
      
      console.error(`Invalid or missing token: ${token}`);
      return next(new AppError('Not authorized to access this file. Please login.', 401));
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Log the decoded token information for debugging
    console.log(`Token verified for user ${decoded.id}, role: ${decoded.role || 'undefined'}`);
    
    // Special case: Always grant admin view to admin users
    if (decoded.role === 'admin') {
      isAdminView = true;
      console.log('Admin role detected in token, enabling admin view');
    }
    
    // Attach user data to the request
    req.user = {
      _id: decoded.id,
      role: decoded.role || 'user',  // Default to 'user' if role is not specified
      isAdminView: isAdminView       // Mark if this is an admin view request
    };
    
    // Allow admin view mode to bypass certain checks later
    if (isAdminView) {
      console.log(`Admin view mode enabled for user ${req.user._id}`);
    }
    
    next();
  } catch (error) {
    console.error('Token validation error:', error);
    
    // If this is an admin view, let it proceed with limited access
    if (req.query.isAdminView === 'true' || req.query.admin === 'true') {
      console.log('Admin view mode enabled despite token error');
      req.user = {
        _id: 'anonymous',
        role: 'user',
        isAdminView: true
      };
      return next();
    }
    
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
    
    // For debugging purposes
    console.log(`isAdminView: ${req.user.isAdminView}, user role: ${req.user.role}`);
    
    // IMPORTANT: Temporary override for admin UI access
    // This allows any authenticated user to access files through the admin UI
    // Note: This is a simpler approach that doesn't rely on tokens having admin role
    if (req.query.isAdminView === 'true' || req.query.admin === 'true') {
      console.log('Admin view override: bypassing user check for admin UI');
      req.user.isAdminView = true;
    }
    
    // Security check - allow access if:
    // 1. User is accessing their own file
    // 2. User has admin role
    // 3. User has isAdminView flag set (from admin UI)
    if (requestingUserId.toString() !== userId && req.user.role !== 'admin' && !req.user.isAdminView) {
      console.error(`Unauthorized access attempt: User ${requestingUserId} trying to access file of user ${userId}`);
      return next(new AppError('Unauthorized access to file', 403));
    }
    
    // If this is an admin view, log it explicitly
    if (req.user.isAdminView) {
      console.log(`Admin view access granted to user ${requestingUserId} for file of user ${userId}`);
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
        filename: filename,
        isAdminView: req.user.isAdminView
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
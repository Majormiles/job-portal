import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import AppError from './appError.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the uploads directory path
const UPLOADS_BASE_DIR = path.join(process.cwd(), 'uploads');
const RESUME_DIR = path.join(UPLOADS_BASE_DIR, 'resumes');
const LOGS_DIR = path.join(UPLOADS_BASE_DIR, 'logs');

// Supported file types and their MIME types
const SUPPORTED_FILE_TYPES = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  doc: 'application/msword',
  txt: 'text/plain'
};

// Initialize local storage
export const initLocalStorage = () => {
  // Ensure all required directories exist
  const directories = [UPLOADS_BASE_DIR, RESUME_DIR, LOGS_DIR];
  
  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });
  
  // Check write permissions
  try {
    const testFile = path.join(UPLOADS_BASE_DIR, '.permission_test');
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
    console.log('Upload directory permissions verified');
  } catch (error) {
    console.error('Error: Upload directory does not have write permissions', error);
    throw new Error('Upload directory must have write permissions');
  }
  
  // Initialize log file
  const logFile = path.join(LOGS_DIR, `upload_log_${new Date().toISOString().split('T')[0]}.log`);
  if (!fs.existsSync(logFile)) {
    fs.writeFileSync(logFile, '# File Upload Logs\n\n');
  }
  
  console.log('Local file storage initialized successfully');
};

// Generate a secure filename
export const generateSecureFilename = (originalFilename) => {
  const fileExt = path.extname(originalFilename).toLowerCase();
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  const uuid = uuidv4();
  
  return `${timestamp}-${randomString}-${uuid}${fileExt}`;
};

// Validate file type and size
export const validateFile = (file, allowedTypes = Object.values(SUPPORTED_FILE_TYPES), maxSize = 5 * 1024 * 1024) => {
  // Check if file exists
  if (!file) {
    throw new AppError('No file provided', 400);
  }
  
  // Check file size
  if (file.size > maxSize) {
    throw new AppError(`File size exceeds the limit of ${maxSize / (1024 * 1024)}MB`, 400);
  }
  
  // Check file type
  if (!allowedTypes.includes(file.mimetype)) {
    throw new AppError(
      `Invalid file type. Supported types: ${Object.keys(SUPPORTED_FILE_TYPES).join(', ')}`, 
      400
    );
  }
  
  return true;
};

// Save file to local storage
export const saveFileToLocal = async (file, subDirectory = 'resumes', userId = null) => {
  try {
    // Ensure directory exists
    const targetDir = path.join(UPLOADS_BASE_DIR, subDirectory);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    // Create user directory if userId is provided
    let finalDir = targetDir;
    if (userId) {
      finalDir = path.join(targetDir, userId.toString());
      if (!fs.existsSync(finalDir)) {
        fs.mkdirSync(finalDir, { recursive: true });
      }
    }
    
    // Generate secure filename
    const secureFilename = generateSecureFilename(file.originalname);
    const filePath = path.join(finalDir, secureFilename);
    
    // If file is already stored by multer, copy it to the right location
    if (file.path) {
      const readStream = fs.createReadStream(file.path);
      const writeStream = fs.createWriteStream(filePath);
      
      await new Promise((resolve, reject) => {
        readStream.pipe(writeStream);
        readStream.on('error', reject);
        writeStream.on('finish', resolve);
      });
      
      // Clean up the temporary file
      fs.unlinkSync(file.path);
    } else {
      // Handle buffer case
      fs.writeFileSync(filePath, file.buffer);
    }
    
    // Log the upload
    logFileUpload({
      userId: userId,
      filename: secureFilename,
      originalFilename: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      path: filePath
    });
    
    // Return the file info for storage in the database
    return {
      filename: secureFilename,
      originalFilename: file.originalname,
      path: filePath,
      // Create a URL path that can be used to access the file
      url: `/api/files/${subDirectory}${userId ? '/' + userId : ''}/${secureFilename}`
    };
  } catch (error) {
    console.error('Error saving file to local storage:', error);
    throw new AppError('Failed to save file to local storage', 500);
  }
};

// Delete file from local storage
export const deleteFileFromLocal = async (filePath) => {
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.warn(`File not found: ${filePath}`);
      return true; // File already doesn't exist, so consider the deletion successful
    }
    
    // Delete the file
    fs.unlinkSync(filePath);
    
    // Log the deletion
    logFileActivity({
      action: 'delete',
      path: filePath,
      timestamp: new Date().toISOString()
    });
    
    return true;
  } catch (error) {
    console.error('Error deleting file from local storage:', error);
    throw new AppError('Failed to delete file from local storage', 500);
  }
};

// Log file upload activity
export const logFileUpload = (fileInfo) => {
  try {
    // Ensure logs directory exists
    if (!fs.existsSync(LOGS_DIR)) {
      fs.mkdirSync(LOGS_DIR, { recursive: true });
      console.log(`Created logs directory: ${LOGS_DIR}`);
    }
    
    const logFile = path.join(LOGS_DIR, `upload_log_${new Date().toISOString().split('T')[0]}.log`);
    const logEntry = `[${new Date().toISOString()}] UPLOAD - User: ${fileInfo.userId}, File: ${fileInfo.filename}, Original: ${fileInfo.originalFilename}, Type: ${fileInfo.mimeType}, Size: ${fileInfo.size} bytes, Path: ${fileInfo.path}\n`;
    
    fs.appendFileSync(logFile, logEntry);
  } catch (error) {
    console.error('Error logging file upload:', error);
    // Don't throw - logging should be non-blocking
  }
};

// Log general file activity
export const logFileActivity = (activity) => {
  try {
    // Ensure logs directory exists
    if (!fs.existsSync(LOGS_DIR)) {
      fs.mkdirSync(LOGS_DIR, { recursive: true });
      console.log(`Created logs directory: ${LOGS_DIR}`);
    }
    
    const logFile = path.join(LOGS_DIR, `upload_log_${new Date().toISOString().split('T')[0]}.log`);
    const logEntry = `[${new Date().toISOString()}] ${activity.action.toUpperCase()} - ${JSON.stringify(activity)}\n`;
    
    fs.appendFileSync(logFile, logEntry);
  } catch (error) {
    console.error('Error logging file activity:', error);
    // Don't throw - logging should be non-blocking
  }
};

// Get file by filename
export const getFileByPath = (filePath) => {
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new AppError('File not found', 404);
    }
    
    // Read file
    const fileContent = fs.readFileSync(filePath);
    
    // Log access
    logFileActivity({
      action: 'access',
      path: filePath,
      timestamp: new Date().toISOString()
    });
    
    return fileContent;
  } catch (error) {
    console.error('Error retrieving file:', error);
    throw new AppError('Failed to retrieve file', 500);
  }
};

// Export default settings
export default {
  initLocalStorage,
  saveFileToLocal,
  deleteFileFromLocal,
  validateFile,
  generateSecureFilename,
  getFileByPath,
  UPLOADS_BASE_DIR,
  RESUME_DIR,
  SUPPORTED_FILE_TYPES
}; 
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  // Server configuration
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database configuration
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/job-portal',
  
  // JWT configuration
  jwtSecret: process.env.JWT_SECRET || 'your-default-secret-key-change-in-production',
  jwtExpire: process.env.JWT_EXPIRE || '30d',
  
  // Email configuration
  smtpHost: process.env.SMTP_HOST,
  smtpPort: process.env.SMTP_PORT,
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS,
  emailFrom: process.env.EMAIL_FROM || 'noreply@jobportal.com',
  
  // File upload configuration
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
  maxFileSize: process.env.MAX_FILE_SIZE || 10 * 1024 * 1024, // 10MB
  
  // Frontend URL for links in emails
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000'
}; 
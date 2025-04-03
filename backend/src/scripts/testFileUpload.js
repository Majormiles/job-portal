const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Test function to verify Cloudinary configuration
const testCloudinaryConfig = () => {
  console.log('=== Testing Cloudinary Configuration ===');
  console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
  console.log('API Key:', process.env.CLOUDINARY_API_KEY ? 'Present' : 'Missing');
  console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? 'Present' : 'Missing');
  
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error('Missing Cloudinary configuration');
  }
  console.log('Cloudinary configuration is valid\n');
};

// Test function to verify uploads directory
const testUploadsDirectory = () => {
  console.log('=== Testing Uploads Directory ===');
  const uploadsDir = path.join(__dirname, '../../uploads');
  
  if (!fs.existsSync(uploadsDir)) {
    console.log('Creating uploads directory...');
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  // Test write permissions
  const testFile = path.join(uploadsDir, 'test.txt');
  try {
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
    console.log('Uploads directory is writable\n');
  } catch (error) {
    throw new Error(`Uploads directory is not writable: ${error.message}`);
  }
};

// Test function to verify file upload to Cloudinary
const testCloudinaryUpload = async () => {
  console.log('=== Testing Cloudinary Upload ===');
  
  // Create a test image
  const testImagePath = path.join(__dirname, '../../uploads/test-image.png');
  const testImageContent = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
  fs.writeFileSync(testImagePath, testImageContent, 'base64');
  
  try {
    console.log('Uploading test image to Cloudinary...');
    const result = await cloudinary.uploader.upload(testImagePath, {
      folder: 'job-portal/test',
      resource_type: 'auto'
    });
    
    console.log('Upload successful!');
    console.log('Public ID:', result.public_id);
    console.log('URL:', result.secure_url);
    console.log('Format:', result.format);
    
    // Clean up
    fs.unlinkSync(testImagePath);
    console.log('Test image deleted\n');
    
    return true;
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
};

// Main test function
const runTests = async () => {
  try {
    console.log('Starting file upload tests...\n');
    
    // Test Cloudinary configuration
    testCloudinaryConfig();
    
    // Test uploads directory
    testUploadsDirectory();
    
    // Test Cloudinary upload
    await testCloudinaryUpload();
    
    console.log('All tests passed successfully!');
  } catch (error) {
    console.error('\nTest failed:', error.message);
    process.exit(1);
  }
};

// Run the tests
runTests(); 
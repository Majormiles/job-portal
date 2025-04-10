import cloudinary from '../config/cloudinary.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function verifyCloudinaryConfig() {
  console.log('\n=== CLOUDINARY CONFIGURATION VERIFICATION ===\n');

  // 1. Check environment variables
  console.log('1. Checking environment variables:');
  const envVars = {
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET
  };

  Object.entries(envVars).forEach(([key, value]) => {
    console.log(`${key}: ${value ? '✓ Set' : '✗ Not set'}`);
  });

  // 2. Verify Cloudinary configuration
  console.log('\n2. Verifying Cloudinary configuration:');
  const config = cloudinary.config();
  console.log('Cloud name:', config.cloud_name || '✗ Not set');
  console.log('API Key:', config.api_key || '✗ Not set');
  console.log('API Secret:', config.api_secret ? '✓ Set' : '✗ Not set');

  // 3. Test Cloudinary connection
  console.log('\n3. Testing Cloudinary connection:');
  try {
    await cloudinary.api.ping();
    console.log('✓ Successfully connected to Cloudinary');
  } catch (error) {
    console.error('✗ Failed to connect to Cloudinary:', error.message);
  }

  // 4. Test file upload
  console.log('\n4. Testing file upload:');
  const testFilePath = path.join(__dirname, '../../test-files/test-image.jpg');
  
  // Create test file if it doesn't exist
  if (!fs.existsSync(testFilePath)) {
    console.log('Creating test file...');
    const testDir = path.dirname(testFilePath);
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    // Create a simple test image
    const testImage = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
    fs.writeFileSync(testFilePath, testImage);
  }

  try {
    const result = await cloudinary.uploader.upload(testFilePath, {
      folder: 'job-portal/test',
      resource_type: 'auto'
    });
    console.log('✓ Successfully uploaded test file');
    console.log('Upload result:', {
      url: result.secure_url,
      public_id: result.public_id
    });

    // Clean up test file
    fs.unlinkSync(testFilePath);
    console.log('✓ Cleaned up test file');

    // Clean up uploaded file from Cloudinary
    await cloudinary.uploader.destroy(result.public_id);
    console.log('✓ Cleaned up uploaded file from Cloudinary');
  } catch (error) {
    console.error('✗ Failed to upload test file:', error.message);
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
  }

  // 5. Final status
  console.log('\n=== VERIFICATION SUMMARY ===');
  const allPassed = Object.values(envVars).every(v => v) && 
                    config.cloud_name && 
                    config.api_key && 
                    config.api_secret;
  
  console.log(`Overall Status: ${allPassed ? '✓ All checks passed' : '✗ Some checks failed'}`);
  if (!allPassed) {
    console.log('\nPlease ensure all environment variables are set in your .env file:');
    console.log('CLOUDINARY_CLOUD_NAME=your_cloud_name');
    console.log('CLOUDINARY_API_KEY=your_api_key');
    console.log('CLOUDINARY_API_SECRET=your_api_secret');
  }
}

// Run the verification
verifyCloudinaryConfig(); 
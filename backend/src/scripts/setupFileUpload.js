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

const setup = async () => {
  try {
    console.log('\n=== Setting up file upload requirements ===\n');

    // 1. Check Cloudinary configuration
    console.log('1. Checking Cloudinary configuration...');
    const cloudinaryConfig = cloudinary.config();
    console.log('Cloudinary config:', {
      cloud_name: cloudinaryConfig.cloud_name,
      api_key: cloudinaryConfig.api_key ? 'Present' : 'Missing',
      api_secret: cloudinaryConfig.api_secret ? 'Present' : 'Missing'
    });

    // Verify Cloudinary credentials
    try {
      const result = await cloudinary.api.ping();
      console.log('✓ Cloudinary credentials verified:', result);
    } catch (error) {
      console.error('✗ Cloudinary credentials invalid:', error.message);
      process.exit(1);
    }

    // 2. Create and verify uploads directory
    console.log('\n2. Setting up uploads directory...');
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
      console.log('✓ Uploads directory is writable:', uploadsDir);
    } catch (error) {
      console.error('✗ Uploads directory is not writable:', error.message);
      process.exit(1);
    }

    // 3. Test Cloudinary upload
    console.log('\n3. Testing Cloudinary upload...');
    const testImagePath = path.join(uploadsDir, 'test-image.png');
    const testImageContent = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
    
    try {
      fs.writeFileSync(testImagePath, testImageContent, 'base64');
      const uploadResult = await cloudinary.uploader.upload(testImagePath, {
        folder: 'job-portal/test',
        resource_type: 'auto'
      });
      fs.unlinkSync(testImagePath);
      console.log('✓ Test upload successful:', uploadResult.secure_url);
    } catch (error) {
      console.error('✗ Test upload failed:', error.message);
      if (fs.existsSync(testImagePath)) {
        fs.unlinkSync(testImagePath);
      }
      process.exit(1);
    }

    console.log('\n=== Setup completed successfully ===\n');
  } catch (error) {
    console.error('\nSetup failed:', error.message);
    process.exit(1);
  }
};

setup(); 
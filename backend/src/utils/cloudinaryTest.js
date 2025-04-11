import cloudinary from './cloudinary.js';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

// Test Cloudinary connection
console.log('Testing Cloudinary Connection...');
console.log('Cloudinary Configuration:', {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_API_KEY ? 'Set (Hidden)' : 'Not Set',
  apiSecret: process.env.CLOUDINARY_API_SECRET ? 'Set (Hidden)' : 'Not Set'
});

// Ping Cloudinary
try {
  cloudinary.api.ping()
    .then(result => {
      console.log('Cloudinary Connection Success:', result);
    })
    .catch(error => {
      console.error('Cloudinary Connection Error:', error);
    });
} catch (error) {
  console.error('Cloudinary Connection Exception:', error);
}

export default async function testCloudinaryUpload() {
  try {
    // Test upload with a simple base64 image
    const testImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
    
    const uploadResult = await cloudinary.uploader.upload(testImage, {
      folder: 'job-portal/test',
    });
    
    console.log('Test upload successful:', uploadResult);
    
    // Clean up by deleting the test image
    await cloudinary.uploader.destroy(uploadResult.public_id);
    console.log('Test image deleted');
    
    return { success: true, result: uploadResult };
  } catch (error) {
    console.error('Test upload failed:', error);
    return { success: false, error };
  }
}

// Run the test if this file is executed directly
if (process.argv[1].includes('cloudinaryTest.js')) {
  console.log('Running Cloudinary test...');
  testCloudinaryUpload()
    .then(() => {
      console.log('Test completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('Test failed:', error);
      process.exit(1);
    });
} 
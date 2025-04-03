import { v2 as cloudinary } from 'cloudinary';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables if not already loaded
if (!process.env.CLOUDINARY_CLOUD_NAME) {
  const envPath = path.resolve(__dirname, '../../.env');
  dotenv.config({ path: envPath });
}

// Log environment variables for debugging
console.log('\n=== CLOUDINARY CONFIGURATION ===');
console.log('Loading Cloudinary configuration...');

// Verify environment variables
const requiredEnvVars = {
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET
};

const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error('Missing required environment variables:', missingVars.join(', '));
  throw new Error('Missing required Cloudinary environment variables');
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Verify configuration
const config = cloudinary.config();
console.log('Cloudinary configuration loaded successfully:');
console.log('Cloud name:', config.cloud_name);
console.log('API Key:', config.api_key);
console.log('API Secret:', config.api_secret ? '✓ Set' : '✗ Not set');

export default cloudinary; 
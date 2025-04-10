import mongoose from 'mongoose';
import User from '../models/user.model.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt from 'bcryptjs';

// Get the directory path of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env
dotenv.config({ path: join(__dirname, '../../.env') });

const createTestUser = async () => {
  try {
    console.log('=== CREATING TEST USER ===\n');

    // 1. Connect to MongoDB
    console.log('1. Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // 2. Create a test user
    console.log('\n2. Creating test user...');
    const hashedPassword = await bcrypt.hash('Test123!', 10);
    const testUser = await User.create({
      name: 'Test User For Deletion',
      email: 'test-ui-deletion@example.com',
      password: hashedPassword,
      role: 'user'
    });
    console.log('✅ Created test user:', {
      id: testUser._id,
      email: testUser.email,
      name: testUser.name
    });

    console.log('\nTest User Credentials:');
    console.log('Email: test-ui-deletion@example.com');
    console.log('Password: Test123!');

    console.log('\n=== TEST USER CREATED ===');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Creation failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

// Run the creation
createTestUser(); 
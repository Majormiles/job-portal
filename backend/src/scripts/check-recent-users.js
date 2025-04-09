import mongoose from 'mongoose';
import User from '../models/user.model.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory path of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env
dotenv.config({ path: join(__dirname, '../../.env') });

const checkRecentUsers = async () => {
  try {
    console.log('=== CHECKING RECENT USERS ===\n');

    // 1. Connect to MongoDB
    console.log('1. Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // 2. Get recent users
    const recentUsers = await User.find()
      .sort({ updatedAt: -1 })
      .limit(10);

    console.log('\nRecent Users:');
    recentUsers.forEach(user => {
      console.log({
        id: user._id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        isActive: user.isActive,
        lastLogin: user.lastLogin
      });
    });

    console.log('\n=== CHECK COMPLETED ===');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Check failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
};

// Run the check
checkRecentUsers(); 
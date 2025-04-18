import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Initialize dotenv
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/job-portal';
const JWT_SECRET = process.env.JWT_SECRET || 'secret123456789';

// Generate JWT Token function (copy of the one in auth controller)
const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

async function fixAdminAccess() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully!');

    // The email of the user to update
    const userEmail = 'major@gmail.com'; // Change this to your admin email
    
    // Find the user first
    const user = await mongoose.connection.db.collection('users').findOne({ email: userEmail });
    
    if (!user) {
      console.log(`User with email ${userEmail} not found.`);
      return;
    }
    
    console.log('Current user info:');
    console.log({
      _id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      isVerified: user.isVerified
    });
    
    // Update the user role directly in the database
    const result = await mongoose.connection.db.collection('users').updateOne(
      { email: userEmail },
      { $set: { 
        role: 'admin',
        isVerified: true
      } }
    );

    if (result.matchedCount === 0) {
      console.log(`User with email ${userEmail} not found.`);
    } else if (result.modifiedCount === 0) {
      console.log(`User ${userEmail} already has admin role and is verified.`);
    } else {
      console.log(`Successfully updated user ${userEmail} to admin role and set as verified!`);
    }

    // Get the updated user to verify
    const updatedUser = await mongoose.connection.db.collection('users').findOne({ email: userEmail });
    console.log('Updated user:', {
      _id: updatedUser._id.toString(),
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
      isVerified: updatedUser.isVerified
    });

    // Generate a fresh token
    const token = generateToken(updatedUser._id);
    
    console.log('\n--- IMPORTANT: COPY THIS TOKEN ---');
    console.log('Generated new admin token:', token);
    console.log('\nIn your browser console, run:');
    console.log(`localStorage.setItem('adminToken', '${token}');`);
    console.log('Then refresh the admin page.');
    console.log('--------------------------------');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

fixAdminAccess(); 
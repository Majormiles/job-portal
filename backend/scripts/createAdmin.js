import mongoose from 'mongoose';
import User from '../src/models/user.model.js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config();

// Function to create admin user
async function createAdminUser(email, password) {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('Connected to MongoDB successfully');
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      console.log(`User with email ${email} already exists`);
      
      // If user exists but is not an admin, update to admin
      if (existingUser.role !== 'admin') {
        existingUser.role = 'admin';
        await existingUser.save();
        console.log(`User ${email} updated to admin role`);
      } else {
        console.log(`User ${email} is already an admin`);
      }
    } else {
      // Create a new admin user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      const newAdmin = new User({
        name: 'Admin User',
        email: email,
        password: hashedPassword,
        role: 'admin',
        isVerified: true
      });
      
      await newAdmin.save();
      console.log(`Admin user created successfully with email: ${email}`);
    }
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

// Get email and password from command line arguments
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error('Please provide email and password arguments');
  console.log('Usage: node createAdmin.js <email> <password>');
  process.exit(1);
}

// Create admin user with provided credentials
createAdminUser(email, password); 
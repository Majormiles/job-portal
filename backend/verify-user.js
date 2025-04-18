import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import User from './src/models/user.model.js';

// Set up __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Function to verify a user by token
const verifyUserByToken = async (token) => {
  try {
    console.log('Looking for user with token:', token);
    
    const user = await User.findOne({
      verificationToken: token
    });

    if (!user) {
      console.log('User not found with this token');
      return false;
    }

    console.log('User found:', user.email);
    
    // Update user verification status
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();
    
    console.log('User successfully verified:', user.email);
    return true;
  } catch (error) {
    console.error('Error verifying user by token:', error);
    return false;
  }
};

// Function to verify a user by email
const verifyUserByEmail = async (email) => {
  try {
    console.log('Looking for user with email:', email);
    
    const user = await User.findOne({ email });

    if (!user) {
      console.log('User not found with this email');
      return false;
    }

    console.log('User found:', user.email);
    
    // Update user verification status
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();
    
    console.log('User successfully verified:', user.email);
    return true;
  } catch (error) {
    console.error('Error verifying user by email:', error);
    return false;
  }
};

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Main function
const main = async () => {
  // Get parameters from command line
  const args = process.argv.slice(2);
  let token = null;
  let email = null;
  
  // Parse arguments
  args.forEach(arg => {
    if (arg.startsWith('--token=')) {
      token = arg.split('=')[1];
    } else if (arg.startsWith('--email=')) {
      email = arg.split('=')[1];
    }
  });
  
  if (!token && !email) {
    console.log('Usage: node verify-user.js --token=<verification_token> OR --email=<user_email>');
    process.exit(1);
  }
  
  // Connect to the database
  await connectDB();
  
  let success = false;
  
  // Verify user based on provided parameters
  if (token) {
    success = await verifyUserByToken(token);
  } else if (email) {
    success = await verifyUserByEmail(email);
  }
  
  // Log result and exit
  if (success) {
    console.log('Verification successful!');
  } else {
    console.log('Verification failed.');
  }
  
  process.exit(0);
};

// Run the script
main(); 
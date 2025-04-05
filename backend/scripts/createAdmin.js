import mongoose from 'mongoose';
import User from '../src/models/user.model.js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config();

// Set MongoDB URI with fallback
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://major:Almighty0247466205@cluster0.bedjf.mongodb.net/';

console.log('Using MongoDB URI:', MONGODB_URI ? 'URI is defined' : 'URI is undefined');

// Function to create admin user
async function createAdminUser(email, password) {
  let mongoose_connection = null;
  try {
    // Connect to MongoDB
    console.log('Attempting to connect to MongoDB...');
    mongoose_connection = await mongoose.connect(MONGODB_URI, {
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
        
        // Ensure the user is verified
        existingUser.isVerified = true;
        
        // Update password if provided
        if (password) {
          const salt = await bcrypt.genSalt(10);
          existingUser.password = await bcrypt.hash(password, salt);
          console.log('Password updated for existing user');
        }
        
        await existingUser.save();
        console.log(`User ${email} updated to admin role`);
        
        // Verify the update by re-fetching the user
        const updatedUser = await User.findOne({ email });
        console.log('Updated user details:', {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          isVerified: updatedUser.isVerified
        });
      } else {
        console.log(`User ${email} is already an admin`);
        
        // Update password if provided (for password reset)
        if (password) {
          try {
            const salt = await bcrypt.genSalt(10);
            existingUser.password = await bcrypt.hash(password, salt);
            
            // Force Mongoose to run the pre-save hooks by marking the field as modified
            existingUser.markModified('password');
            
            await existingUser.save();
            console.log('Password updated for existing admin user');
            
            // Verify the password was saved correctly
            const refreshedUser = await User.findOne({ email }).select('+password');
            const testMatch = await bcrypt.compare(password, refreshedUser.password);
            console.log(`Immediate password verification: ${testMatch ? 'SUCCESS' : 'FAILED'}`);
          } catch (pwError) {
            console.error('Error updating password:', pwError);
          }
        }
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
      
      // Verify the creation by re-fetching the user
      const createdUser = await User.findOne({ email });
      console.log('Created admin details:', {
        id: createdUser._id,
        name: createdUser.name,
        email: createdUser.email,
        role: createdUser.role,
        isVerified: createdUser.isVerified
      });
    }
    
    // Test password match for verification
    console.log('Testing password verification...');
    const user = await User.findOne({ email }).select('+password');

    if (!user || !user.password) {
      console.error('User not found or password not set');
    } else {
      try {
        // Use bcrypt directly instead of the model method which might have issues
        const isMatch = await bcrypt.compare(password, user.password);
        
        console.log(`Password match test: ${isMatch ? 'PASSED ✓' : 'FAILED ✗'}`);
        
        if (!isMatch) {
          console.error('WARNING: The password was not set correctly. Please try again.');
          console.log('Raw password hash:', user.password);
        } else {
          console.log('The admin user is correctly set up and the password is valid.');
        }
      } catch (verifyError) {
        console.error('Error verifying password:', verifyError);
      }
    }
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
  } catch (error) {
    console.error('Error creating admin user:', error);
    
    if (error.name === 'ValidationError') {
      console.error('Validation errors:', error.errors);
    }
    
    try {
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB after error');
    } catch (disconnectError) {
      console.error('Error disconnecting from MongoDB:', disconnectError);
    }
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
console.log(`Attempting to create/update admin user with email: ${email}`);
createAdminUser(email, password); 
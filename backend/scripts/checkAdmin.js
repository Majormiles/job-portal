import mongoose from 'mongoose';
import User from '../src/models/user.model.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Function to check admin user
async function checkAdminUser(email) {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('Connected to MongoDB successfully');
    
    // Find the user
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`User with email ${email} not found in the database`);
      return;
    }
    
    console.log('User found:');
    console.log('---------------------------');
    console.log('ID:', user._id.toString());
    console.log('Name:', user.name);
    console.log('Email:', user.email);
    console.log('Role:', user.role);
    console.log('IsVerified:', user.isVerified);
    console.log('---------------------------');
    console.log('Full user object:', JSON.stringify(user, null, 2));
    console.log('---------------------------');
    
    // Make needed updates
    let updated = false;
    
    // Check if user is admin
    if (user.role !== 'admin') {
      console.log('This user is NOT an admin. Updating role to admin.');
      user.role = 'admin';
      updated = true;
    } else {
      console.log('This user is already an admin.');
    }
    
    // Check if user is verified
    if (!user.isVerified) {
      console.log('This user is NOT verified. Updating verified status.');
      user.isVerified = true;
      updated = true;
    } else {
      console.log('This user is already verified.');
    }
    
    // Save updates if needed
    if (updated) {
      await user.save();
      console.log('User updated successfully!');
      
      // Verify the updates
      const updatedUser = await User.findById(user._id);
      console.log('Updated user:', {
        role: updatedUser.role,
        isVerified: updatedUser.isVerified
      });
    } else {
      console.log('No updates needed.');
    }
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
  } catch (error) {
    console.error('Error checking admin user:', error);
  }
}

// Get email from command line arguments or use default
const email = process.argv[2] || 'major@gmail.com';

// Check admin user with provided or default email
checkAdminUser(email); 
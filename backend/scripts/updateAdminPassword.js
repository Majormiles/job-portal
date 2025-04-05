import mongoose from 'mongoose';
import User from '../src/models/user.model.js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config();

// Set MongoDB URI with fallback
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://major:Almighty0247466205@cluster0.bedjf.mongodb.net/';

console.log('Using MongoDB URI:', MONGODB_URI ? 'URI is defined' : 'URI is undefined');

// Function to update admin password directly
async function updateAdminPassword(email, passwordHash) {
  try {
    // Connect to MongoDB
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('Connected to MongoDB successfully');
    
    // Find the admin user
    const user = await User.findOne({ email, role: 'admin' });
    
    if (!user) {
      console.error(`Admin user with email ${email} not found`);
      return;
    }
    
    console.log(`Found admin user: ${user.name} (${user.email})`);
    
    // Update the password field directly using updateOne to bypass pre-save hooks
    const result = await User.updateOne(
      { _id: user._id },
      { 
        $set: { 
          password: passwordHash,
          // Ensure admin is properly set up
          role: 'admin',
          isVerified: true
        }
      }
    );
    
    console.log('Update result:', result);
    
    if (result.modifiedCount === 1) {
      console.log('Admin password updated successfully');
      
      // Test the password with direct comparison
      const updatedUser = await User.findOne({ email }).select('+password');
      const testPassword = 'Almighty'; // The original password before hashing
      
      try {
        const isMatch = await bcrypt.compare(testPassword, updatedUser.password);
        console.log(`Password verification test: ${isMatch ? 'PASSED ✓' : 'FAILED ✗'}`);
        
        if (isMatch) {
          console.log('The admin user password has been successfully updated!');
        } else {
          console.log('Password verification failed. Something went wrong with the hashing.');
        }
      } catch (error) {
        console.error('Error verifying password:', error);
      }
    } else {
      console.log('No changes were made to the user');
    }
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
  } catch (error) {
    console.error('Error updating admin password:', error);
    
    try {
      await mongoose.disconnect();
    } catch (err) {
      console.error('Error disconnecting from MongoDB:', err);
    }
  }
}

// The pre-generated password hash for 'Almighty'
const passwordHash = '$2a$10$K6cuMt1Cxe.UM4Oi1p73kunoeNAvJlkUSz7sc4oYDsWT3NbFtjLY6';
const email = process.argv[2] || 'major@gmail.com';

console.log(`Updating admin password for user: ${email}`);
updateAdminPassword(email, passwordHash); 
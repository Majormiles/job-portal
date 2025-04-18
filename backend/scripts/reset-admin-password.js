import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables with explicit path
dotenv.config({ path: path.join(__dirname, '../.env') });

// Set MongoDB URI with fallback
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://major:Almighty0247466205@cluster0.bedjf.mongodb.net/';

// Email and password from command line arguments or use defaults
const email = process.argv[2] || 'major@gmail.com';
const password = process.argv[3] || 'Almighty';

// Function to reset admin password
async function resetAdminPassword() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB at:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Dynamically import the User model
    const { default: User } = await import('../src/models/user.model.js');
    console.log('User model imported');

    // Find the user directly by email
    const user = await User.findOne({ email });

    if (!user) {
      console.error(`User with email ${email} not found`);
      return;
    }

    console.log(`Found user: ${user.name} (${user.email})`);
    console.log(`Current role: ${user.roleName}`);
    console.log(`Current role ID: ${user.role}`);

    // Set the new password directly
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Update without using save() to bypass validators
    const updateResult = await User.updateOne(
      { _id: user._id },
      { 
        $set: { 
          password: hashedPassword,
          isVerified: true
        }
      }
    );

    console.log(`Password update result: ${JSON.stringify(updateResult)}`);
    
    if (updateResult.modifiedCount > 0) {
      console.log(`Password successfully reset for ${email}`);
      console.log(`New password: ${password}`);
    } else {
      console.log('No changes were made to the password');
    }

    // Test login with new password
    const updatedUser = await User.findOne({ email }).select('+password');
    if (updatedUser) {
      const isMatch = await bcrypt.compare(password, updatedUser.password);
      console.log(`Password verification test: ${isMatch ? 'SUCCESS ✓' : 'FAILED ✗'}`);
    }

  } catch (error) {
    console.error('Error resetting password:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Execute the function
console.log(`Resetting password for ${email}...`);
resetAdminPassword(); 
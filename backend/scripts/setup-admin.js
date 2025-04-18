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
const email = process.argv[2] || 'admin@example.com';
const password = process.argv[3] || 'admin123';

// Function to create or update an admin user
async function setupAdminUser() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB at:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Dynamically import the User and Role models
    const { default: User } = await import('../src/models/user.model.js');
    const { default: Role } = await import('../src/models/role.model.js');
    console.log('Models imported successfully');

    // Find or create the admin role
    let adminRole = await Role.findOne({ name: 'admin' });
    
    if (!adminRole) {
      console.log('Admin role not found, creating it...');
      adminRole = await Role.create({
        name: 'admin',
        description: 'Administrator with full access',
        permissions: ['all'],
        isActive: true
      });
      console.log('Admin role created with ID:', adminRole._id);
    } else {
      console.log('Admin role found with ID:', adminRole._id);
    }

    // Check if admin user exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log(`User with email ${email} already exists`);
      
      // Update user to admin role if not already
      existingUser.roleName = 'admin';
      existingUser.role = adminRole._id; // Set role to the ObjectId of the admin role
      existingUser.isVerified = true;
      
      // Update password
      const salt = await bcrypt.genSalt(10);
      existingUser.password = await bcrypt.hash(password, salt);
      
      await existingUser.save();
      console.log(`User ${email} updated to admin role with new password`);
    } else {
      // Create a new admin user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      const newAdmin = new User({
        name: 'Admin User',
        email: email,
        password: hashedPassword,
        roleName: 'admin',
        role: adminRole._id, // Set role to the ObjectId of the admin role
        isVerified: true
      });
      
      await newAdmin.save();
      console.log(`Admin user created successfully with email: ${email}`);
    }
    
    // Verify user was created/updated properly
    const user = await User.findOne({ email }).select('+password').populate('role');
    if (!user) {
      console.error('User not found after creation');
    } else {
      const isMatch = await bcrypt.compare(password, user.password);
      console.log(`Password verification: ${isMatch ? 'SUCCESS ✓' : 'FAILED ✗'}`);
      
      if (isMatch) {
        console.log('Admin user is properly set up and can be used for login');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        console.log(`RoleName: ${user.roleName}`);
        console.log(`Role ID: ${user.role ? user.role._id : 'undefined'}`);
        console.log(`IsVerified: ${user.isVerified}`);
      }
    }
  } catch (error) {
    console.error('Error setting up admin user:', error);
    console.error('Error details:', error.stack);
    
    if (error.name === 'ValidationError') {
      console.error('Validation errors:', JSON.stringify(error.errors, null, 2));
    }
  } finally {
    // Close MongoDB connection
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Execute the function
console.log(`Setting up admin user with email: ${email}`);
setupAdminUser(); 
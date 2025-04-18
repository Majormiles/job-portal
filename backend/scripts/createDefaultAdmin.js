import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Initialize dotenv
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/job-portal';

async function createDefaultAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully!');

    // Default admin credentials
    const adminEmail = 'admin@jobportal.com';
    const adminPassword = 'Admin123!';
    const adminName = 'System Admin';
    
    // Check if admin already exists
    const existingAdmin = await mongoose.connection.db.collection('users').findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log(`Admin user ${adminEmail} already exists.`);
      
      // Update admin role to ensure it's set correctly
      await mongoose.connection.db.collection('users').updateOne(
        { email: adminEmail },
        { $set: { 
          role: 'admin',
          isVerified: true
        } }
      );
      
      console.log(`Ensured ${adminEmail} has admin role and is verified.`);
    } else {
      // Create new admin user
      // Generate password hash
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);
      
      // Create admin user
      const newAdmin = {
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await mongoose.connection.db.collection('users').insertOne(newAdmin);
      console.log(`Created new admin user ${adminEmail} with password ${adminPassword}`);
    }
    
    // Also check and update the requested user if exists
    const userEmail = 'major@gmail.com';
    const user = await mongoose.connection.db.collection('users').findOne({ email: userEmail });
    
    if (user) {
      await mongoose.connection.db.collection('users').updateOne(
        { email: userEmail },
        { $set: { 
          role: 'admin',
          isVerified: true
        } }
      );
      console.log(`Ensured ${userEmail} has admin role and is verified.`);
    }

    console.log('\n-- ADMIN LOGIN CREDENTIALS --');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    console.log('-----------------------------');
    console.log('You can now log in with these credentials on the admin login page.');
    console.log('This will always work regardless of browser or session.');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

createDefaultAdmin(); 
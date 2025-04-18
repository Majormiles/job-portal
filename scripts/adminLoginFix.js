import axios from 'axios';
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import inquirer from 'inquirer';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://major:Almighty0247466205@cluster0.bedjf.mongodb.net/';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

async function checkAdminAndFix() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully!');

    // The email of the admin user to check
    const userEmail = 'major@gmail.com'; // Change this to your admin email
    
    // Find the user in database
    const user = await mongoose.connection.db.collection('users').findOne({ email: userEmail });
    
    if (!user) {
      console.error(`User with email ${userEmail} not found in the database.`);
      return;
    }
    
    console.log('Current user info:');
    console.log({
      email: user.email,
      name: user.name,
      role: user.role,
      isVerified: user.isVerified
    });
    
    // Check if user already has admin role
    if (user.role === 'admin') {
      console.log(`User ${userEmail} already has admin role. Let's check authentication...`);
    } else {
      console.log(`User ${userEmail} has role '${user.role}'. Updating to 'admin'...`);
      
      // Update user role to admin
      await mongoose.connection.db.collection('users').updateOne(
        { email: userEmail },
        { $set: { role: 'admin' } }
      );
      
      console.log(`Updated role to 'admin' for user ${userEmail}`);
    }
    
    // Verify user is verified
    if (!user.isVerified) {
      console.log(`User ${userEmail} is not verified. Updating verification status...`);
      
      // Update verification status
      await mongoose.connection.db.collection('users').updateOne(
        { email: userEmail },
        { $set: { 
          isVerified: true,
          verificationToken: undefined,
          verificationTokenExpires: undefined
        } }
      );
      
      console.log(`Updated verification status for user ${userEmail}`);
    }
    
    // Ask for password for testing login
    const answers = await inquirer.prompt([
      {
        type: 'password',
        name: 'password',
        message: 'Enter your admin password to test login:',
        default: 'Almighty' // Change this to your admin password or remove the default
      }
    ]);
    
    // Test admin login
    try {
      console.log('Testing admin login...');
      const loginResponse = await axios.post(`${API_URL}/auth/login`, {
        email: userEmail,
        password: answers.password,
        isAdmin: true
      });
      
      if (loginResponse.data.success) {
        console.log('Admin login successful!');
        console.log('Admin token:', loginResponse.data.token.substring(0, 20) + '...');
        console.log('Admin user:', {
          name: loginResponse.data.user.name,
          email: loginResponse.data.user.email,
          role: loginResponse.data.user.role
        });
        
        console.log('\nFIX INSTRUCTIONS:');
        console.log('1. Open your browser console and run:');
        console.log(`localStorage.setItem('adminToken', '${loginResponse.data.token}');`);
        console.log('2. Then refresh the admin page.');
      } else {
        console.error('Admin login failed:', loginResponse.data.message);
      }
    } catch (error) {
      console.error('Error testing admin login:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

checkAdminAndFix(); 
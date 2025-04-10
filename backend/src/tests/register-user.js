const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/user.model');

async function registerUser() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    const mongoUri = process.env.MONGODB_URI;
    console.log('MongoDB URI:', mongoUri);
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Delete existing user if exists
    const email = 'markhasonn@gmail.com';
    await User.deleteOne({ email });
    console.log('Deleted existing user if any');

    // Create new user
    const userData = {
      name: 'Mark Hason',
      email: email,
      password: 'Almighty0247466205'
    };

    console.log('\nCreating new user:', {
      name: userData.name,
      email: userData.email,
      password: '***'
    });

    const user = await User.create(userData);
    console.log('✅ User created successfully');
    
    // Verify the user was created with hashed password
    const savedUser = await User.findOne({ email }).select('+password');
    console.log('\nVerifying user:', {
      id: savedUser._id,
      email: savedUser.email,
      name: savedUser.name,
      hasPassword: !!savedUser.password,
      passwordHash: savedUser.password
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

registerUser(); 
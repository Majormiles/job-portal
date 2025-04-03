const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');

async function checkUser() {
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

    // Find user
    const email = 'markhasonn@gmail.com';
    console.log(`\nLooking for user with email: ${email}`);
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log('✅ User found');
    console.log('User details:', {
      id: user._id,
      email: user.email,
      name: user.name,
      hasPassword: !!user.password
    });

    // Check password
    const password = 'Almighty0247466205';
    console.log('\nChecking password...');
    if (!user.password) {
      console.log('❌ No password hash stored for user');
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch ? '✅ Yes' : '❌ No');
    console.log('Stored password hash:', user.password);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkUser(); 
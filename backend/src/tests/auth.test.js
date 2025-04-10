const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const axios = require('axios');
const mongoose = require('mongoose');
const User = require('../models/user.model');

const API_URL = 'http://localhost:5000/api';

async function testAuth() {
  try {
    console.log('=== STARTING AUTH TEST ===');
    
    // 1. Test MongoDB Connection
    console.log('\n1. Testing MongoDB Connection...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    // 2. Test User Registration
    console.log('\n2. Testing User Registration...');
    const registerData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'testpassword123'
    };

    const registerResponse = await axios.post(`${API_URL}/auth/register`, registerData);
    console.log('Registration Response:', {
      success: registerResponse.data.success,
      hasToken: !!registerResponse.data.token,
      hasUser: !!registerResponse.data.user
    });

    // 3. Test User Login
    console.log('\n3. Testing User Login...');
    const loginData = {
      email: 'test@example.com',
      password: 'testpassword123'
    };

    const loginResponse = await axios.post(`${API_URL}/auth/login`, loginData);
    console.log('Login Response:', {
      success: loginResponse.data.success,
      hasToken: !!loginResponse.data.token,
      hasUser: !!loginResponse.data.user
    });

    // 4. Test Protected Route with Token
    console.log('\n4. Testing Protected Route...');
    const token = loginResponse.data.token;
    const protectedResponse = await axios.get(`${API_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('Protected Route Response:', {
      success: protectedResponse.data.success,
      hasUser: !!protectedResponse.data.data
    });

    // 5. Test Onboarding Status
    console.log('\n5. Testing Onboarding Status...');
    const onboardingResponse = await axios.get(`${API_URL}/users/onboarding-status`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('Onboarding Status Response:', {
      success: onboardingResponse.data.success,
      hasData: !!onboardingResponse.data.data
    });

    // 6. Cleanup - Delete Test User
    console.log('\n6. Cleaning up test data...');
    const testUser = await User.findOne({ email: 'test@example.com' });
    if (testUser) {
      await User.deleteOne({ _id: testUser._id });
      console.log('✅ Test user deleted');
    }

    console.log('\n=== AUTH TEST COMPLETED ===');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('Error details:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    }
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

// Run the test
testAuth(); 
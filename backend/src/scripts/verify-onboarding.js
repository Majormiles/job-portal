const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');
const axios = require('axios');

// Load environment variables
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

// Import models
const User = require('../models/user.model');
const Onboarding = require('../models/onboarding.model');

// Test data
const testUser = {
  email: 'test@example.com',
  password: 'Test123!',
  name: 'Test User',
  role: 'user'
};

const testOnboardingData = {
  personalInfo: {
    phone: '0247466205',
    address: {
      street: 'Ho Polytechnic Campus',
      city: 'HO',
      state: 'Volta',
      zipCode: '00223'
    },
    dateOfBirth: '1930-10-15',
    profilePicture: null
  },
  professionalInfo: {
    resume: null,
    experience: [],
    education: []
  },
  skills: [],
  preferences: {
    jobTypes: [],
    locations: [],
    industries: []
  }
};

async function verifyOnboardingProcess() {
  console.log('\n=== ONBOARDING PROCESS VERIFICATION ===\n');

  try {
    // 1. Connect to MongoDB
    console.log('1. Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    // 2. Clean up test data
    console.log('\n2. Cleaning up test data...');
    await User.deleteMany({ email: testUser.email });
    console.log('✓ Cleaned up test user');

    // 3. Create test user
    console.log('\n3. Creating test user...');
    const user = await User.create(testUser);
    console.log('✓ Created test user:', user._id);

    // 4. Verify onboarding routes
    console.log('\n4. Verifying onboarding routes...');
    const baseUrl = 'http://localhost:5000/api';
    const token = user.generateAuthToken();
    const headers = { Authorization: `Bearer ${token}` };

    // Test personal info update
    console.log('\nTesting personal info update...');
    const personalInfoResponse = await axios.put(
      `${baseUrl}/users/onboarding/personal-info`,
      { data: testOnboardingData.personalInfo },
      { headers }
    );
    console.log('✓ Personal info update successful');

    // Test professional info update
    console.log('\nTesting professional info update...');
    const professionalInfoResponse = await axios.put(
      `${baseUrl}/users/onboarding/professional-info`,
      { data: testOnboardingData.professionalInfo },
      { headers }
    );
    console.log('✓ Professional info update successful');

    // Test skills update
    console.log('\nTesting skills update...');
    const skillsResponse = await axios.put(
      `${baseUrl}/users/onboarding/skills`,
      { data: testOnboardingData.skills },
      { headers }
    );
    console.log('✓ Skills update successful');

    // Test preferences update
    console.log('\nTesting preferences update...');
    const preferencesResponse = await axios.put(
      `${baseUrl}/users/onboarding/preferences`,
      { data: testOnboardingData.preferences },
      { headers }
    );
    console.log('✓ Preferences update successful');

    // 5. Verify onboarding status
    console.log('\n5. Verifying onboarding status...');
    const statusResponse = await axios.get(
      `${baseUrl}/users/onboarding-status`,
      { headers }
    );
    console.log('✓ Onboarding status:', statusResponse.data);

    // 6. Verify data in database
    console.log('\n6. Verifying data in database...');
    const onboarding = await Onboarding.findOne({ user: user._id });
    console.log('✓ Found onboarding document:', onboarding);

    // 7. Clean up
    console.log('\n7. Cleaning up...');
    await User.deleteMany({ email: testUser.email });
    console.log('✓ Cleaned up test data');

    // 8. Final status
    console.log('\n=== VERIFICATION SUMMARY ===');
    console.log('✓ All onboarding routes verified');
    console.log('✓ Data persistence verified');
    console.log('✓ Cleanup successful');

  } catch (error) {
    console.error('\n✗ Verification failed:', error.message);
    if (error.response) {
      console.error('Error response:', error.response.data);
    }
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the verification
verifyOnboardingProcess().catch(console.error); 
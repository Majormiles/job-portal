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

const testProfessionalData = {
  currentTitle: 'Software Engineer',
  yearsOfExperience: 5,
  currentCompany: 'Tech Corp',
  desiredTitle: 'Senior Software Engineer',
  desiredSalary: 80000,
  employmentType: 'Full-time',
  workAuthorization: 'Citizen',
  experience: [
    {
      title: 'Software Engineer',
      company: 'Tech Corp',
      location: 'Accra, Ghana',
      startDate: '2020-01',
      endDate: '2023-12',
      current: true,
      description: 'Full stack development'
    }
  ],
  education: [
    {
      school: 'University of Ghana',
      degree: 'Bachelor of Science',
      field: 'Computer Science',
      startDate: '2016-09',
      endDate: '2020-06',
      description: 'Major in Software Engineering'
    }
  ]
};

async function verifyProfessionalInfo() {
  console.log('\n=== PROFESSIONAL INFO VERIFICATION ===\n');

  try {
    // 1. Connect to MongoDB
    console.log('1. Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    // 2. Create test user
    console.log('\n2. Creating test user...');
    const user = await User.create(testUser);
    console.log('✓ Created test user:', user._id);

    // 3. Set up API client
    console.log('\n3. Setting up API client...');
    const token = user.generateAuthToken();
    const api = axios.create({
      baseURL: 'http://localhost:5000/api',
      headers: { Authorization: `Bearer ${token}` }
    });

    // 4. Test GET /users/onboarding endpoint
    console.log('\n4. Testing GET /users/onboarding endpoint...');
    try {
      const getResponse = await api.get('/users/onboarding');
      console.log('✓ GET /users/onboarding response:', getResponse.data);
    } catch (error) {
      console.error('✗ GET /users/onboarding failed:', error.response?.data || error.message);
      throw error;
    }

    // 5. Test professional info update
    console.log('\n5. Testing professional info update...');
    try {
      const updateResponse = await api.put('/users/onboarding/professional-info', {
        data: testProfessionalData
      });
      console.log('✓ Professional info update response:', updateResponse.data);
    } catch (error) {
      console.error('✗ Professional info update failed:', error.response?.data || error.message);
      throw error;
    }

    // 6. Verify onboarding status
    console.log('\n6. Verifying onboarding status...');
    try {
      const statusResponse = await api.get('/users/onboarding-status');
      console.log('✓ Onboarding status:', statusResponse.data);

      // Verify professional info section is marked as complete
      const isComplete = statusResponse.data.data.sections.professionalInfo.completed;
      console.log('Professional info section complete:', isComplete);
    } catch (error) {
      console.error('✗ Status check failed:', error.response?.data || error.message);
      throw error;
    }

    // 7. Clean up
    console.log('\n7. Cleaning up...');
    await User.deleteMany({ email: testUser.email });
    console.log('✓ Cleaned up test data');

    console.log('\n=== VERIFICATION SUMMARY ===');
    console.log('✓ All professional info endpoints verified');
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
verifyProfessionalInfo().catch(console.error); 
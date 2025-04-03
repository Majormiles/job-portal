import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const verifyDashboardFrontend = async () => {
  console.log('\n=== DASHBOARD FRONTEND VERIFICATION ===');
  
  // Check for auth token
  const token = process.env.AUTH_TOKEN;
  if (!token) {
    console.error('❌ No auth token found in environment variables');
    return;
  }
  console.log('✓ Auth token found');

  // Create axios instance with auth headers
  const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  try {
    // Test 1: Verify onboarding status endpoint
    console.log('\nTesting onboarding status endpoint...');
    const onboardingStatus = await api.get('/users/onboarding-status');
    console.log('✓ Onboarding status endpoint working');
    console.log('Response:', onboardingStatus.data);

    // Test 2: Verify user profile endpoint
    console.log('\nTesting user profile endpoint...');
    const userProfile = await api.get('/users/me');
    console.log('✓ User profile endpoint working');
    console.log('Response:', userProfile.data);

    // Test 3: Verify job recommendations endpoint
    console.log('\nTesting job recommendations endpoint...');
    const jobRecommendations = await api.get('/jobs/recommendations');
    console.log('✓ Job recommendations endpoint working');
    console.log('Response:', jobRecommendations.data);

    // Test 4: Verify application status endpoint
    console.log('\nTesting application status endpoint...');
    const applicationStatus = await api.get('/applications/status');
    console.log('✓ Application status endpoint working');
    console.log('Response:', applicationStatus.data);

    console.log('\n=== DASHBOARD VERIFICATION COMPLETE ===');
    console.log('✓ All endpoints verified successfully');
  } catch (error) {
    console.error('\n❌ Error during verification:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
};

// Run verification
verifyDashboardFrontend(); 
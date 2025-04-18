import axios from 'axios';

/**
 * Test script to verify the applications API endpoint
 * Run this script with Node.js to check if the API is working correctly
 */

// API base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Admin token - you'll need to replace this with a valid token
const ADMIN_TOKEN = 'YOUR_ADMIN_TOKEN';

// Create an axios instance for testing
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${ADMIN_TOKEN}`
  }
});

// Test parameters
const testParams = {
  page: 1,
  limit: 10,
  sortBy: 'createdAt',
  sortOrder: 'desc',
  noPopulate: true,
  strictPopulate: false
};

// Function to test the applications API
const testApplicationsAPI = async () => {
  console.log('Testing applications API with params:', testParams);
  
  try {
    // Test the /applications endpoint
    const response = await api.get('/applications', { params: testParams });
    
    console.log('API test successful!');
    console.log('Status:', response.status);
    console.log('Data count:', response.data.data?.length || 'No data array found');
    
    return true;
  } catch (error) {
    console.error('API test failed!');
    console.error('Status:', error.response?.status);
    console.error('Error message:', error.response?.data?.message || error.message);
    console.error('Error details:', error.response?.data?.error || 'No detailed error');
    
    return false;
  }
};

// Run the test
testApplicationsAPI()
  .then(success => {
    console.log(`Test completed with ${success ? 'SUCCESS' : 'FAILURE'}`);
  })
  .catch(err => {
    console.error('Test execution error:', err);
  });

// Export the test function for use in other scripts
export default testApplicationsAPI; 
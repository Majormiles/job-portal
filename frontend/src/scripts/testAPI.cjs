// Test script to verify API connections (CommonJS version)
const axios = require('axios');
const process = require('process');

// API base URL
const API_URL = 'http://localhost:5000/api';

// Admin token - should be passed as an argument
const adminToken = process.argv[2] || '';

if (!adminToken) {
  console.error('Error: Admin token is required. Usage: node testAPI.cjs <admin_token>');
  process.exit(1);
}

// Create an axios instance for testing
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`
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
  console.log('\n========== TESTING APPLICATIONS API ==========');
  console.log('URL:', `${API_URL}/applications`);
  console.log('Params:', JSON.stringify(testParams, null, 2));
  console.log('------------------------------------------------');
  
  try {
    // Test the /applications endpoint
    const response = await api.get('/applications', { params: testParams });
    
    console.log('✅ SUCCESS!');
    console.log('Status:', response.status);
    console.log('Data count:', response.data.data?.length || 'No data array found');
    console.log('Total count:', response.data.totalCount || response.data.total || 'Not provided');
    console.log('------------------------------------------------');
    
    return true;
  } catch (error) {
    console.error('❌ FAILED!');
    console.error('Status:', error.response?.status);
    console.error('Error message:', error.response?.data?.message || error.message);
    console.error('Error details:', error.response?.data?.error || 'No detailed error');
    console.error('------------------------------------------------');
    
    return false;
  }
};

// Function to test a direct applications API call without using services
const testDirectAPICall = async () => {
  console.log('\n========== TESTING DIRECT API CALL ==========');
  console.log('URL:', `${API_URL}/applications?strictPopulate=false&noPopulate=true`);
  console.log('------------------------------------------------');
  
  try {
    // Test with a direct API call with parameters in the URL
    const response = await axios.get(
      `${API_URL}/applications?strictPopulate=false&noPopulate=true&page=1&limit=10`, 
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        }
      }
    );
    
    console.log('✅ SUCCESS!');
    console.log('Status:', response.status);
    console.log('Data count:', response.data.data?.length || 'No data array found');
    console.log('------------------------------------------------');
    
    return true;
  } catch (error) {
    console.error('❌ FAILED!');
    console.error('Status:', error.response?.status);
    console.error('Error message:', error.response?.data?.message || error.message);
    console.error('Error details:', error.response?.data?.error || 'No detailed error');
    console.error('------------------------------------------------');
    
    return false;
  }
};

// Run all tests
async function runAllTests() {
  console.log('Starting API tests...');
  
  const results = {
    applications: await testApplicationsAPI(),
    directCall: await testDirectAPICall()
  };
  
  console.log('\n========== TEST SUMMARY ==========');
  console.log('Applications API:', results.applications ? '✅ PASS' : '❌ FAIL');
  console.log('Direct API Call:', results.directCall ? '✅ PASS' : '❌ FAIL');
  console.log('===================================');
  
  if (results.applications && results.directCall) {
    console.log('✅ All tests passed successfully!');
    return 0;
  } else {
    console.error('❌ Some tests failed. Please check the output above.');
    return 1;
  }
}

// Execute all tests
runAllTests()
  .then(exitCode => {
    process.exit(exitCode);
  })
  .catch(error => {
    console.error('Error running tests:', error);
    process.exit(1);
  }); 
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testLogin() {
  console.log('=== Starting Login Test ===');
  
  try {
    // Test 1: Login with valid credentials
    console.log('\nTest 1: Login with valid credentials');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'markhasonn@gmail.com',
      password: 'Almighty0247466205' // Using the actual password
    });
    
    console.log('Login Response:', {
      success: loginResponse.data.success,
      hasToken: !!loginResponse.data.token,
      hasUser: !!loginResponse.data.user
    });
    
    if (loginResponse.data.success && loginResponse.data.token) {
      console.log('✅ Login successful');
      
      // Test 2: Verify token works for protected route
      console.log('\nTest 2: Verify token with protected route');
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
      
      if (protectedResponse.data.success) {
        console.log('✅ Protected route access successful');
      }
    }
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('Error details:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    }
  }
}

// Run the test
testLogin(); 
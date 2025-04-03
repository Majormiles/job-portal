import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

export const testEmailVerification = async () => {
  const results = {
    success: false,
    steps: [],
    errors: []
  };

  try {
    // Step 1: Test frontend environment
    results.steps.push({
      name: 'Frontend Environment',
      status: 'success',
      details: {
        apiUrl: API_URL,
        hasApiUrl: !!API_URL
      }
    });

    // Step 2: Test API URL using a public endpoint
    try {
      const response = await axios.get(`${API_URL}/auth/config`);
      results.steps.push({
        name: 'API Health Check',
        status: 'success',
        details: response.data
      });
    } catch (error) {
      results.steps.push({
        name: 'API Health Check',
        status: 'error',
        details: error.response?.data || error.message
      });
      results.errors.push('API is not accessible');
      return results;
    }

    // Step 3: Register a test user
    const testUser = {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'Test123!@#'
    };

    try {
      const registerResponse = await axios.post(`${API_URL}/auth/register`, testUser);
      results.steps.push({
        name: 'User Registration',
        status: 'success',
        details: {
          email: testUser.email,
          userId: registerResponse.data.user.id
        }
      });

      // Step 4: Test email verification
      const verificationToken = registerResponse.data.user.verificationToken;
      if (!verificationToken) {
        throw new Error('No verification token received');
      }

      try {
        const verifyResponse = await axios.get(`${API_URL}/auth/verify-email?token=${verificationToken}`);
        results.steps.push({
          name: 'Email Verification',
          status: 'success',
          details: verifyResponse.data
        });
      } catch (error) {
        results.steps.push({
          name: 'Email Verification',
          status: 'error',
          details: error.response?.data || error.message
        });
        results.errors.push('Email verification failed');
      }

      // Step 5: Test resend verification
      try {
        const resendResponse = await axios.post(`${API_URL}/auth/resend-verification`, {
          email: testUser.email
        });
        results.steps.push({
          name: 'Resend Verification',
          status: 'success',
          details: resendResponse.data
        });
      } catch (error) {
        results.steps.push({
          name: 'Resend Verification',
          status: 'error',
          details: error.response?.data || error.message
        });
        results.errors.push('Resend verification failed');
      }

    } catch (error) {
      results.steps.push({
        name: 'User Registration',
        status: 'error',
        details: error.response?.data || error.message
      });
      results.errors.push('User registration failed');
    }

    // Set overall success based on critical steps
    results.success = results.steps.every(step => step.status === 'success');

  } catch (error) {
    results.steps.push({
      name: 'Overall Test',
      status: 'error',
      details: error.message
    });
    results.errors.push('Test failed with unexpected error');
  }

  return results;
}; 
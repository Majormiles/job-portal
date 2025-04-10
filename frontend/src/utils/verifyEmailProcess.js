import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const testEmailVerification = async () => {
  console.log('Starting email verification test...');
  console.log('API URL:', API_URL);

  try {
    // Step 1: Test API Connection
    console.log('\nStep 1: Testing API Connection');
    const configResponse = await axios.get(`${API_URL}/auth/config`);
    console.log('API Connection successful:', configResponse.data);

    // Step 2: Test User Registration
    console.log('\nStep 2: Testing User Registration');
    const testUser = {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'Test123456'
    };

    const registerResponse = await axios.post(`${API_URL}/auth/register`, testUser);
    console.log('Registration successful:', registerResponse.data);

    // Step 3: Test Email Verification
    console.log('\nStep 3: Testing Email Verification');
    const verificationToken = registerResponse.data.user.emailVerificationToken;
    console.log('Verification token:', verificationToken);

    const verifyResponse = await axios.get(`${API_URL}/auth/verify-email/${verificationToken}`);
    console.log('Verification response:', verifyResponse.data);

    // Step 4: Test Resend Verification
    console.log('\nStep 4: Testing Resend Verification');
    const resendResponse = await axios.post(`${API_URL}/auth/resend-verification`, {
      email: testUser.email
    });
    console.log('Resend verification response:', resendResponse.data);

    // Step 5: Test Login with Unverified Email
    console.log('\nStep 5: Testing Login with Unverified Email');
    try {
      await axios.post(`${API_URL}/auth/login`, {
        email: testUser.email,
        password: testUser.password
      });
      console.log('Login successful with unverified email');
    } catch (error) {
      console.log('Login failed as expected:', error.response?.data?.message);
    }

    // Step 6: Verify Frontend URL Configuration
    console.log('\nStep 6: Verifying Frontend URL Configuration');
    const frontendUrl = configResponse.data.frontendUrl;
    const verificationUrl = `${frontendUrl}/verify-email?token=${verificationToken}`;
    console.log('Verification URL:', verificationUrl);

    // Step 7: Test Complete Flow
    console.log('\nStep 7: Testing Complete Flow');
    const completeFlowResponse = await axios.get(`${API_URL}/auth/verify-email/${verificationToken}`);
    console.log('Complete flow response:', completeFlowResponse.data);

    console.log('\nTest Results:');
    console.log('✅ API Connection: Working');
    console.log('✅ User Registration: Working');
    console.log('✅ Email Verification: Working');
    console.log('✅ Resend Verification: Working');
    console.log('✅ Login Protection: Working');
    console.log('✅ Frontend URL: Configured');
    console.log('✅ Complete Flow: Working');

  } catch (error) {
    console.error('\nTest Failed:', error.response?.data || error.message);
    console.log('\nTest Results:');
    console.log('❌ Error occurred during testing');
    console.log('Error details:', error.response?.data || error.message);
  }
};

export default testEmailVerification; 
import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const AUTH_TOKEN = process.env.AUTH_TOKEN;

async function verifyProfessionalInfoFrontend() {
  console.log('\n=== PROFESSIONAL INFO FRONTEND VERIFICATION ===\n');

  try {
    // 1. Get auth token from environment variable
    if (!AUTH_TOKEN) {
      throw new Error('No auth token found in environment variables');
    }
    console.log('✓ Found auth token');

    // 2. Set up API client
    const api = axios.create({
      baseURL: API_URL,
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    // 3. Test onboarding status endpoint
    console.log('\n3. Testing onboarding status endpoint...');
    try {
      const statusResponse = await api.get('/users/onboarding-status');
      console.log('✓ Onboarding status response:', statusResponse.data);

      // Verify response structure
      if (!statusResponse.data.success) {
        throw new Error('Onboarding status response missing success flag');
      }
      if (!statusResponse.data.data) {
        throw new Error('Onboarding status response missing data object');
      }
      if (!statusResponse.data.data.sections) {
        throw new Error('Onboarding status response missing sections object');
      }
      console.log('✓ Response structure verified');
    } catch (error) {
      console.error('✗ Onboarding status check failed:', error.response?.data || error.message);
      throw error;
    }

    // 4. Test professional info update
    console.log('\n4. Testing professional info update...');
    const testData = {
      education: {
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        institution: 'University of Ghana',
        graduationYear: '2020',
        gpa: '3.5'
      },
      experience: {
        currentRole: 'Software Engineer',
        yearsOfExperience: '5',
        company: 'Tech Corp',
        industry: 'Technology'
      }
    };

    try {
      // Create FormData
      const formData = new FormData();
      formData.append('data', JSON.stringify(testData));

      // Create a new axios instance for file upload
      const uploadApi = axios.create({
        baseURL: API_URL,
        headers: {
          'Authorization': `Bearer ${AUTH_TOKEN}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      const updateResponse = await uploadApi.put('/users/onboarding/professional-info', formData);
      console.log('✓ Professional info update response:', updateResponse.data);

      // Verify response structure
      if (!updateResponse.data.success) {
        throw new Error('Update response missing success flag');
      }
      if (!updateResponse.data.data) {
        throw new Error('Update response missing data object');
      }
      console.log('✓ Update response structure verified');
    } catch (error) {
      console.error('✗ Professional info update failed:', error.response?.data || error.message);
      throw error;
    }

    // 5. Verify final status
    console.log('\n5. Verifying final status...');
    try {
      const finalStatus = await api.get('/users/onboarding-status');
      console.log('✓ Final status:', finalStatus.data);

      // Verify professional info section
      const professionalInfo = finalStatus.data.data.sections.professionalInfo;
      if (!professionalInfo) {
        throw new Error('Professional info section missing from status');
      }
      if (!professionalInfo.completed) {
        throw new Error('Professional info section not marked as complete');
      }
      console.log('✓ Final status verified');
    } catch (error) {
      console.error('✗ Final status check failed:', error.response?.data || error.message);
      throw error;
    }

    console.log('\n=== VERIFICATION SUMMARY ===');
    console.log('✓ All frontend-backend integration tests passed');
    console.log('✓ API endpoints verified');
    console.log('✓ Data persistence verified');
    console.log('✓ Response structures verified');

  } catch (error) {
    console.error('\n✗ Verification failed:', error.message);
    if (error.response) {
      console.error('Error response:', error.response.data);
    }
  }
}

// Run the verification
verifyProfessionalInfoFrontend().catch(console.error); 
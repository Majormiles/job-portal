import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const AUTH_TOKEN = process.env.AUTH_TOKEN;

async function verifySkillsFrontend() {
  console.log('\n=== SKILLS FRONTEND VERIFICATION ===\n');

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

    // 4. Test skills update
    console.log('\n4. Testing skills update...');
    const testData = {
      technicalSkills: ['JavaScript', 'React', 'Node.js', 'Python'],
      softSkills: ['Communication', 'Leadership', 'Problem Solving'],
      certifications: ['AWS Certified Developer', 'Google Cloud Professional'],
      languages: ['English', 'French']
    };

    try {
      const updateResponse = await api.put('/users/onboarding/skills', { data: testData });
      console.log('✓ Skills update response:', updateResponse.data);

      // Verify response structure
      if (!updateResponse.data.success) {
        throw new Error('Update response missing success flag');
      }
      if (!updateResponse.data.data) {
        throw new Error('Update response missing data object');
      }
      console.log('✓ Update response structure verified');
    } catch (error) {
      console.error('✗ Skills update failed:', error.response?.data || error.message);
      throw error;
    }

    // 5. Verify final status
    console.log('\n5. Verifying final status...');
    try {
      const finalStatus = await api.get('/users/onboarding-status');
      console.log('✓ Final status:', finalStatus.data);

      // Verify skills section
      const skills = finalStatus.data.data.sections.skills;
      if (!skills) {
        throw new Error('Skills section missing from status');
      }
      if (!skills.completed) {
        throw new Error('Skills section not marked as complete');
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
verifySkillsFrontend().catch(console.error); 
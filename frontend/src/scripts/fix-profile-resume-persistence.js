const axios = require('axios');
require('dotenv').config();

// Create API client
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

async function fixProfilePicture(userId, token) {
  try {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const response = await api.get(`/users/${userId}`);
    const user = response.data;

    if (user.profileImage && !user.profileImage.startsWith('http')) {
      const updatedProfileImage = `${process.env.REACT_APP_API_URL}/${user.profileImage}`;
      await api.patch(`/users/${userId}`, {
        profileImage: updatedProfileImage
      });
      console.log('✅ Fixed profile image URL');
      return true;
    }
    console.log('No profile image to fix');
    return true;
  } catch (error) {
    console.error('❌ Error fixing profile image:', error.message);
    return false;
  }
}

async function fixResume(userId, token) {
  try {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const response = await api.get(`/users/${userId}`);
    const user = response.data;

    if (user.resume && !user.resume.startsWith('http')) {
      const updatedResume = `${process.env.REACT_APP_API_URL}/${user.resume}`;
      await api.patch(`/users/${userId}`, {
        resume: updatedResume
      });
      console.log('✅ Fixed resume URL');
      return true;
    }
    console.log('No resume to fix');
    return true;
  } catch (error) {
    console.error('❌ Error fixing resume:', error.message);
    return false;
  }
}

async function main() {
  try {
    // Get token from environment variable
    const token = process.env.AUTH_TOKEN;
    if (!token) {
      console.error('❌ Error: AUTH_TOKEN environment variable is not set');
      console.log('Please set your authentication token in the .env file');
      process.exit(1);
    }

    // Set authorization header
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    // Get current user data
    console.log('🔍 Fetching user data...');
    const response = await api.get('/users/onboarding-status');
    
    if (!response.data.success) {
      console.error('❌ Failed to fetch user data');
      process.exit(1);
    }

    const userData = response.data.data;
    console.log('✅ Found user data to process');

    // Fix profile picture and resume
    console.log('\n🔧 Starting fixes...');
    const profileFixed = await fixProfilePicture(userData._id, token);
    const resumeFixed = await fixResume(userData._id, token);

    // Print summary
    console.log('\n📋 Fix Summary');
    console.log('-------------');
    if (profileFixed) {
      console.log('✅ Profile picture check completed');
    } else {
      console.log('❌ Profile picture fix failed');
    }
    if (resumeFixed) {
      console.log('✅ Resume check completed');
    } else {
      console.log('❌ Resume fix failed');
    }
    console.log('-------------\n');

    if (profileFixed && resumeFixed) {
      console.log('✅ All fixes completed successfully');
    } else {
      console.log('⚠️ Some fixes failed');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    process.exit(1);
  }
}

// Run the script
main(); 
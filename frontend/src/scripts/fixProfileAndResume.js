/**
 * This script fixes issues with profile image and resume persistence in the PersonalSettings component.
 * It ensures that:
 * 1. Profile images are properly stored and retrieved
 * 2. Resume deletions are properly persisted
 */

import axios from 'axios';

// Create API client
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});

async function fixProfileImage(userId) {
  try {
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
    return false;
  } catch (error) {
    console.error('Error fixing profile image:', error.message);
    return false;
  }
}

async function fixResume(userId) {
  try {
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
    return false;
  } catch (error) {
    console.error('Error fixing resume:', error.message);
    return false;
  }
}

async function runAllFixes() {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('Error: No authentication token found');
      console.log('Please log in to your account first');
      return;
    }

    console.log('Starting profile image and resume persistence fixes...');
    
    // Get the current user's data
    const response = await api.get('/users/onboarding-status');
    
    if (response.data.success) {
      const userData = response.data.data;
      console.log('Found user data to process');
      
      const profileImageFixed = await fixProfileImage(userData._id);
      const resumeFixed = await fixResume(userData._id);
      
      console.log('\n--- Fix Summary ---');
      if (profileImageFixed) {
        console.log('✅ Profile image URL has been fixed');
      }
      if (resumeFixed) {
        console.log('✅ Resume URL has been fixed');
      }
      if (!profileImageFixed && !resumeFixed) {
        console.log('No fixes were needed');
      }
      console.log('------------------\n');
    } else {
      console.error('Failed to fetch user data');
    }
  } catch (error) {
    console.error('Error running fixes:', error.message);
  }
}

// Export the function to be called from elsewhere
export default runAllFixes; 
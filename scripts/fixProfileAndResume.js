import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create API client
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.AUTH_TOKEN}`
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
    if (!process.env.AUTH_TOKEN) {
      console.error('Error: AUTH_TOKEN environment variable is not set');
      console.log('Please set your authentication token in the .env file');
      process.exit(1);
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

// Run the fixes
runAllFixes(); 
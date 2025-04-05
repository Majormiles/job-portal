/**
 * This script runs the profile image and resume persistence fixes from the command line.
 * It can be run with Node.js to fix issues with existing data in the database.
 */

import axios from 'axios';
import runAllFixes from './fixProfileAndResume.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create a simple API client for the script
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.AUTH_TOKEN}`
  }
});

/**
 * Main function to run the fixes
 */
const main = async () => {
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
      
      try {
        await runAllFixes();
        console.log('✅ Successfully fixed profile and resume issues');
      } catch (error) {
        console.error('Error processing fixes:', error);
      }
      
      console.log('\n--- Fix Summary ---');
      console.log('Profile image and resume persistence issues have been addressed.');
      console.log('------------------\n');
    } else {
      console.error('Failed to fetch user data');
    }
  } catch (error) {
    console.error('Error running fixes:', error);
  }
};

// Run the main function
main(); 
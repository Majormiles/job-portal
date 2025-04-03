import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Get the directory path of the current file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file in the frontend directory
const envPath = join(__dirname, '../../.env');
console.log('Loading .env file from:', envPath);

try {
  const envConfig = dotenv.parse(fs.readFileSync(envPath));
  console.log('Environment loaded successfully');
  
  const API_URL = envConfig.REACT_APP_API_URL || 'http://localhost:5000/api';
  const AUTH_TOKEN = envConfig.AUTH_TOKEN;

  async function verifyAuthFlow() {
    console.log('=== AUTH FLOW VERIFICATION ===');
    console.log('API URL:', API_URL);
    
    // Step 1: Check if we have a token
    console.log('Current token:', AUTH_TOKEN ? 'Token exists' : 'No token found');

    if (!AUTH_TOKEN) {
      console.log('❌ No token found in environment variables');
      return;
    }

    // Step 2: Create API instance with token
    const api = axios.create({
      baseURL: API_URL,
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    try {
      // Step 3: Verify token by fetching user profile
      console.log('\nVerifying user profile...');
      const profileResponse = await api.get('/users/me');
      console.log('✅ User profile:', profileResponse.data.data);

      // Step 4: Check onboarding status
      console.log('\nChecking onboarding status...');
      const onboardingResponse = await api.get('/users/onboarding-status');
      console.log('✅ Onboarding status:', onboardingResponse.data.data);

      // Step 5: Verify onboarding sections
      const status = onboardingResponse.data.data;
      const sections = ['personalInfo', 'professionalInfo', 'skills', 'preferences'];
      
      console.log('\nVerifying onboarding sections:');
      sections.forEach(section => {
        const sectionStatus = status.sections?.[section];
        console.log(`${section}: ${sectionStatus?.completed ? '✅ Complete' : '❌ Incomplete'}`);
      });

      // Step 6: Check if user should be redirected
      if (status.isComplete) {
        console.log('\n✅ Onboarding is complete, user should be on dashboard');
      } else {
        console.log('\n❌ Onboarding is incomplete, user should be in onboarding flow');
        // Find first incomplete section
        const incompleteSection = sections.find(section => !status.sections?.[section]?.completed);
        if (incompleteSection) {
          console.log(`First incomplete section: ${incompleteSection}`);
        }
      }

    } catch (error) {
      console.error('\n❌ Error during verification:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        console.log('Token is invalid or expired');
      }
    }
  }

  // Run verification
  verifyAuthFlow();
} catch (error) {
  console.error('Error loading environment:', error);
  process.exit(1);
} 
// Script to obtain a fresh admin token
const axios = require('axios');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

// API base URL
const API_URL = 'http://localhost:5000/api';

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to prompt for input
const prompt = (question) => new Promise((resolve) => rl.question(question, resolve));

async function getAdminToken() {
  console.log('=== Admin Login ===');
  
  try {
    // Get email and password
    const email = await prompt('Enter admin email: ');
    const password = await prompt('Enter admin password: ');
    
    console.log('\nAttempting to login...');
    
    // Try to login
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password
    });
    
    if (response.data && response.data.token) {
      console.log('✅ Login successful!');
      
      // Save token to a file for easier reuse
      const tokenFile = path.join(__dirname, 'admin-token.txt');
      fs.writeFileSync(tokenFile, response.data.token);
      
      console.log(`Token saved to: ${tokenFile}`);
      console.log(`Token: ${response.data.token.substring(0, 15)}...`);
      
      // Also log if user is admin
      const isAdmin = response.data.user?.role === 'admin';
      if (!isAdmin) {
        console.log('\n⚠️ WARNING: This user is not an admin!');
        console.log('Role:', response.data.user?.role || 'Not specified');
        console.log('This token will not work for admin-only routes.');
      } else {
        console.log('\nUser role: admin ✓');
      }
      
      return response.data.token;
    } else {
      console.log('❌ Login failed: No token received');
      console.log('Response:', response.data);
      return null;
    }
  } catch (error) {
    console.log('❌ Login failed!');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data?.message || error.message);
    return null;
  } finally {
    rl.close();
  }
}

// Run the login process
getAdminToken()
  .then(token => {
    if (token) {
      console.log('\nYou can now run the API tests with this token:');
      console.log(`node src/scripts/testAPI.cjs "${token}"`);
      process.exit(0);
    } else {
      console.log('\nCould not obtain a valid token. Please check your credentials.');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  }); 
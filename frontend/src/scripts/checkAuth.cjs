// Test script to verify authentication with the backend
const axios = require('axios');
const process = require('process');

// API base URL
const API_URL = 'http://localhost:5000/api';

// Admin token - should be passed as an argument
const adminToken = process.argv[2] || '';

if (!adminToken) {
  console.error('Error: Admin token is required. Usage: node checkAuth.cjs <admin_token>');
  process.exit(1);
}

console.log('=== Authentication Check ===');
console.log('Token used:', `${adminToken.substring(0, 10)}...`);
console.log();

// Check authentication against a simpler endpoint like /profile
async function checkAuth() {
  try {
    console.log('Checking authentication...');
    
    // Try to access a protected endpoint
    const response = await axios.get(`${API_URL}/auth/check`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    console.log('✅ Authentication successful!');
    console.log('Response:', response.status);
    
    if (response.data) {
      console.log('User info:');
      console.log('- ID:', response.data.user?._id || 'Not available');
      console.log('- Name:', response.data.user?.name || 'Not available');
      console.log('- Email:', response.data.user?.email || 'Not available');
      console.log('- Role:', response.data.user?.role || 'Not available');
    }
    
    return true;
  } catch (error) {
    console.log('❌ Authentication failed!');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data?.message || error.message);
    
    // Try to get more information from the error
    if (error.response?.data?.error) {
      console.log('Error details:', error.response.data.error);
    }
    
    // Check if token is expired (by looking for common expired token messages)
    const errorMsg = (error.response?.data?.message || '').toLowerCase();
    if (errorMsg.includes('expired') || errorMsg.includes('invalid') || errorMsg.includes('jwt')) {
      console.log('\n⚠️ Your token appears to be expired or invalid.');
      console.log('Please log in again to get a fresh token.');
    }
    
    return false;
  }
}

// Check admin permissions (try an admin-only endpoint)
async function checkAdminPerms() {
  try {
    console.log('\nChecking admin permissions...');
    
    // Try to access an admin-only endpoint
    const response = await axios.get(`${API_URL}/admin/check`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    console.log('✅ Admin permissions verified!');
    console.log('Response:', response.status);
    
    return true;
  } catch (error) {
    console.log('❌ Admin permission check failed!');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data?.message || error.message);
    
    // Special message for 403 errors
    if (error.response?.status === 403) {
      console.log('\n⚠️ You are authenticated but not authorized as an admin.');
      console.log('This account does not have admin privileges.');
    }
    
    return false;
  }
}

// Run all checks
async function runChecks() {
  const isAuthenticated = await checkAuth();
  
  if (isAuthenticated) {
    const isAdmin = await checkAdminPerms();
    
    console.log('\n=== AUTH CHECK SUMMARY ===');
    console.log('Authentication:', isAuthenticated ? '✅ PASS' : '❌ FAIL');
    console.log('Admin Permissions:', isAdmin ? '✅ PASS' : '❌ FAIL');
    
    if (!isAdmin) {
      console.log('\n⚠️ You need admin permissions to access the applications endpoint.');
      console.log('Please make sure you are using an admin account token.');
    }
  } else {
    console.log('\n=== AUTH CHECK SUMMARY ===');
    console.log('Authentication: ❌ FAIL');
    console.log('\n⚠️ You need to log in again to get a valid token.');
  }
}

runChecks().catch(err => {
  console.error('Error running checks:', err);
  process.exit(1);
}); 
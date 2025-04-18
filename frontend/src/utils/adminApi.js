import axios from 'axios';

// Create a custom Axios instance for admin operations
const adminApi = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  },
  // Default timeout of 10 seconds
  timeout: 10000
});

// Intercept requests to add admin auth token and other parameters
adminApi.interceptors.request.use(
  (config) => {
    // Add admin auth token
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
      console.log('Admin API: Using authentication token:', adminToken.substring(0, 10) + '...');
    } else {
      console.error('Admin API: No authentication token found in localStorage');
    }
    
    // Auto-enable strictPopulate=false for /applications endpoint to avoid mongoose error
    if (config.url?.includes('/applications')) {
      // Initialize params object if it doesn't exist
      if (!config.params) config.params = {};
      
      // Always set these parameters to avoid MongoDB population errors
      config.params.strictPopulate = false;
      config.params.noPopulate = true;
      
      // Log that we're fixing the request
      console.log('Adding population safeguards to applications request');
    }
    
    // Log request details in development
    console.log(`Admin API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Admin API Request Error:', error);
    return Promise.reject(error);
  }
);

// Intercept responses to handle common errors
adminApi.interceptors.response.use(
  (response) => {
    console.log(`Admin API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    // Handle errors based on status code
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.error('Admin token expired or invalid, redirecting to login');
      localStorage.removeItem('adminToken');
      window.location.href = '/admin/login';
    } else if (error.response?.status === 403) {
      // Handle forbidden access (user doesn't have admin role)
      console.error('Access forbidden: User does not have admin privileges');
      
      // Clear admin token as it might be a regular user token
      localStorage.removeItem('adminToken');
      
      // Show error message
      if (typeof window.toast === 'function') {
        window.toast.error('You do not have permission to access the admin area');
      } else {
        alert('You do not have permission to access the admin area');
      }
      
      // Redirect to home page or login
      window.location.href = '/';
    } else if (error.response?.status === 500) {
      // Check for population errors and handle them specially
      const errorMessage = error.response?.data?.error || error.response?.data?.message || '';
      if (typeof errorMessage === 'string' && errorMessage.includes('Cannot populate path')) {
        console.warn('Mongoose populate error detected - consider updating API params with strictPopulate=false');
      }
    }
    
    console.error('Admin API Response Error:', error.response?.status, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default adminApi; 
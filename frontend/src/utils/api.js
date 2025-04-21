import axios from 'axios';

// Create an instance of axios with custom configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // 10 seconds timeout
});

console.log('API base URL:', api.defaults.baseURL);

// Known problematic endpoints and their alternatives
const PROBLEMATIC_ENDPOINTS = {
  '/job-types': ['/jobs/types', '/types/jobs', '/jobs/categories/types'],
  '/interests': ['/training/interests', '/categories/interests', '/training-interests'],
  '/training/interests': ['/interests', '/categories/interests', '/training-interests'],
  '/categories/interests': ['/interests', '/training/interests', '/training-interests'],
};

// Function to check if a URL exists and return an alternative if needed
const checkEndpointAlternatives = (originalUrl) => {
  // Extract the endpoint path without query parameters
  const urlPath = originalUrl.split('?')[0];
  
  // Check if this is a known problematic endpoint
  for (const [problem, alternatives] of Object.entries(PROBLEMATIC_ENDPOINTS)) {
    if (urlPath === problem || urlPath.endsWith(problem)) {
      // Log that we're dealing with a known problematic endpoint
      console.warn(`Warning: Using potentially problematic endpoint: ${urlPath}`);
      console.info(`Consider using alternatives instead: ${alternatives.join(', ')}`);
      break;
    }
  }
  
  return originalUrl;
};

// Add a request interceptor to add the auth token
api.interceptors.request.use(
  (config) => {
    // Check for problematic endpoints
    config.url = checkEndpointAlternatives(config.url);
    
    console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    // Only log responses for non-silent requests
    if (!response.config.headers['X-Silent-Request']) {
      console.log(`API Response: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    // Detailed error logging for debugging
    if (error.response) {
      const { status, config, data } = error.response;
      
      // Skip logging for silent requests
      const isSilentRequest = config.headers && config.headers['X-Silent-Request'] === true;
      
      if (status === 404) {
        if (!isSilentRequest) {
          console.warn(`API 404 Error for ${config.method.toUpperCase()} ${config.url}`);
          
          // Check if this is one of our problematic endpoints
          const urlPath = config.url.split('?')[0];
          for (const [problem, alternatives] of Object.entries(PROBLEMATIC_ENDPOINTS)) {
            if (urlPath === problem || urlPath.endsWith(problem)) {
              console.info(`This is a known problematic endpoint. Try alternatives: ${alternatives.join(', ')}`);
              break;
            }
          }
        }
      } else if (status === 401) {
        // Handle unauthorized access
        console.warn('Authentication error - redirecting to login');
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else {
        // Only log non-silent errors for other status codes
        if (!isSilentRequest) {
          console.error(`API Error ${status} for ${config.method.toUpperCase()} ${config.url}:`, data);
        }
      }
    } else if (error.request) {
      // The request was made but no response was received - only log if not a silent request
      const isSilentRequest = error.config && error.config.headers && error.config.headers['X-Silent-Request'] === true;
      if (!isSilentRequest) {
        console.error('API Network Error - No response received:', error.request);
      }
    } else {
      // Something else happened while setting up the request - only log if not a silent request
      const isSilentRequest = error.config && error.config.headers && error.config.headers['X-Silent-Request'] === true;
      if (!isSilentRequest) {
        console.error('API Request Setup Error:', error.message);
      }
    }
    
    return Promise.reject(error);
  }
);

/**
 * Utility to check if an endpoint exists before making a full request
 * @param {string} endpoint - API endpoint to check
 * @returns {Promise<boolean>} - Whether the endpoint exists
 */
export const checkEndpointExists = async (endpoint) => {
  try {
    // Use HEAD request to efficiently check if an endpoint exists
    // Use a separate axios instance to avoid logging 404 errors for discovery requests
    const response = await axios({
      method: 'HEAD',
      url: `${api.defaults.baseURL}${endpoint}`,
      timeout: 2000, // shorter timeout for quick check
      validateStatus: (status) => {
        // Accept any status as valid to prevent error throwing
        return true;
      },
      // Prevent console logging for these discovery requests
      headers: {
        'X-Silent-Request': 'true'
      }
    });
    
    return response.status >= 200 && response.status < 300;
  } catch (error) {
    // Silent failure - don't log the error
    return false;
  }
};

export default api; 
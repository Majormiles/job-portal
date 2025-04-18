import api from '../utils/api';
import adminApi from '../utils/adminApi';

/**
 * Service for handling job application-related API operations
 */

/**
 * Get all job applications (Admin only)
 * @param {Object} params - Query parameters for filtering, pagination, etc.
 * @returns {Promise} - The API response
 */
export const getAllApplications = async (params = {}) => {
  try {
    console.log(`Getting applications with params:`, params);
    
    // Handle special parameter for populate options
    const requestParams = { ...params };
    
    // Process options for backend Mongoose queries
    if ('strictPopulate' in params) {
      // MongoDB understands this parameter for controlling population behavior
      requestParams.strictPopulate = params.strictPopulate.toString();
    }
    
    if ('populateUser' in params) {
      requestParams.populateUser = params.populateUser.toString();
    }
    
    if ('populateJob' in params) {
      requestParams.populateJob = params.populateJob.toString();
    }
    
    // Make the API request with processed parameters
    const response = await adminApi.get('/applications', { 
      params: requestParams,
      // Add longer timeout for this potentially resource-intensive operation
      timeout: 15000 
    });
    
    console.log(`Applications API response status: ${response.status}`);
    
    // Check if response data exists and has expected format
    if (!response.data) {
      console.error('Empty response from applications API');
      return { 
        success: false, 
        message: 'Empty response from API',
        data: [],
        totalCount: 0
      };
    }
    
    return response.data;
  } catch (error) {
    console.error('Application fetch error:', error);
    
    // Extract detailed error information
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch applications';
    const errorDetails = error.response?.data?.error || '';
    const statusCode = error.response?.status || 500;
    
    // Check for populate error specifically
    const isPopulateError = 
      errorDetails.includes('Cannot populate path') || 
      errorMessage.includes('Cannot populate path');
    
    console.error(`API error ${statusCode}: ${errorMessage}`, errorDetails);
    
    // Return structured error response
    return { 
      success: false, 
      message: errorMessage,
      error: errorDetails,
      statusCode: statusCode,
      isPopulateError,
      data: []
    };
  }
};

/**
 * Get a specific job application by ID (Admin only)
 * @param {string} id - The application ID
 * @returns {Promise} - The API response
 */
export const getApplicationById = async (id) => {
  try {
    const response = await adminApi.get(`/applications/${id}`);
    return response.data;
  } catch (error) {
    console.error('Application fetch error:', error);
    throw error.response?.data || { message: 'Failed to fetch application details' };
  }
};

/**
 * Update application status (Admin only)
 * @param {string} id - The application ID
 * @param {string} status - The new status (pending, reviewed, interviewed, offered, rejected)
 * @returns {Promise} - The API response
 */
export const updateApplicationStatus = async (id, status) => {
  try {
    const response = await adminApi.patch(`/applications/${id}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Status update error:', error);
    throw error.response?.data || { message: 'Failed to update application status' };
  }
};

/**
 * Add notes to an application (Admin only)
 * @param {string} id - The application ID
 * @param {string} notes - The notes to add
 * @returns {Promise} - The API response
 */
export const addApplicationNotes = async (id, notes) => {
  try {
    const response = await adminApi.patch(`/applications/${id}/notes`, { notes });
    return response.data;
  } catch (error) {
    console.error('Notes update error:', error);
    throw error.response?.data || { message: 'Failed to add notes to application' };
  }
};

/**
 * Delete an application (Admin only)
 * @param {string} id - The application ID
 * @returns {Promise} - The API response
 */
export const deleteApplication = async (id) => {
  try {
    const response = await adminApi.delete(`/applications/${id}`);
    return response.data;
  } catch (error) {
    console.error('Delete application error:', error);
    throw error.response?.data || { message: 'Failed to delete application' };
  }
};

/**
 * Get application statistics (Admin only)
 * @returns {Promise} - The API response with counts of applications by status, etc.
 */
export const getApplicationStats = async () => {
  try {
    const response = await adminApi.get('/applications/stats');
    return response.data;
  } catch (error) {
    console.error('Stats fetch error:', error);
    throw error.response?.data || { message: 'Failed to fetch application statistics' };
  }
};

/**
 * Get all job applications (Admin only) with no population
 * @param {Object} params - Query parameters for filtering, pagination, etc.
 * @returns {Promise} - The API response
 */
export const getAllApplicationsRaw = async (params = {}) => {
  try {
    console.log(`Getting applications without population:`, params);
    
    // Add parameters to disable population in the query
    const requestParams = { 
      ...params,
      noPopulate: true,
      strictPopulate: false // Add this to prevent Mongoose population errors
    };
    
    // Use the standard applications endpoint with no-populate flag
    const response = await adminApi.get('/applications', { 
      params: requestParams,
      timeout: 15000 
    });
    
    console.log(`Applications API response status: ${response.status}`);
    
    if (!response.data) {
      console.error('Empty response from applications API');
      return { 
        success: false, 
        message: 'Empty response from API',
        data: [],
        totalCount: 0
      };
    }
    
    return response.data;
  } catch (error) {
    console.error('Raw application fetch error:', error);
    
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch applications';
    const errorDetails = error.response?.data?.error || '';
    const statusCode = error.response?.status || 500;
    
    console.error(`API error ${statusCode}: ${errorMessage}`, errorDetails);
    
    // Provide more helpful error message for specific MongoDB/Mongoose errors
    if (errorDetails && errorDetails.includes('Cannot populate path')) {
      console.warn('MongoDB population error detected. Retrying with strictPopulate=false...');
      
      // If this was a population error and we didn't already have strictPopulate set, 
      // return empty data but don't throw to allow graceful fallback
      return { 
        success: false, 
        message: 'MongoDB population error. Please try again.',
        error: 'Population error',
        data: [],
        totalCount: 0
      };
    }
    
    return { 
      success: false, 
      message: errorMessage,
      error: errorDetails,
      statusCode: statusCode,
      data: []
    };
  }
};

export default {
  getAllApplications,
  getApplicationById,
  updateApplicationStatus,
  addApplicationNotes,
  deleteApplication,
  getApplicationStats,
  getAllApplicationsRaw
}; 
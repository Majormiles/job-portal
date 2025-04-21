import api from '../utils/api';
import adminApi from '../utils/adminApi';

/**
 * Service for handling job type operations
 */

/**
 * Get all job types
 * @returns {Promise} - The API response with job types
 */
export const getJobTypes = async () => {
  try {
    // Use the dedicated endpoint directly
    try {
      console.log('Fetching job types from: /job-types');
      const response = await api.get('/job-types', {
        headers: {
          'X-Silent-Request': false // We want to log this request
        }
      });
      
      if (response.data && response.data.success) {
        console.log('Successfully fetched job types');
        return response.data;
      }
    } catch (error) {
      console.warn('Failed to fetch job types, falling back to default data');
    }
    
    // If API call fails, return default job types
    console.info('Using default job types data');
    return getDefaultJobTypes();
  } catch (error) {
    console.error('Error in getJobTypes:', error);
    // Return default job types on error
    return getDefaultJobTypes();
  }
};

/**
 * Get default job types when API fails
 * @returns {Object} Default job types data
 */
const getDefaultJobTypes = () => {
  return {
    success: true,
    data: [
      { id: 'full-time', name: 'Full-time' },
      { id: 'part-time', name: 'Part-time' },
      { id: 'contract', name: 'Contract' },
      { id: 'temporary', name: 'Temporary' },
      { id: 'internship', name: 'Internship' },
      { id: 'remote', name: 'Remote' },
      { id: 'hybrid', name: 'Hybrid' },
      { id: 'seasonal', name: 'Seasonal' },
      { id: 'freelance', name: 'Freelance' },
      { id: 'volunteer', name: 'Volunteer' }
    ]
  };
};

/**
 * Create a new job type (Admin only)
 * @param {Object} jobTypeData - The job type data
 * @returns {Promise} - The API response
 */
export const createJobType = async (jobTypeData) => {
  try {
    const response = await adminApi.post('/job-types', jobTypeData);
    return response.data;
  } catch (error) {
    console.error('Error creating job type:', error);
    throw error;
  }
};

/**
 * Update an existing job type (Admin only)
 * @param {string} id - The job type ID
 * @param {Object} jobTypeData - The updated job type data
 * @returns {Promise} - The API response
 */
export const updateJobType = async (id, jobTypeData) => {
  try {
    const response = await adminApi.put(`/job-types/${id}`, jobTypeData);
    return response.data;
  } catch (error) {
    console.error('Error updating job type:', error);
    throw error;
  }
};

/**
 * Delete a job type (Admin only)
 * @param {string} id - The job type ID
 * @returns {Promise} - The API response
 */
export const deleteJobType = async (id) => {
  try {
    const response = await adminApi.delete(`/job-types/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting job type:', error);
    throw error;
  }
};

export default {
  getJobTypes,
  createJobType,
  updateJobType,
  deleteJobType
}; 
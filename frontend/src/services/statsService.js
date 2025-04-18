import api from '../utils/api';

/**
 * Service for fetching portal statistics
 */

/**
 * Get portal statistics (jobs count, candidates count, companies count)
 * @returns {Promise<{success: boolean, data: {jobs: number, candidates: number, companies: number}, error: string}>}
 */
export const getPortalStats = async () => {
  try {
    console.log('Fetching portal stats...');
    // Remove the duplicate /api from the URL path
    const response = await api.get('/stats');
    
    console.log('Stats response:', response.data);
    
    // Ensure we return a consistent structure even if the API fails
    if (response.data && response.data.success) {
      return {
        success: true,
        data: {
          jobs: response.data.data.jobs || 0,
          candidates: response.data.data.candidates || 0,
          companies: response.data.data.companies || 0
        }
      };
    } else {
      console.warn('Stats API returned success:false', response.data);
      console.error('Stats API failed:', response.data?.message || 'No message provided');
      
      return {
        success: false,
        data: { jobs: 0, candidates: 0, companies: 0 },
        error: response.data?.message || 'Failed to fetch stats'
      };
    }
  } catch (error) {
    console.error('Error fetching portal stats:', error);
    
    return {
      success: false,
      data: { jobs: 0, candidates: 0, companies: 0 },
      error: error.message || 'Failed to fetch stats'
    };
  }
};

/**
 * Safely extracts stats from the API response
 * @param {Object} response - The API response object
 * @returns {Object} - Safe stats object with default values
 */
export const getSafeStats = (response) => {
  if (!response || !response.data) {
    return { jobs: 0, candidates: 0, companies: 0 };
  }
  
  return {
    jobs: response.data.jobs || 0,
    candidates: response.data.candidates || 0,
    companies: response.data.companies || 0
  };
};

// Export as named export and default object
const statsService = { getPortalStats, getSafeStats };
export default statsService; 
import api from '../utils/api';

/**
 * Service for fetching portal statistics
 */

/**
 * Get portal statistics (jobs count, candidates count, companies count)
 * @returns {Promise} - Stats data object
 */
export const getPortalStats = async () => {
  try {
    console.log('Fetching portal stats from API...');
    // Fix the endpoint path - remove the redundant "/api" prefix
    const response = await api.get('/stats');
    
    console.log('Stats API response:', response.data);
    
    // If successful API response, return the data
    if (response.data && response.data.success) {
      console.log('Successfully fetched stats data:', response.data.data);
      
      // Make sure the properties exist and are not undefined
      const safeData = {
        jobs: response.data.data?.jobs || 0,
        candidates: response.data.data?.candidates || 0,
        companies: response.data.data?.companies || 0
      };
      
      return {
        success: true,
        data: safeData
      };
    }
    
    console.log('API call succeeded but returned no data');
    // Return empty stats instead of mock data
    return {
      success: false,
      message: 'No data returned from API',
      data: {
        jobs: 0,
        candidates: 0,
        companies: 0
      }
    };
    
  } catch (error) {
    console.error('Error fetching portal stats:', error);
    
    // Return empty stats instead of mock data
    return {
      success: false,
      message: error.message || 'Failed to fetch portal statistics',
      data: {
        jobs: 0,
        candidates: 0,
        companies: 0
      }
    };
  }
};

// Export as named export and default object
const statsService = { getPortalStats };
export default statsService; 
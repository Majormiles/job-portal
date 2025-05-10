import api from '../utils/api';
import adminApi from '../utils/adminApi';

/**
 * Service for handling training interests API operations
 */

/**
 * Get all interests
 * @param {Object} params - Query parameters for filtering, pagination, etc.
 * @returns {Promise} - The API response
 */
export const getInterests = async (params = {}) => {
  try {
    // First try the new dedicated endpoint
    try {
      const response = await api.get('/interests', { params });
      if (response.data && response.data.success) {
        return response.data;
      }
    } catch (firstError) {
      console.warn('First attempt to fetch interests failed, trying fallback endpoint', firstError.message);
    }
    
    // If the first call fails, try the compatibility endpoint
    try {
      const response = await api.get('/training/interests', { params });
      if (response.data && response.data.success) {
        return response.data;
      }
    } catch (secondError) {
      console.warn('Second attempt to fetch interests failed', secondError.message);
    }
    
    // Try a third compatibility endpoint
    try {
      const response = await api.get('/categories/interests', { params });
      if (response.data && response.data.success) {
        return response.data;
      }
    } catch (thirdError) {
      console.warn('Third attempt to fetch interests failed', thirdError.message);
    }
    
    // Try a fourth compatibility endpoint
    try {
      const response = await api.get('/training-interests', { params });
      if (response.data && response.data.success) {
        return response.data;
      }
    } catch (fourthError) {
      console.warn('Fourth attempt to fetch interests failed', fourthError.message);
    }
    
    // If all API calls fail, return default interests
    console.warn('All attempts to fetch interests failed, returning default data');
    return getDefaultInterests();
  } catch (error) {
    console.error('Error fetching interests:', error);
    // Return default interests even in case of a catastrophic error
    return getDefaultInterests();
  }
};

/**
 * Get default interests when API fails
 * @returns {Object} Default interests data
 */
const getDefaultInterests = () => {
  return {
    success: true,
    data: [
      { id: 'web-development', name: 'Web Development', category: 'technical' },
      { id: 'mobile-app-development', name: 'Mobile App Development', category: 'technical' },
      { id: 'graphic-design', name: 'Graphic Design', category: 'creative' },
      { id: 'ui-ux-design', name: 'UI/UX Design', category: 'creative' },
      { id: 'digital-marketing', name: 'Digital Marketing', category: 'business' },
      { id: 'data-analysis', name: 'Data Analysis', category: 'technical' },
      { id: 'business-admin', name: 'Business Administration', category: 'business' },
      { id: 'accounting', name: 'Accounting & Finance', category: 'business' },
      { id: 'language', name: 'Language & Communication', category: 'other' },
      { id: 'healthcare', name: 'Healthcare & Wellness', category: 'other' },
      { id: 'culinary', name: 'Culinary Arts', category: 'creative' },
      { id: 'fashion', name: 'Fashion & Beauty', category: 'creative' },
      { id: 'photography', name: 'Photography & Videography', category: 'creative' },
      { id: 'music-production', name: 'Music Production', category: 'creative' },
      { id: 'electrical', name: 'Electrical Engineering', category: 'trade' },
      { id: 'mechanical', name: 'Mechanical Engineering', category: 'trade' },
      { id: 'carpentry', name: 'Carpentry & Woodworking', category: 'trade' },
      { id: 'plumbing', name: 'Plumbing', category: 'trade' },
      { id: 'welding', name: 'Welding & Metalwork', category: 'trade' },
      { id: 'agriculture', name: 'Agriculture & Farming', category: 'trade' },
      { id: 'other', name: 'Other', category: 'other' }
    ]
  };
};

/**
 * Get a specific interest by ID
 * @param {string} id - The interest ID
 * @returns {Promise} - The API response
 */
export const getInterestById = async (id) => {
  try {
    const response = await api.get(`/interests/${id}`);
    return response.data;
  } catch (error) {
    console.error('Interest fetch error:', error);
    throw error;
  }
};

/**
 * Create a new interest (Admin only)
 * @param {Object} interestData - The interest data
 * @returns {Promise} - The API response
 */
export const createInterest = async (interestData) => {
  try {
    const response = await adminApi.post('/interests', interestData);
    return response.data;
  } catch (error) {
    console.error('Error creating interest:', error);
    throw error;
  }
};

/**
 * Update an existing interest (Admin only)
 * @param {string} id - The interest ID
 * @param {Object} interestData - The updated interest data
 * @returns {Promise} - The API response
 */
export const updateInterest = async (id, interestData) => {
  try {
    const response = await adminApi.put(`/interests/${id}`, interestData);
    return response.data;
  } catch (error) {
    console.error('Error updating interest:', error);
    throw error;
  }
};

/**
 * Delete an interest (Admin only)
 * @param {string} id - The interest ID
 * @returns {Promise} - The API response
 */
export const deleteInterest = async (id) => {
  try {
    const response = await adminApi.delete(`/interests/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting interest:', error);
    throw error;
  }
};

/**
 * Initialize default interests (Admin only)
 * @returns {Promise} - The API response
 */
export const initializeInterests = async () => {
  try {
    const response = await adminApi.post('/interests/initialize');
    return response.data;
  } catch (error) {
    console.error('Error initializing interests:', error);
    throw error;
  }
};

export default {
  getInterests,
  getInterestById,
  createInterest,
  updateInterest,
  deleteInterest,
  initializeInterests
}; 
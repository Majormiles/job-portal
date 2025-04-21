import api from '../utils/api';
import adminApi from '../utils/adminApi';
import { checkEndpointExists } from '../utils/api';

/**
 * Service for handling interest types operations
 */

/**
 * Get all interest types
 * @returns {Promise} - The API response with interest types
 */
export const getInterestTypes = async () => {
  try {
    // Use the dedicated endpoint directly
    try {
      console.log('Fetching interest types from: /interests');
      const response = await api.get('/interests', {
        headers: {
          'X-Silent-Request': false // We want to log this request
        }
      });
      
      if (response.data && response.data.success) {
        console.log('Successfully fetched interest types');
        return response.data;
      }
    } catch (error) {
      console.warn('Failed to fetch interest types, falling back to default data');
    }
    
    // If API call fails, return default interest types
    console.info('Using default interest types data');
    return getDefaultInterestTypes();
  } catch (error) {
    console.error('Error in getInterestTypes:', error);
    // Return default interest types on error
    return getDefaultInterestTypes();
  }
};

/**
 * Get default interest types when API fails
 * @returns {Object} Default interest types data
 */
const getDefaultInterestTypes = () => {
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
 * Create a new interest type (Admin only)
 * @param {Object} interestTypeData - The interest type data
 * @returns {Promise} - The API response
 */
export const createInterestType = async (interestTypeData) => {
  try {
    const response = await adminApi.post('/interests', interestTypeData);
    return response.data;
  } catch (error) {
    console.error('Error creating interest type:', error);
    throw error;
  }
};

/**
 * Update an existing interest type (Admin only)
 * @param {string} id - The interest type ID
 * @param {Object} interestTypeData - The updated interest type data
 * @returns {Promise} - The API response
 */
export const updateInterestType = async (id, interestTypeData) => {
  try {
    const response = await adminApi.put(`/interests/${id}`, interestTypeData);
    return response.data;
  } catch (error) {
    console.error('Error updating interest type:', error);
    throw error;
  }
};

/**
 * Delete an interest type (Admin only)
 * @param {string} id - The interest type ID
 * @returns {Promise} - The API response
 */
export const deleteInterestType = async (id) => {
  try {
    const response = await adminApi.delete(`/interests/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting interest type:', error);
    throw error;
  }
};

export default {
  getInterestTypes,
  createInterestType,
  updateInterestType,
  deleteInterestType
}; 
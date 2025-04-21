import api from '../utils/api';
import adminApi from '../utils/adminApi';

/**
 * Service for handling company types API operations
 */

/**
 * Get all company types
 * @param {Object} params - Query parameters for filtering, pagination, etc.
 * @returns {Promise} - The API response
 */
export const getCompanyTypes = async (params = {}) => {
  try {
    // First try the new dedicated endpoint
    try {
      const response = await api.get('/company-types', { params });
      if (response.data && response.data.success) {
        return response.data;
      }
    } catch (firstError) {
      console.warn('First attempt to fetch company types failed, trying fallback endpoint', firstError.message);
    }
    
    // If the first call fails, try the compatibility endpoint
    try {
      const response = await api.get('/industries', { params });
      if (response.data && response.data.success) {
        return response.data;
      }
    } catch (secondError) {
      console.warn('Second attempt to fetch company types failed', secondError.message);
    }
    
    // Try a third compatibility endpoint
    try {
      const response = await api.get('/employer/industries', { params });
      if (response.data && response.data.success) {
        return response.data;
      }
    } catch (thirdError) {
      console.warn('Third attempt to fetch company types failed', thirdError.message);
    }
    
    // If all API calls fail, return default company types
    console.warn('All attempts to fetch company types failed, returning default data');
    return {
      success: true,
      data: [
        { _id: 'corporation', name: 'Corporation' },
        { _id: 'limited-liability', name: 'Limited Liability Company (LLC)' },
        { _id: 'partnership', name: 'Partnership' },
        { _id: 'sole-proprietorship', name: 'Sole Proprietorship' },
        { _id: 'non-profit', name: 'Non-Profit Organization' },
        { _id: 'startup', name: 'Startup' },
        { _id: 'government', name: 'Government Agency' },
        { _id: 'educational', name: 'Educational Institution' },
        { _id: 'other', name: 'Other' }
      ]
    };
  } catch (error) {
    console.error('Error fetching company types:', error);
    throw error;
  }
};

/**
 * Get a specific company type by ID
 * @param {string} id - The company type ID
 * @returns {Promise} - The API response
 */
export const getCompanyTypeById = async (id) => {
  try {
    const response = await api.get(`/company-types/${id}`);
    return response.data;
  } catch (error) {
    console.error('Company type fetch error:', error);
    throw error;
  }
};

/**
 * Create a new company type (Admin only)
 * @param {Object} companyTypeData - The company type data
 * @returns {Promise} - The API response
 */
export const createCompanyType = async (companyTypeData) => {
  try {
    const response = await adminApi.post('/company-types', companyTypeData);
    return response.data;
  } catch (error) {
    console.error('Error creating company type:', error);
    throw error;
  }
};

/**
 * Update an existing company type (Admin only)
 * @param {string} id - The company type ID
 * @param {Object} companyTypeData - The updated company type data
 * @returns {Promise} - The API response
 */
export const updateCompanyType = async (id, companyTypeData) => {
  try {
    const response = await adminApi.put(`/company-types/${id}`, companyTypeData);
    return response.data;
  } catch (error) {
    console.error('Error updating company type:', error);
    throw error;
  }
};

/**
 * Delete a company type (Admin only)
 * @param {string} id - The company type ID
 * @returns {Promise} - The API response
 */
export const deleteCompanyType = async (id) => {
  try {
    const response = await adminApi.delete(`/company-types/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting company type:', error);
    throw error;
  }
};

/**
 * Initialize default company types (Admin only)
 * @returns {Promise} - The API response
 */
export const initializeCompanyTypes = async () => {
  try {
    const response = await adminApi.post('/company-types/initialize');
    return response.data;
  } catch (error) {
    console.error('Error initializing company types:', error);
    throw error;
  }
};

export default {
  getCompanyTypes,
  getCompanyTypeById,
  createCompanyType,
  updateCompanyType,
  deleteCompanyType,
  initializeCompanyTypes
}; 
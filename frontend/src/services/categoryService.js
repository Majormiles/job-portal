import api from '../utils/api';
import adminApi from '../utils/adminApi';

/**
 * Service for handling category-related API operations
 */

/**
 * Get all categories
 * @param {Object} params - Query parameters for filtering, pagination, etc.
 * @returns {Promise} - The API response
 */
export const getCategories = async (params = {}) => {
  try {
    const response = await api.get('/categories', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch categories' };
  }
};

/**
 * Get category by ID
 * @param {string} id - The category ID
 * @returns {Promise} - The API response
 */
export const getCategoryById = async (id) => {
  try {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch category details' };
  }
};

/**
 * Create a new category (Admin only)
 * @param {Object} categoryData - The category data
 * @returns {Promise} - The API response
 */
export const createCategory = async (categoryData) => {
  try {
    const response = await adminApi.post('/categories', categoryData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create category' };
  }
};

/**
 * Update a category (Admin only)
 * @param {string} id - The category ID
 * @param {Object} categoryData - The updated category data
 * @returns {Promise} - The API response
 */
export const updateCategory = async (id, categoryData) => {
  try {
    const response = await adminApi.put(`/categories/${id}`, categoryData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update category' };
  }
};

/**
 * Delete a category (Admin only)
 * @param {string} id - The category ID
 * @returns {Promise} - The API response
 */
export const deleteCategory = async (id) => {
  try {
    const response = await adminApi.delete(`/categories/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete category' };
  }
};

/**
 * Get jobs by category ID
 * @param {string} categoryId - The category ID
 * @param {Object} params - Query parameters
 * @returns {Promise} - The API response
 */
export const getJobsByCategory = async (categoryId, params = {}) => {
  try {
    const response = await api.get(`/categories/${categoryId}/jobs`, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch jobs for this category' };
  }
};

/**
 * Get category statistics (Admin only)
 * @returns {Promise} - The API response
 */
export const getCategoryStats = async () => {
  try {
    const response = await adminApi.get('/categories/admin/stats');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch category statistics' };
  }
};

export default {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getJobsByCategory,
  getCategoryStats
}; 
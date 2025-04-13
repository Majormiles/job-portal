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
    const response = await adminApi.get('/applications', { params });
    return response.data;
  } catch (error) {
    console.error('Application fetch error:', error);
    throw error.response?.data || { message: 'Failed to fetch applications' };
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

export default {
  getAllApplications,
  getApplicationById,
  updateApplicationStatus,
  addApplicationNotes,
  deleteApplication,
  getApplicationStats
}; 
import api from '../utils/api';
import adminApi from '../utils/adminApi';

/**
 * Service for handling job-related API operations
 */

/**
 * Get all jobs with optional filtering
 * @param {Object} params - Query parameters for filtering, pagination, etc.
 * @returns {Promise} - The API response
 */
export const getJobs = async (params = {}) => {
  try {
    const response = await api.get('/jobs', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch jobs' };
  }
};

/**
 * Get a single job by ID
 * @param {string} id - The job ID
 * @returns {Promise} - The API response
 */
export const getJobById = async (id) => {
  try {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch job' };
  }
};

/**
 * Get related jobs (jobs in the same category)
 * @param {string} jobId - The current job ID
 * @param {string} categoryId - The category ID
 * @param {number} limit - The number of related jobs to fetch
 * @returns {Promise} - The API response
 */
export const getRelatedJobs = async (jobId, categoryId, limit = 3) => {
  try {
    const response = await api.get(`/jobs/related/${jobId}`, {
      params: { category: categoryId, limit }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch related jobs' };
  }
};

/**
 * Get jobs for a specific employer
 * @returns {Promise} - The API response
 */
export const getEmployerJobs = async () => {
  try {
    const response = await api.get('/jobs/employer/jobs');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch employer jobs' };
  }
};

/**
 * Create a new job (Admin only)
 * @param {Object} jobData - The job data
 * @returns {Promise} - The API response
 */
export const createJob = async (jobData) => {
  try {
    const response = await adminApi.post('/jobs', jobData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to create job' };
  }
};

/**
 * Update an existing job (Admin only)
 * @param {string} id - The job ID
 * @param {Object} jobData - The updated job data
 * @returns {Promise} - The API response
 */
export const updateJob = async (id, jobData) => {
  try {
    const response = await adminApi.put(`/jobs/${id}`, jobData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update job' };
  }
};

/**
 * Delete a job (Admin only)
 * @param {string} id - The job ID
 * @returns {Promise} - The API response
 */
export const deleteJob = async (id) => {
  try {
    const response = await adminApi.delete(`/jobs/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to delete job' };
  }
};

/**
 * Apply for a job (User only)
 * @param {string} jobId - The job ID
 * @param {Object} applicationData - The application data (e.g. resume, cover letter, etc.)
 * @returns {Promise} - The API response
 */
export const applyForJob = async (jobId, applicationData) => {
  try {
    const response = await api.post(`/jobs/${jobId}/apply`, applicationData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to submit job application' };
  }
};

/**
 * Get job applications for a specific job (Admin only)
 * @param {string} jobId - The job ID
 * @param {Object} params - Query parameters for filtering, pagination, etc.
 * @returns {Promise} - The API response
 */
export const getJobApplications = async (jobId, params = {}) => {
  try {
    const response = await adminApi.get(`/jobs/${jobId}/applications`, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch job applications' };
  }
};

/**
 * Search for jobs
 * @param {Object} searchParams - Search parameters
 * @returns {Promise} - The API response
 */
export const searchJobs = async (searchParams = {}) => {
  try {
    const response = await api.get('/jobs/search', { params: searchParams });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to search jobs' };
  }
};

/**
 * Update the status of a job (e.g., active, closed, draft)
 * @param {string} jobId - The job ID
 * @param {string} status - The new status
 * @returns {Promise} - The API response
 */
export const updateJobStatus = async (jobId, status) => {
  try {
    const response = await adminApi.patch(`/jobs/${jobId}/status`, { status });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to update job status' };
  }
};

/**
 * Get featured or highlighted jobs (e.g., for homepage)
 * @param {number} limit - The number of featured jobs to fetch
 * @returns {Promise} - The API response
 */
export const getFeaturedJobs = async (limit = 6) => {
  try {
    const response = await api.get('/jobs/featured', { params: { limit } });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch featured jobs' };
  }
};

/**
 * Get job statistics (Admin only)
 * @returns {Promise} - The API response
 */
export const getJobStats = async () => {
  try {
    const response = await adminApi.get('/jobs/admin/stats');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch job statistics' };
  }
};

export default {
  getJobs,
  getJobById,
  getRelatedJobs,
  getEmployerJobs,
  createJob,
  updateJob,
  deleteJob,
  applyForJob,
  getJobApplications,
  searchJobs,
  updateJobStatus,
  getFeaturedJobs,
  getJobStats
}; 
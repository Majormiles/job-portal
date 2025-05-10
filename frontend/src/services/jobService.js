import api from '../utils/api';
import adminApi from '../utils/adminApi';
import { getJobTypes } from './jobTypeService';

/**
 * Service for handling job-related API operations
 */

/**
 * Get jobs (Admin only)
 * @param {Object} params - Query parameters for filtering, pagination, etc.
 * @returns {Promise} - The API response
 */
export const getJobs = async (params = {}) => {
  try {
    const response = await adminApi.get('/jobs', { params });
    console.log('Fetching jobs with URL:', adminApi.defaults.baseURL + '/jobs');
    return response.data;
  } catch (error) {
    console.error('Jobs fetch error:', error);
    throw error.response?.data || { message: 'Failed to fetch jobs' };
  }
};

/**
 * Get a specific job by ID
 * @param {string} id - The job ID
 * @returns {Promise} - The API response
 */
export const getJobById = async (id) => {
  try {
    console.log(`Fetching job with ID: ${id}`);
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  } catch (error) {
    console.error('Job fetch error:', error);
    
    // Handle 404 errors specifically (job not found/deleted)
    if (error.response?.status === 404) {
      return { 
        success: false, 
        message: 'Job not found or has been deleted',
        data: {
          _id: id,
          title: `Job ID: ${id.slice(-6)}`,
          company: 'Job Not Found',
          deleted: true
        }
      };
    }
    
    // Handle other errors
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to fetch job details',
      data: null
    };
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
    console.log(`Fetching related jobs for job ID: ${jobId}, category: ${categoryId}, limit: ${limit}`);
    const response = await api.get(`/jobs/related/${jobId}`, {
      params: { category: categoryId, limit }
    });
    
    if (response.data && response.data.success) {
      return {
        success: true,
        data: response.data.data || [],
        message: 'Related jobs fetched successfully'
      };
    }
    
    return {
      success: false,
      data: [],
      message: response.data?.message || 'Failed to fetch related jobs'
    };
  } catch (error) {
    console.error('Error fetching related jobs:', error.response || error);
    
    return {
      success: false,
      data: [],
      message: error.response?.data?.message || error.message || 'Error fetching related jobs',
      error: error.response?.data || error
    };
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
    // Clone the data to avoid modifying the original
    const submissionData = { ...jobData };
    
    // Handle image data properly to avoid sending objects when strings are expected
    if (submissionData.image) {
      // If the image is already a string (URL or data URL), keep it as is
      if (typeof submissionData.image === 'string') {
        console.log('Image is already a string, keeping as is');
      } 
      // If the image is an object but has a URL property, use that URL
      else if (typeof submissionData.image === 'object' && submissionData.image !== null) {
        if (submissionData.image.url) {
          console.log('Extracting URL from image object');
          // If the image already exists on server, just send its URL
          submissionData.image = submissionData.image.url;
        } else if (Object.keys(submissionData.image).length === 0) {
          // Empty object, set to empty string
          submissionData.image = '';
        }
      }
    }
    
    console.log('Submitting job data:', { 
      ...submissionData,
      image: typeof submissionData.image === 'string' && submissionData.image.length > 100 
        ? `${submissionData.image.substring(0, 50)}... (truncated)` 
        : submissionData.image
    });

    const response = await adminApi.put(`/jobs/${id}`, submissionData);
    return response.data;
  } catch (error) {
    console.error('Error updating job:', error);
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
 * Get recent job postings sorted by date
 * @param {number} limit - The number of recent jobs to fetch
 * @returns {Promise} - The API response with recent jobs
 */
export const getRecentJobs = async (limit = 6) => {
  try {
    console.log('Fetching recent jobs...');
    
    // First, try to use the dedicated API endpoint
    try {
      const response = await api.get('/jobs', { 
        params: { 
          limit, 
          sort: 'latest',
          page: 1
        } 
      });
      
      if (response.data && response.data.success) {
        console.log('Successfully fetched recent jobs from API:', response.data);
        return {
          success: true,
          data: response.data.data || [],
          message: 'Recent jobs fetched successfully'
        };
      }
    } catch (endpointError) {
      console.warn('First attempt to fetch recent jobs failed, trying alternative endpoint:', endpointError.message);
    }
    
    // If the dedicated endpoint fails, try regular search endpoint
    try {
      const response = await api.get('/jobs/search', { 
        params: { 
          limit, 
          sort: 'latest',
          page: 1
        } 
      });
      
      if (response.data && response.data.success) {
        console.log('Successfully fetched recent jobs from search API:', response.data);
        return {
          success: true,
          data: Array.isArray(response.data.data) 
            ? response.data.data 
            : response.data.data?.jobs || [],
          message: 'Recent jobs fetched successfully'
        };
      }
    } catch (searchError) {
      console.warn('Second attempt to fetch recent jobs failed:', searchError.message);
    }
    
    // If both API methods fail, fallback to fetching all jobs and sorting client-side
    console.log('Falling back to fetching all jobs and sorting client-side');
    const allJobsResponse = await api.get('/jobs');
    
    if (allJobsResponse.data && (allJobsResponse.data.success || Array.isArray(allJobsResponse.data))) {
      // Extract jobs array from response
      let jobs = Array.isArray(allJobsResponse.data) 
        ? allJobsResponse.data 
        : allJobsResponse.data.data || [];
      
      // Sort by date (newest first)
      jobs = jobs.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.datePosted || 0);
        const dateB = new Date(b.createdAt || b.datePosted || 0);
        return dateB - dateA;
      });
      
      // Limit the number of jobs
      const recentJobs = jobs.slice(0, limit);
      
      console.log(`Successfully sorted and limited to ${recentJobs.length} most recent jobs`);
      return {
        success: true,
        data: recentJobs,
        message: 'Recent jobs sorted client-side'
      };
    }
    
    // If we got here, all methods failed
    console.warn('All attempts to fetch recent jobs failed');
    return {
      success: false,
      data: [],
      message: 'Failed to fetch recent jobs after multiple attempts'
    };
  } catch (error) {
    console.error('Error in getRecentJobs:', error);
    return {
      success: false,
      data: [],
      message: error.message || 'Error fetching recent jobs'
    };
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
  getRecentJobs,
  getJobStats,
  getJobTypes
}; 
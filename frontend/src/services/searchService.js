import api from '../utils/api';
import { getJobs } from './jobService';
import { getCategories } from './categoryService';

/**
 * Search Service for global search functionality
 * This centralizes all search-related logic for the job portal
 */

/**
 * Search for jobs with comprehensive filtering
 * @param {Object} searchParams - Search parameters
 * @param {string} searchParams.query - Main search query for job title, company, skills
 * @param {string} searchParams.location - Location filter
 * @param {string} searchParams.category - Category filter
 * @param {Array} searchParams.jobTypes - Job types filter (full-time, part-time, etc.)
 * @param {Array} searchParams.salaryRange - Min and max salary range [min, max]
 * @param {string} searchParams.sortBy - Sorting option (latest, salary-high, salary-low)
 * @param {number} searchParams.page - Page number for pagination
 * @param {number} searchParams.limit - Number of items per page
 * @returns {Promise} - The search results
 */
export const searchJobs = async (searchParams = {}) => {
  try {
    // Normalize parameter names to handle potential inconsistencies
    const normalizedParams = normalizeSearchParams(searchParams);
    
    const {
      query = '',
      location = '',
      category = '',
      jobTypes = [],
      salaryRange = [0, 9999],
      sortBy = 'latest',
      page = 1,
      limit = 6
    } = normalizedParams;

    // Build query parameters for the API
    const params = {
      page,
      limit,
      sort: sortBy
    };

    // Add search query if provided - using a consistent field name
    if (query && query.trim() !== '') {
      // Use a single consistent field name for the backend
      params.search = query.trim();
    }

    // Handle category filter properly
    if (category) {
      // Try to determine if category is an ID or name
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        // It's likely an ID (MongoDB ObjectId format)
        params.categoryId = category;
      } else {
        // It's a name
        params.category = category;
      }
    }

    // Handle location filter properly - ensure exact match with backend expectations
    if (location && location.trim() !== '') {
      params.location = location.trim();
    }

    // Add other filter parameters
    if (jobTypes && jobTypes.length > 0) {
      params.type = jobTypes.join(',');
    }
    
    if (salaryRange && (salaryRange[0] > 0 || salaryRange[1] < 9999)) {
      params.minSalary = salaryRange[0];
      params.maxSalary = salaryRange[1];
    }

    console.log('Normalized search params being sent to API:', params);

    // Fetch jobs with the constructed parameters
    const response = await getJobs(params);

    if (!response || !response.success) {
      throw new Error(response?.message || 'Failed to fetch search results');
    }

    let results = response.data;

    // Apply client-side filtering for more accurate results when necessary
    if (query && query.trim() !== '' && results.length > 0) {
      results = filterAndRankResults(results, query.trim());
    }

    // If location filtering was requested but API doesn't seem to have filtered properly
    if (location && location.trim() !== '' && results.length > 0) {
      const locationLower = location.trim().toLowerCase();
      
      // Verify that results contain only jobs matching the location
      const locationFilteredResults = results.filter(job => 
        job.location && job.location.toLowerCase().includes(locationLower)
      );
      
      // Only use client-side filtering if it would actually filter results
      if (locationFilteredResults.length < results.length) {
        console.log(`Client-side location filtering applied: ${results.length} → ${locationFilteredResults.length} jobs`);
        results = locationFilteredResults;
      }
    }

    // If category filtering was requested but API doesn't seem to have filtered properly
    if (category && results.length > 0) {
      // Determine if we need client-side category filtering
      let categoryFilterNeeded = false;
      let categoryName = '';
      
      // If category is an ID, we need to first find the category name
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        try {
          // Get all categories
          const categoriesResponse = await getCategories();
          if (categoriesResponse.success) {
            // Find matching category
            const categoryObj = categoriesResponse.data.find(cat => cat._id === category);
            if (categoryObj) {
              categoryName = categoryObj.name;
              categoryFilterNeeded = true;
            }
          }
        } catch (error) {
          console.error('Error fetching category name:', error);
        }
      } else {
        // Category is already a name
        categoryName = category;
        categoryFilterNeeded = true;
      }
      
      // Apply client-side filtering if needed
      if (categoryFilterNeeded && categoryName) {
        const categoryNameLower = categoryName.toLowerCase();
        
        // Filter results by category name
        const categoryFilteredResults = results.filter(job => 
          (job.category && job.category.toLowerCase() === categoryNameLower) ||
          (job.categoryName && job.categoryName.toLowerCase() === categoryNameLower)
        );
        
        // Only use client-side filtering if it would actually filter results
        if (categoryFilteredResults.length < results.length) {
          console.log(`Client-side category filtering applied: ${results.length} → ${categoryFilteredResults.length} jobs`);
          results = categoryFilteredResults;
        }
      }
    }

    // Return both the processed results and metadata for pagination
    return {
      success: true,
      data: results,
      meta: response.meta || response.pagination || {
        total: results.length,
        totalPages: Math.ceil(results.length / limit),
        page: page,
        limit: limit
      }
    };
  } catch (error) {
    console.error('Error in searchJobs:', error);
    return {
      success: false,
      message: error.message || 'Failed to search jobs',
      data: []
    };
  }
};

/**
 * Normalize search parameters to handle inconsistencies in naming
 * @param {Object} params - The raw search parameters object
 * @returns {Object} - Normalized parameters with standard naming
 */
const normalizeSearchParams = (params = {}) => {
  const normalized = { ...params };

  // Normalize query parameter (handle searchQuery, q, debouncedSearchTerm, search, etc.)
  if (!normalized.query) {
    if (normalized.searchQuery) {
      normalized.query = normalized.searchQuery;
    } else if (normalized.search) {
      normalized.query = normalized.search;
    } else if (normalized.q) {
      normalized.query = normalized.q;
    } else if (normalized.debouncedSearchTerm) {
      normalized.query = normalized.debouncedSearchTerm;
    } else if (normalized.searchTerm) {
      normalized.query = normalized.searchTerm;
    }
  }

  // Normalize location parameter (handle searchLocation, location_, etc.)
  if (!normalized.location) {
    if (normalized.searchLocation) {
      normalized.location = normalized.searchLocation;
    } else if (normalized.location_) {
      normalized.location = normalized.location_;
    }
  }

  // Normalize category parameter (handle searchCategory, categoryId, selectedCategory, etc.)
  if (!normalized.category) {
    if (normalized.searchCategory) {
      normalized.category = normalized.searchCategory;
    } else if (normalized.selectedCategory) {
      normalized.category = normalized.selectedCategory;
    }
  }

  console.log('Parameter normalization applied:', {
    original: params,
    normalized: normalized
  });

  return normalized;
};

/**
 * Filter and rank search results based on relevance to query
 * @param {Array} jobs - The jobs to filter and rank
 * @param {string} query - The search query
 * @returns {Array} - Filtered and ranked jobs
 */
export const filterAndRankResults = (jobs, query) => {
  const searchTermLower = query.toLowerCase();
  console.log(`Client-side filtering ${jobs.length} jobs with term: "${searchTermLower}"`);

  // Get all potential matches from most specific to least
  // 1. Exact title matches
  const exactTitleMatches = jobs.filter(job =>
    job.title && job.title.toLowerCase() === searchTermLower
  );

  // 2. Title starts with search term
  const startsWithMatches = jobs.filter(job =>
    job.title && job.title.toLowerCase().startsWith(searchTermLower) &&
    !exactTitleMatches.some(exactJob => exactJob._id === job._id)
  );

  // 3. Title contains search term
  const containsMatches = jobs.filter(job =>
    job.title && job.title.toLowerCase().includes(searchTermLower) &&
    !exactTitleMatches.some(exactJob => exactJob._id === job._id) &&
    !startsWithMatches.some(startJob => startJob._id === job._id)
  );

  // 4. Company name matches
  const companyMatches = jobs.filter(job =>
    job.company?.name && job.company.name.toLowerCase().includes(searchTermLower) &&
    !exactTitleMatches.some(exactJob => exactJob._id === job._id) &&
    !startsWithMatches.some(startJob => startJob._id === job._id) &&
    !containsMatches.some(containJob => containJob._id === job._id)
  );

  // 5. Skills include search term
  const skillMatches = jobs.filter(job => {
    // Check skills array
    if (job.skills && Array.isArray(job.skills)) {
      for (const skill of job.skills) {
        if (typeof skill === 'string' && skill.toLowerCase().includes(searchTermLower)) {
          return true;
        }
      }
    }
    return false;
  }).filter(job =>
    !exactTitleMatches.some(exactJob => exactJob._id === job._id) &&
    !startsWithMatches.some(startJob => startJob._id === job._id) &&
    !containsMatches.some(containJob => containJob._id === job._id) &&
    !companyMatches.some(companyJob => companyJob._id === job._id)
  );

  // 6. Description contains search term
  const descriptionMatches = jobs.filter(job =>
    job.description && job.description.toLowerCase().includes(searchTermLower) &&
    !exactTitleMatches.some(exactJob => exactJob._id === job._id) &&
    !startsWithMatches.some(startJob => startJob._id === job._id) &&
    !containsMatches.some(containJob => containJob._id === job._id) &&
    !companyMatches.some(companyJob => companyJob._id === job._id) &&
    !skillMatches.some(skillJob => skillJob._id === job._id)
  );

  // Get word boundaries for token matching with very short terms (1-2 chars)
  let tokenMatches = [];
  if (searchTermLower.length <= 2) {
    tokenMatches = jobs.filter(job => {
      if (!job.title) return false;

      // Split title into words
      const titleWords = job.title.toLowerCase().split(/\s+/);
      // Check if any word starts with our search term
      return titleWords.some(word => word.startsWith(searchTermLower));
    }).filter(job =>
      !exactTitleMatches.some(exactJob => exactJob._id === job._id) &&
      !startsWithMatches.some(startJob => startJob._id === job._id) &&
      !containsMatches.some(containJob => containJob._id === job._id) &&
      !companyMatches.some(companyJob => companyJob._id === job._id) &&
      !skillMatches.some(skillJob => skillJob._id === job._id) &&
      !descriptionMatches.some(descJob => descJob._id === job._id)
    );
  }

  // Combine all matches in order of relevance
  const combinedMatches = [
    ...exactTitleMatches,
    ...startsWithMatches,
    ...tokenMatches,
    ...containsMatches,
    ...companyMatches,
    ...skillMatches,
    ...descriptionMatches
  ];

  // If we have any matches, use them
  if (combinedMatches.length > 0) {
    console.log(`Found ${combinedMatches.length} total matches:
    - ${exactTitleMatches.length} exact title matches
    - ${startsWithMatches.length} 'starts with' matches
    - ${tokenMatches.length} token matches
    - ${containsMatches.length} 'contains' matches
    - ${companyMatches.length} company matches
    - ${skillMatches.length} skill matches
    - ${descriptionMatches.length} description matches`);

    return combinedMatches;
  }

  // For single character searches with no matches yet, find anything with that character
  if (searchTermLower.length === 1) {
    const singleCharMatches = jobs.filter(job =>
      job.title && job.title.toLowerCase().includes(searchTermLower)
    );

    if (singleCharMatches.length > 0) {
      console.log(`Found ${singleCharMatches.length} single character matches`);
      return singleCharMatches;
    }
  }

  // If no matches found, return original results
  return jobs;
};

/**
 * Get category suggestions for search autocomplete
 * @returns {Promise} - Array of category names
 */
export const getCategorySuggestions = async () => {
  try {
    const response = await getCategories();
    if (response.success) {
      return response.data.map(category => ({
        id: category._id,
        name: category.name
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching category suggestions:', error);
    return [];
  }
};

/**
 * Get location suggestions based on available job locations
 * @returns {Promise} - Array of location names
 */
export const getLocationSuggestions = async () => {
  try {
    // Fetch a sample of jobs to extract locations
    const response = await getJobs({ limit: 100 });
    if (response.success) {
      const locations = new Set();
      
      response.data.forEach(job => {
        if (job.location && job.location.trim() !== '') {
          locations.add(job.location.trim());
        }
      });
      
      return Array.from(locations).map(location => ({
        value: location,
        label: location
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching location suggestions:', error);
    return [];
  }
};

/**
 * Quick search for autocomplete suggestions
 * @param {string} query - The search query
 * @returns {Promise} - Search suggestions
 */
export const getSearchSuggestions = async (query) => {
  if (!query || query.trim() === '') {
    return [];
  }

  try {
    // Get jobs matching the query
    const results = await searchJobs({
      query,
      limit: 10,
      page: 1
    });

    // Extract unique job titles and companies
    const suggestions = new Set();
    
    results.data.forEach(job => {
      if (job.title) {
        suggestions.add(job.title);
      }
      
      if (job.company?.name) {
        suggestions.add(job.company.name);
      }
    });
    
    return Array.from(suggestions);
  } catch (error) {
    console.error('Error getting search suggestions:', error);
    return [];
  }
};

export default {
  searchJobs,
  filterAndRankResults,
  getCategorySuggestions,
  getLocationSuggestions,
  getSearchSuggestions
}; 
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Briefcase, Calendar, User, Clock, Tag, Check, X, AlertCircle, RefreshCw } from 'lucide-react';
import { getCategoryById, getJobsByCategory } from '../../../../services/categoryService';
import api from '../../../../utils/api';
import { formatDate } from '../../../../utils/dateUtils';

const ViewCategory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsLimit, setJobsLimit] = useState(5);
  const [jobsPage, setJobsPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  
  // Fetch category details
  const fetchCategoryDetails = async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    setError(null);
    
    try {
      const response = await getCategoryById(id);
      if (response && response.data) {
        console.log('Category data fetched:', response.data);
        setCategory(response.data);
        return response.data;
      } else {
        throw new Error('Invalid response format or empty data');
      }
    } catch (err) {
      console.error('Error fetching category details:', err);
      setError(err.message || 'Failed to load category details');
      setCategory(null);
      return null;
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };
  
  // Direct debugging function to determine how jobs are tied to categories
  const debugJobCategoryStructure = async (categoryName, categoryId) => {
    console.log('===== DEBUG: JOB CATEGORY STRUCTURE =====');
    console.log(`Checking jobs for category: ${categoryName} (ID: ${categoryId})`);

    try {
      // 1. First, get all jobs to inspect
      const allJobsResponse = await api.get('/jobs', { params: { limit: 100 } });
      
      if (!allJobsResponse.data || !allJobsResponse.data.data) {
        console.error('No jobs data available');
        return;
      }
      
      const allJobs = allJobsResponse.data.data;
      console.log(`Retrieved ${allJobs.length} total jobs for analysis`);
      
      // 2. Examine the first job to understand its structure
      if (allJobs.length > 0) {
        const sampleJob = allJobs[0];
        console.log('Sample job structure:', sampleJob);
        console.log('Category field type:', typeof sampleJob.category);
        console.log('Category field value:', sampleJob.category);
        
        // Check what field might contain the category
        const possibleFields = ['category', 'jobCategory', 'categories', 'type'];
        for (const field of possibleFields) {
          if (sampleJob[field]) {
            console.log(`Found possible category in field "${field}":`, sampleJob[field]);
          }
        }
      }
      
      // 3. Try different matching strategies
      const matchingStrategies = {
        exactMatch: [],
        lowercaseMatch: [],
        includes: [],
        idMatch: [],
        objectIdMatch: []
      };
      
      allJobs.forEach(job => {
        // Get the category field, whatever form it's in
        const jobCategory = job.category;
        
        // Skip if no category at all
        if (!jobCategory) return;
        
        // Exact string match
        if (typeof jobCategory === 'string' && jobCategory === categoryName) {
          matchingStrategies.exactMatch.push(job);
        }
        
        // Lowercase match
        if (typeof jobCategory === 'string' && 
            jobCategory.toLowerCase() === categoryName.toLowerCase()) {
          matchingStrategies.lowercaseMatch.push(job);
        }
        
        // Includes match
        if (typeof jobCategory === 'string' && 
            jobCategory.toLowerCase().includes(categoryName.toLowerCase())) {
          matchingStrategies.includes.push(job);
        }
        
        // ID match (if category is an ID string)
        if (typeof jobCategory === 'string' && jobCategory === categoryId) {
          matchingStrategies.idMatch.push(job);
        }
        
        // Object with ID match
        if (typeof jobCategory === 'object' && jobCategory?._id === categoryId) {
          matchingStrategies.objectIdMatch.push(job);
        }
      });
      
      console.log('Matching results:');
      for (const [strategy, jobs] of Object.entries(matchingStrategies)) {
        console.log(`- ${strategy}: ${jobs.length} jobs found`);
        if (jobs.length > 0) {
          console.log('  Sample matching job:', jobs[0].title);
        }
      }
      
      // 4. Try a direct API call with category ID 
      try {
        const idBasedResponse = await api.get(`/categories/${categoryId}/jobs`);
        console.log('Category ID-based API response:', idBasedResponse.data);
      } catch (err) {
        console.error('Error with category ID API call:', err.message);
      }
      
      console.log('===== END DEBUG =====');
      
      // Return the strategy that worked best
      for (const [strategy, jobs] of Object.entries(matchingStrategies)) {
        if (jobs.length > 0) {
          console.log(`Using "${strategy}" strategy with ${jobs.length} jobs`);
          return jobs;
        }
      }
      
      return [];
    } catch (err) {
      console.error('Error in debug function:', err);
      return [];
    }
  };

  // Modified fetchJobsByCategory to use different field matching approach
  const fetchJobsByCategory = async (categoryName, categoryId, reset = false) => {
    if (!categoryName) {
      console.error('Missing category name for job fetch');
      return [];
    }
    
    setJobsLoading(true);
    
    // Reset jobs if needed
    if (reset) {
      setJobs([]);
      setJobsPage(1);
    }
    
    try {
      console.log(`Attempting to fetch jobs for category "${categoryName}" with multiple strategies`);
      
      // First run the debugging function to understand the structure
      const debugJobs = await debugJobCategoryStructure(categoryName, categoryId);
      
      if (debugJobs && debugJobs.length > 0) {
        console.log(`Debug found ${debugJobs.length} jobs that match this category`);
        setJobs(debugJobs);
        
        // Update category with accurate job count
        setCategory(prev => ({
          ...prev,
          jobCount: debugJobs.length
        }));
        
        return debugJobs;
      }
      
      // Original implementation as fallback
      const response = await api.get('/jobs', { 
        params: { 
          limit: 100 // Get more jobs to ensure we have enough
        } 
      });
      
      if (!response.data || !response.data.data) {
        console.warn('Invalid response format or empty data');
        setJobs([]);
        return [];
      }
      
      const allJobs = response.data.data;
      console.log(`Retrieved ${allJobs.length} total jobs, attempting to match category`);
      
      // Try multiple strategies to match jobs to this category
      const matchingJobs = allJobs.filter(job => {
        // Check if category exists at all
        if (!job.category) return false;
        
        // Try object vs string matching
        if (typeof job.category === 'object') {
          // If category is an object, check its name property
          return job.category.name?.toLowerCase() === categoryName.toLowerCase();
        } else if (typeof job.category === 'string') {
          // Direct string match (case insensitive)
          return job.category.toLowerCase() === categoryName.toLowerCase() || 
                 job.category === categoryId;
        }
        
        return false;
      });
      
      console.log(`Found ${matchingJobs.length} jobs matching category "${categoryName}"`);
      
      if (matchingJobs.length > 0) {
        setJobs(matchingJobs);
        
        // Update category with accurate job count
        setCategory(prev => ({
          ...prev,
          jobCount: matchingJobs.length
        }));
        
        return matchingJobs;
      } else {
        setJobs([]);
        return [];
      }
    } catch (err) {
      console.error('Error fetching jobs for category:', err);
      setJobs([]);
      return [];
    } finally {
      setJobsLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    const loadInitialData = async () => {
      const categoryData = await fetchCategoryDetails();
      if (categoryData && categoryData.name) {
        console.log(`Starting job fetch for category: ${categoryData.name}`);
        
        // Pass both name and ID to allow for different matching strategies
        await fetchJobsByCategory(categoryData.name, categoryData._id, true);
      }
    };
    
    loadInitialData();
    
    // Refresh data periodically
    const refreshInterval = setInterval(() => {
      if (category && category.name) {
        console.log('Periodic refresh triggered');
        fetchJobsByCategory(category.name, category._id, true);
      }
    }, 120000); // 2 minutes
    
    return () => clearInterval(refreshInterval);
  }, [id]);
  
  // Handle manual refresh with debugging
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const categoryData = await fetchCategoryDetails(false);
      if (categoryData && categoryData.name) {
        await fetchJobsByCategory(categoryData.name, categoryData._id, true);
      }
    } finally {
      setRefreshing(false);
    }
  };
  
  // Handle back button click
  const handleBack = () => {
    navigate('/admin/categories');
  };
  
  // Handle edit button click
  const handleEdit = () => {
    navigate(`/admin/categories/edit/${id}`);
  };
  
  // Handle load more jobs - this is now unnecessary since we're loading all at once
  const handleLoadMoreJobs = async () => {
    if (category && category.name) {
      if (jobs.length < 10) {
        // If we have few jobs, try the fallback method to find more
        await fetchJobsByCategory(category.name, category._id, true);
      }
    }
  };
  
  if (loading) {
    return (
      <div className="section-body flex items-center justify-center h-64">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-500">Loading category details...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="section-body">
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Category</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button 
            onClick={handleBack}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Back to Categories
          </button>
        </div>
      </div>
    );
  }
  
  if (!category) {
    return (
      <div className="section-body">
        <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Category Not Found</h3>
          <p className="text-yellow-700 mb-4">The requested category could not be found.</p>
          <button 
            onClick={handleBack}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Back to Categories
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="section-body">
      <div className="page-header mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <button 
            className="mr-4 p-2 rounded-md hover:bg-gray-100" 
            onClick={handleBack}
            title="Back to Categories"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Category Details</h1>
            <p className="text-gray-500">View information about this job category</p>
          </div>
        </div>
        <button 
          onClick={handleEdit}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center transition-colors"
        >
          <Edit size={18} className="mr-1" />
          <span>Edit Category</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="font-semibold">Category Information</h3>
            </div>
            <div className="p-6">
              {/* Header with image and name */}
              <div className="flex items-center mb-6">
                {category.image && category.image.url ? (
                  <div className="w-16 h-16 rounded-lg overflow-hidden mr-4">
                    <img 
                      src={category.image.url} 
                      alt={category.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div 
                    className="w-16 h-16 rounded-lg flex items-center justify-center mr-4"
                    style={{ backgroundColor: category.color || '#3b82f6' }}
                  >
                    <span className="text-2xl text-white">{category.icon || '📁'}</span>
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-bold">{category.name}</h2>
                  {category.featured && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
                      Featured
                    </span>
                  )}
                  <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    category.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {category.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              
              {/* Description */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-500 mb-2">Description</h4>
                <p className="text-gray-700">{category.description}</p>
              </div>
              
              {/* Jobs Count */}
              <div className="p-4 bg-blue-50 rounded-lg flex items-center">
                <Briefcase className="text-blue-500 mr-3" />
                <div>
                  <p className="font-medium">{category.jobCount || 0} Jobs in this category</p>
                  <p className="text-sm text-gray-600">
                    {category.jobCount > 0 
                      ? `Click below to view all jobs in this category` 
                      : `No jobs are currently using this category`
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* SEO Information */}
          {(category.metaTitle || category.metaDescription) && (
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="p-4 border-b">
                <h3 className="font-semibold">SEO Information</h3>
              </div>
              <div className="p-6">
                {category.metaTitle && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Meta Title</h4>
                    <p className="bg-gray-50 p-3 rounded border">{category.metaTitle}</p>
                  </div>
                )}
                
                {category.metaDescription && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Meta Description</h4>
                    <p className="bg-gray-50 p-3 rounded border">{category.metaDescription}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Related Jobs */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold">Recent Jobs in this Category</h3>
              <button 
                onClick={handleRefresh}
                className="p-2 rounded-md hover:bg-gray-100 text-gray-600"
                disabled={refreshing || jobsLoading}
                title="Refresh jobs list"
              >
                <RefreshCw size={16} className={`${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <div className="p-6">
              {jobsLoading && jobs.length === 0 ? (
                <div className="flex justify-center items-center py-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : jobs.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <Briefcase className="mx-auto h-10 w-10 text-gray-300 mb-2" />
                  <p>No jobs found in this category</p>
                  <button 
                    onClick={handleRefresh}
                    className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center mx-auto"
                    disabled={refreshing}
                  >
                    <RefreshCw size={14} className={`mr-1 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {jobs.map(job => (
                    <div key={job._id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{job.title}</h4>
                          <div className="text-sm text-gray-500 mt-1">
                            {typeof job.company === 'object' ? 
                              (job.company.name || 'Unknown Company') : 
                              (job.company || 'Unknown Company')}
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          job.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {job.status}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                        {job.location && (
                          <div className="flex items-center">
                            <Tag size={14} className="mr-1" />
                            {job.location}
                          </div>
                        )}
                        {job.jobType && (
                          <div className="flex items-center">
                            <Clock size={14} className="mr-1" />
                            {job.jobType}
                          </div>
                        )}
                        {job.postedDate && (
                          <div className="flex items-center">
                            <Calendar size={14} className="mr-1" />
                            Posted {formatDate(job.postedDate)}
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-3">
                        <button 
                          onClick={() => navigate(`/admin/jobs/view/${job._id}`)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {jobsLoading && jobs.length > 0 && (
                    <div className="flex justify-center items-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    </div>
                  )}
                  
                  {!jobsLoading && jobs.length > 0 && jobs.length < (category.jobCount || 0) && (
                    <div className="text-center pt-2">
                      <button 
                        onClick={handleLoadMoreJobs}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Load More Jobs
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Category Stats */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="font-semibold">Category Details</h3>
            </div>
            <div className="p-6">
              <ul className="space-y-4">
                {/* Color */}
                <li className="flex items-center justify-between">
                  <span className="text-gray-600">Category Color</span>
                  <div 
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: category.color || '#3b82f6' }}
                  ></div>
                </li>
                
                {/* Featured */}
                <li className="flex items-center justify-between">
                  <span className="text-gray-600">Featured</span>
                  {category.featured ? (
                    <Check className="text-green-500" size={18} />
                  ) : (
                    <X className="text-gray-400" size={18} />
                  )}
                </li>
                
                {/* Status */}
                <li className="flex items-center justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    category.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {category.status || 'inactive'}
                  </span>
                </li>
                
                {/* Slug */}
                {category.slug && (
                  <li className="flex items-center justify-between">
                    <span className="text-gray-600">URL Slug</span>
                    <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                      {category.slug}
                    </span>
                  </li>
                )}
                
                {/* Created Date */}
                {category.createdAt && (
                  <li className="flex items-center justify-between">
                    <span className="text-gray-600">Created</span>
                    <span className="text-sm text-gray-700">
                      {formatDate(category.createdAt)}
                    </span>
                  </li>
                )}
                
                {/* Last Updated */}
                {category.updatedAt && (
                  <li className="flex items-center justify-between">
                    <span className="text-gray-600">Last Updated</span>
                    <span className="text-sm text-gray-700">
                      {formatDate(category.updatedAt)}
                    </span>
                  </li>
                )}
                
                {/* Created By */}
                {category.createdBy && (
                  <li className="flex items-center justify-between">
                    <span className="text-gray-600">Created By</span>
                    <div className="flex items-center">
                      <User size={14} className="mr-1 text-gray-500" />
                      <span className="text-sm text-gray-700">
                        {category.createdBy.name || category.createdBy}
                      </span>
                    </div>
                  </li>
                )}
              </ul>
            </div>
          </div>
          
          {/* Actions */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="font-semibold">Actions</h3>
            </div>
            <div className="p-6 space-y-3">
              <button 
                onClick={handleEdit}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center justify-center"
              >
                <Edit size={16} className="mr-2" />
                Edit this category
              </button>
              
              <button 
                onClick={handleRefresh}
                className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 px-4 rounded-md flex items-center justify-center"
                disabled={refreshing}
              >
                <RefreshCw size={16} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh Data
              </button>
              
              {category.jobCount > 0 && (
                <a 
                  href={`/admin/jobs?category=${category.slug || category.name}`}
                  className="w-full block bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-md text-center"
                >
                  View jobs in this category
                </a>
              )}
              
              <button 
                onClick={handleBack}
                className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 px-4 rounded-md"
              >
                Back to Categories
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewCategory; 
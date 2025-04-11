import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Briefcase, Calendar, User, Clock, Tag, Check, X, AlertCircle } from 'lucide-react';
import { getCategoryById, getJobsByCategory } from '../../../../services/categoryService';
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
  
  useEffect(() => {
    const fetchCategoryDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await getCategoryById(id);
        setCategory(response.data);
        
        // Fetch related jobs after getting category details
        fetchRelatedJobs();
      } catch (err) {
        console.error('Error fetching category details:', err);
        setError(err.message || 'Failed to load category details');
        setCategory(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategoryDetails();
  }, [id]);
  
  const fetchRelatedJobs = async () => {
    setJobsLoading(true);
    
    try {
      const response = await getJobsByCategory(id, { limit: jobsLimit });
      setJobs(response.data);
    } catch (err) {
      console.error('Error fetching related jobs:', err);
      setJobs([]);
    } finally {
      setJobsLoading(false);
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
  
  // Handle load more jobs
  const handleLoadMoreJobs = () => {
    setJobsLimit(prevLimit => prevLimit + 5);
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
            <div className="p-4 border-b">
              <h3 className="font-semibold">Recent Jobs in this Category</h3>
            </div>
            <div className="p-6">
              {jobsLoading ? (
                <div className="flex justify-center items-center py-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : jobs.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <Briefcase className="mx-auto h-10 w-10 text-gray-300 mb-2" />
                  <p>No jobs found in this category</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {jobs.map(job => (
                    <div key={job._id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{job.title}</h4>
                          <div className="text-sm text-gray-500 mt-1">{job.company}</div>
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
                  
                  {jobs.length < category.jobCount && (
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
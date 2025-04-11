import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  AlertCircle,
  Loader,
  Filter,
  Calendar,
  MapPin,
  Briefcase,
  Clock,
  DollarSign
} from 'lucide-react';
import { getJobs, deleteJob } from '../../../../services/jobService';
import { getCategories } from '../../../../services/categoryService';
import { formatDate, formatSalary } from '../../../../utils/formatters';
import { toast } from 'react-toastify';

const Jobs = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  // State management
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(queryParams.get('category') || '');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  
  // Delete confirmation
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load categories for filtering
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await getCategories();
        if (response.success && response.data) {
          setCategories(response.data);
        }
      } catch (err) {
        console.error('Error loading categories:', err);
      }
    };
    
    loadCategories();
  }, []);

  // Function to fetch jobs with filters and pagination
  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Prepare query parameters
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        sort: sortBy
      };
      
      // Add filters if set
      if (selectedCategory) {
        params.category = selectedCategory;
      }
      
      if (selectedStatus) {
        params.status = selectedStatus;
      }
      
      if (selectedType) {
        params.type = selectedType;
      }
      
      // Call API
      const response = await getJobs(params);
      
      // Update state with response data
      if (response.success) {
        setJobs(response.data);
        // Handle different response structures (with meta or pagination object)
        if (response.meta) {
          setTotalItems(response.meta.total || 0);
          setTotalPages(response.meta.totalPages || 1);
        } else if (response.pagination) {
          setTotalItems(response.pagination.total || 0);
          setTotalPages(response.pagination.totalPages || 1);
        } else {
          // Fallback to data length if no pagination info
          setTotalItems(response.data.length);
          setTotalPages(1);
        }
      } else {
        throw new Error(response.message || 'Failed to fetch jobs');
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError(err.message || 'Failed to fetch jobs');
      setJobs([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch jobs when dependencies change
  useEffect(() => {
    fetchJobs();
  }, [currentPage, itemsPerPage, sortBy, selectedCategory, selectedStatus, selectedType]);
  
  // Handle search with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      // Reset to first page when searching
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchJobs();
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  // Reset filters
  const resetFilters = () => {
    setSelectedCategory('');
    setSelectedStatus('');
    setSelectedType('');
    setSortBy('newest');
    setSearchTerm('');
    setCurrentPage(1);
    
    // Remove category from URL if present
    if (queryParams.has('category')) {
      navigate('/admin/jobs');
    }
  };
  
  // Handle page changes
  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Open delete confirmation modal
  const confirmDelete = (job) => {
    setJobToDelete(job);
    setShowDeleteModal(true);
  };

  // Handle job deletion
  const handleDelete = async () => {
    if (!jobToDelete || isDeleting) return;
    
    setIsDeleting(true);
    
    try {
      const response = await deleteJob(jobToDelete._id);
      
      if (response.success) {
        // Remove from local state
        setJobs(jobs.filter(j => j._id !== jobToDelete._id));
        toast.success('Job deleted successfully');
      } else {
        throw new Error(response.message || 'Failed to delete job');
      }
      
      // Close modal
      setShowDeleteModal(false);
      setJobToDelete(null);
      
      // Refresh data if needed
      if (jobs.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      } else if (jobs.length === 1) {
        fetchJobs();
      }
    } catch (err) {
      console.error('Error deleting job:', err);
      toast.error(err.message || 'Failed to delete job');
      setError(err.message || 'Failed to delete job');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // Get category name by ID
  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat._id === categoryId);
    return category ? category.name : 'Unknown Category';
  };

  return (
    <div className="ml-64 p-6">
      <div className="bg-white rounded-lg shadow p-4 mb-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Job Listings</h1>
            <p className="text-gray-500">Manage all job postings and applications</p>
          </div>
          <Link 
            to="/admin/jobs/create" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center transition-colors"
          >
            <Plus size={18} className="mr-1" />
            <span>Post New Job</span>
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <div className="flex flex-col space-y-4">
          {/* Search and Filter Button */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-64">
              <input 
                type="text" 
                placeholder="Search jobs by title or location..." 
                className="w-full px-4 py-2 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
            
            <div className="flex gap-2 w-full md:w-auto">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center justify-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50"
              >
                <Filter size={18} />
                <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
              </button>
              
              <select 
                className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Sort by Newest</option>
                <option value="title">Sort by Title</option>
                <option value="salary_high">Sort by Highest Salary</option>
                <option value="salary_low">Sort by Lowest Salary</option>
              </select>
            </div>
          </div>
          
          {/* Additional Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t mt-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select 
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
                <select 
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>
              
              <div className="md:col-span-3">
                <button 
                  onClick={resetFilters}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md flex items-center">
          <AlertCircle size={18} className="mr-2" />
          <p>{error}</p>
        </div>
      )}

      {/* Job Listings */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {/* Table Header */}
        <div className="w-full overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job Title
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Category
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  Location
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Salary
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Posted
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                    {loading ? (
                      <div className="flex justify-center items-center">
                        <Loader className="animate-spin h-8 w-8 text-blue-500" />
                      </div>
                    ) : error ? (
                      <div className="flex flex-col items-center">
                        <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
                        <p className="text-red-500">{error}</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Briefcase className="h-10 w-10 text-gray-300 mb-2" />
                        <p>No jobs found</p>
                        {(searchTerm || selectedCategory || selectedStatus || selectedType) && (
                          <button
                            onClick={resetFilters}
                            className="mt-3 text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Clear filters
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                jobs.map(job => (
                  <tr key={job._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {job.title}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center md:hidden">
                            <MapPin size={14} className="mr-1" /> {job.location}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap hidden md:table-cell">
                      <div className="text-sm text-gray-900">
                        {job.category?.name || getCategoryName(job.category) || 'Uncategorized'}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap hidden sm:table-cell">
                      <div className="text-sm text-gray-900 flex items-center">
                        <MapPin size={16} className="mr-1 text-gray-400" />
                        {job.location}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap hidden lg:table-cell">
                      <div className="text-sm text-gray-900">
                        {formatSalary(
                          job.salary?.min,
                          job.salary?.max,
                          job.salary?.currency || 'USD'
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap hidden md:table-cell">
                      <div className="text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar size={14} className="mr-1" />
                          {formatDate(job.createdAt)}
                        </div>
                        <div className="text-xs mt-1 flex items-center">
                          <Clock size={12} className="mr-1" />
                          {job.type?.replace('-', ' ')}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${job.status === 'active' ? 'bg-green-100 text-green-800' :
                          job.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'}`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link
                          to={`/admin/jobs/view/${job._id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="View"
                        >
                          <Eye size={18} />
                        </Link>
                        <Link
                          to={`/admin/jobs/edit/${job._id}`}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </Link>
                        <button
                          onClick={() => confirmDelete(job)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {jobs.length > 0 && totalPages > 1 && (
          <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, totalItems)}
                  </span>{' '}
                  of <span className="font-medium">{totalItems}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                      currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </button>
                  
                  {/* Mobile pagination */}
                  <div className="sm:hidden px-4 py-2 border border-gray-300 bg-white">
                    <span className="text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                  </div>
                  
                  {/* Desktop pagination */}
                  <div className="hidden sm:flex">
                    {[...Array(totalPages).keys()].map(number => (
                      <button
                        key={number + 1}
                        onClick={() => paginate(number + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                          currentPage === number + 1
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {number + 1}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                      currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                </nav>
              </div>
            </div>
            {/* Mobile pagination controls */}
            <div className="flex justify-between w-full sm:hidden">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  currentPage === 1 ? 'text-gray-300 bg-gray-100' : 'text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                <ChevronLeft className="h-5 w-5 mr-1" />
                Previous
              </button>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  currentPage === totalPages ? 'text-gray-300 bg-gray-100' : 'text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                Next
                <ChevronRight className="h-5 w-5 ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-sm text-gray-500 mb-4">
              Are you sure you want to delete the job "{jobToDelete?.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md flex items-center"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader size={16} className="animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} className="mr-2" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Jobs; 
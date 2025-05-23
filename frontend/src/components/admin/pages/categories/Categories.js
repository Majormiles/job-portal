import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  RefreshCw
} from 'lucide-react';
import { 
  getCategories, 
  deleteCategory, 
  getCategoryStats, 
  updateCategoryJobCount,
  getJobsByCategory
} from '../../../../services/categoryService';
import api from '../../../../utils/api';
import { toast } from 'react-hot-toast';

const Categories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterFeatured, setFilterFeatured] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [refreshingJobCounts, setRefreshingJobCounts] = useState(false);

  // Function to fetch categories from API
  const fetchCategories = async () => {
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
      if (filterStatus) {
        params.status = filterStatus;
      }
      
      if (filterFeatured) {
        params.featured = filterFeatured;
      }
      
      // Call API
      const response = await getCategories(params);
      
      // Update state with response data
      setCategories(response.data);
      setTotalItems(response.meta.total);
      setTotalPages(response.meta.totalPages);
      
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err.message || 'Failed to fetch categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Function to update job counts for categories
  const updateCategoryJobCounts = async () => {
    try {
      setRefreshingJobCounts(true);
      console.log("Starting to update category job counts");
      
      // APPROACH 1: Direct call to get all jobs
      try {
        console.log("Fetching all jobs to count by category");
        const jobsResponse = await api.get('/jobs');
        console.log("Jobs response status:", jobsResponse.status);
        
        if (jobsResponse.data && jobsResponse.data.data) {
          const allJobs = jobsResponse.data.data;
          console.log(`Retrieved ${allJobs.length} jobs for counting`);
          
          // Create a count map for each category
          const categoryCountMap = {};
          
          // Process each job to extract category info
          allJobs.forEach(job => {
            if (!job) return;
            
            // Different possible formats for the category field
            let categoryName = null;
            let categoryId = null;
            
            if (typeof job.category === 'string') {
              categoryName = job.category;
            } else if (typeof job.category === 'object' && job.category) {
              // If category is an object with name or _id property
              categoryName = job.category.name;
              categoryId = job.category._id;
            }
            
            // Count jobs per category using both name and ID
            if (categoryName) {
              categoryCountMap[categoryName] = (categoryCountMap[categoryName] || 0) + 1;
            }
            
            if (categoryId) {
              categoryCountMap[categoryId] = (categoryCountMap[categoryId] || 0) + 1;
            }
          });
          
          console.log("Job counts by category:", categoryCountMap);
          
          // Update our categories with job counts
          if (categories.length > 0) {
            const updatedCategories = categories.map(category => {
              // Check count by both name and ID
              const countByName = categoryCountMap[category.name] || 0;
              const countById = categoryCountMap[category._id] || 0;
              // Use the higher count (to avoid missing any jobs)
              const count = Math.max(countByName, countById);
              
              return {
                ...category,
                jobCount: count
              };
            });
            
            console.log("Updated categories from approach 1:", updatedCategories.map(c => ({ name: c.name, jobCount: c.jobCount })));
            setCategories(updatedCategories);
          }
        }
      } catch (error) {
        console.error("Error in approach 1:", error.message, error.response?.status, error.response?.data);
      }
      
      // APPROACH 2: Fetch by category ID
      if (categories.length > 0) {
        try {
          console.log("Trying direct approach using category endpoints");
          const updatedCats = await Promise.all(
            categories.map(async (category) => {
              try {
                // Get jobs for each category
                const response = await getJobsByCategory(category._id);
                console.log(`Category ${category.name} (${category._id}) response:`, response);
                
                let jobCount = 0;
                // Check different response formats
                if (response && response.data) {
                  jobCount = Array.isArray(response.data) ? response.data.length : 0;
                } else if (response && response.meta && response.meta.total) {
                  jobCount = response.meta.total;
                }
                
                return {
                  ...category,
                  jobCount
                };
              } catch (err) {
                console.error(`Error getting jobs for ${category.name}:`, err.message);
                return category;
              }
            })
          );
          
          // Only update if we got any counts
          const hasChanges = updatedCats.some(cat => cat.jobCount > 0);
          if (hasChanges) {
            console.log("Setting updated categories from approach 2:", updatedCats.map(c => ({ name: c.name, jobCount: c.jobCount })));
            setCategories(updatedCats);
          }
        } catch (error) {
          console.error("Error in approach 2:", error.message, error.response?.status);
        }
      }
      
      // APPROACH 3: Try admin stats endpoint
      try {
        console.log("Getting counts from admin stats");
        const statsResponse = await getCategoryStats();
        console.log("Stats response:", statsResponse);
        
        if (statsResponse && statsResponse.data) {
          // Check if response has category counts
          const statsData = statsResponse.data;
          
          // Try different possible response formats
          if (statsData.categoryCounts || statsData.counts) {
            const countData = statsData.categoryCounts || statsData.counts || {};
            console.log("Category count data:", countData);
            
            // Update categories with count data if available
            setCategories(prevCategories => 
              prevCategories.map(cat => {
                // Try both ID and name as keys
                const count = 
                  countData[cat._id] || 
                  countData[cat.name] || 
                  cat.jobCount;
                  
                return { ...cat, jobCount: count };
              })
            );
            
            console.log("Updated categories from approach 3:", categories.map(c => ({ name: c.name, jobCount: c.jobCount })));
          }
        }
      } catch (statsError) {
        console.error("Error fetching admin stats:", statsError.message, statsError.response?.status, statsError.response?.data);
      }

      // Log final results
      console.log("Final category job counts:", categories.map(c => ({ name: c.name, jobCount: c.jobCount })));
      
    } catch (error) {
      console.error("Error updating job counts:", error);
      toast.error("Failed to update job counts");
    } finally {
      setRefreshingJobCounts(false);
    }
  };
  
  // Function to manually refresh job counts with user feedback
  const handleRefreshJobCounts = async () => {
    try {
      setRefreshingJobCounts(true);
      await updateCategoryJobCounts();
      
      // Force a complete data refresh from server
      await fetchCategories();
    } catch (err) {
      console.error('Error refreshing job counts:', err);
    } finally {
      setRefreshingJobCounts(false);
    }
  };
  
  // Fetch categories on mount and when dependencies change
  useEffect(() => {
    fetchCategories();
  }, [currentPage, itemsPerPage, sortBy, filterStatus, filterFeatured]);
  
  // Update job counts after categories are loaded
  useEffect(() => {
    if (categories.length > 0 && !loading) {
      // Add a small delay to ensure UI is responsive
      const timer = setTimeout(() => {
        updateCategoryJobCounts();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [categories.length, loading]);
  
  // Set up periodic job count refresh (every 2 minutes)
  useEffect(() => {
    const interval = setInterval(() => {
      if (categories.length > 0) {
        updateCategoryJobCounts();
      }
    }, 120000); // 2 minutes
    
    return () => clearInterval(interval);
  }, [categories.length]);
  
  // Handle search with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      // Reset to first page when searching
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchCategories();
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);
  
  // Reset filters
  const resetFilters = () => {
    setFilterStatus('');
    setFilterFeatured('');
    setSortBy('name');
    setSearchTerm('');
    setCurrentPage(1);
  };
  
  // Handle page changes
  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Open delete confirmation modal
  const confirmDelete = (category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  // Handle category deletion
  const handleDelete = async () => {
    if (!categoryToDelete || isDeleting) return;
    
    setIsDeleting(true);
    
    try {
      await deleteCategory(categoryToDelete._id);
      
      // Remove from local state
      setCategories(categories.filter(c => c._id !== categoryToDelete._id));
      
      // Close modal
      setShowDeleteModal(false);
      setCategoryToDelete(null);
      
      // Refresh data if needed
      if (categories.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      } else {
        fetchCategories();
      }
    } catch (err) {
      setError(err.message || 'Failed to delete category');
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Handle editing a category
  const handleEdit = (id) => {
    navigate(`/admin/categories/edit/${id}`);
  };
  
  // Handle viewing a category
  const handleView = (id) => {
    navigate(`/admin/categories/view/${id}`);
  };

  return (
    <div className="section-body">
      <div className="page-header mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Job Categories</h1>
          <p className="text-gray-500">Manage your job categories and classifications</p>
        </div>
        <Link to="/admin/categories/create" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center transition-colors">
          <Plus size={18} className="mr-1" />
          <span>Add Category</span>
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <div className="flex flex-col space-y-4">
          {/* Search and Filter Button */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-64">
              <input 
                type="text" 
                placeholder="Search categories..." 
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
                <option value="name">Sort by Name</option>
                <option value="jobCount">Sort by Job Count</option>
                <option value="newest">Sort by Newest</option>
              </select>
            </div>
          </div>
          
          {/* Additional Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t mt-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Featured</label>
                <select 
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  value={filterFeatured}
                  onChange={(e) => setFilterFeatured(e.target.value)}
                >
                  <option value="">All Categories</option>
                  <option value="true">Featured Only</option>
                  <option value="false">Non-Featured Only</option>
                </select>
              </div>
              
              <div className="flex items-end">
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
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
          <p className="flex items-center">
            <AlertCircle size={18} className="mr-2" />
            {error}
          </p>
        </div>
      )}

      {/* Categories List */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-semibold">All Categories</h3>
          
          <button 
            onClick={handleRefreshJobCounts}
            disabled={refreshingJobCounts || loading}
            className="flex items-center text-blue-600 hover:text-blue-800 px-2 py-1 rounded text-sm"
            title="Refresh job counts"
          >
            <RefreshCw 
              size={16} 
              className={`mr-1 ${refreshingJobCounts ? 'animate-spin' : ''}`} 
            />
            <span>Refresh Job Counts</span>
          </button>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
              <p className="text-gray-500">Loading categories...</p>
            </div>
          </div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center">
            <AlertCircle className="mx-auto text-gray-400 mb-2" size={32} />
            <p className="text-gray-500 mb-4">
              {searchTerm || filterStatus || filterFeatured
                ? "No categories match your filters."
                : "No categories found. Create your first category to get started."}
            </p>
            {(searchTerm || filterStatus || filterFeatured) && (
              <button 
                onClick={resetFilters}
                className="px-4 py-2 text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-full">
                <thead>
                  <tr className="text-gray-500 text-sm border-b bg-gray-50">
                    <th className="p-3 text-left">Name</th>
                    <th className="p-3 text-left">Description</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-center">Jobs</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category._id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="flex items-center">
                          <div 
                            className="w-8 h-8 rounded-md flex items-center justify-center mr-3"
                            style={{ backgroundColor: category.color }}
                          >
                            <span>{category.icon}</span>
                          </div>
                          <div>
                            <span className="font-medium">{category.name}</span>
                            {category.featured && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                Featured
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-sm text-gray-600">
                        <div className="line-clamp-2">{category.description}</div>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          category.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {category.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center justify-center gap-1 w-20 mx-auto">
                          {refreshingJobCounts ? (
                            <>
                              <RefreshCw size={12} className="animate-spin" />
                              <span>...</span>
                            </>
                          ) : (
                            <>
                              {typeof category.jobCount === 'number' ? `${category.jobCount} jobs` : '0 jobs'}
                            </>
                          )}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center space-x-3">
                          <button 
                            className="text-gray-500 hover:text-blue-600"
                            title="View Details"
                            onClick={() => handleView(category._id)}
                          >
                            <Eye size={18} />
                          </button>
                          <button 
                            className="text-gray-500 hover:text-green-600"
                            title="Edit Category"
                            onClick={() => handleEdit(category._id)}
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            className="text-gray-500 hover:text-red-600"
                            title="Delete Category"
                            onClick={() => confirmDelete(category)}
                            disabled={category.jobCount > 0}
                          >
                            <Trash2 size={18} className={category.jobCount > 0 ? 'opacity-50 cursor-not-allowed' : ''} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries
                </div>
                <div className="flex items-center space-x-1">
                  <button 
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-md ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  
                  {[...Array(totalPages).keys()].map(number => {
                    // Only show a specific range of pages
                    if (
                      number + 1 === 1 ||
                      number + 1 === totalPages ||
                      (number + 1 >= currentPage - 1 && number + 1 <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={number + 1}
                          onClick={() => paginate(number + 1)}
                          className={`w-8 h-8 rounded-md ${
                            currentPage === number + 1 
                              ? 'bg-blue-600 text-white' 
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {number + 1}
                        </button>
                      );
                    } else if (
                      (number + 1 === currentPage - 2 && currentPage > 3) ||
                      (number + 1 === currentPage + 2 && currentPage < totalPages - 2)
                    ) {
                      return <span key={number + 1} className="px-2">...</span>;
                    }
                    return null;
                  })}
                  
                  <button 
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-md ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Delete Category</h3>
            <p className="mb-4">
              Are you sure you want to delete the category <span className="font-medium">{categoryToDelete?.name}</span>?
              This action cannot be undone.
            </p>
            
            {categoryToDelete?.jobCount > 0 ? (
              <p className="mb-6 text-sm text-red-600 bg-red-50 p-3 rounded">
                This category has {categoryToDelete.jobCount} jobs associated with it. You must reassign these jobs before deleting.
              </p>
            ) : (
              <p className="mb-6 text-sm text-yellow-600 bg-yellow-50 p-3 rounded">
                This will permanently delete the category from the system.
              </p>
            )}
            
            <div className="flex justify-end space-x-3">
              <button 
                className="px-4 py-2 border rounded-md hover:bg-gray-100"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
                onClick={handleDelete}
                disabled={isDeleting || (categoryToDelete?.jobCount > 0)}
              >
                {isDeleting ? (
                  <>
                    <Loader size={16} className="animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories; 
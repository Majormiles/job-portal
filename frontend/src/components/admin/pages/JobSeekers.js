import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown, ChevronUp, Eye, Mail, Phone, Download, Trash, CheckCircle, XCircle, AlertCircle, Clock, ArrowUpDown, MapPin } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getAllApplications, updateApplicationStatus, addApplicationNotes, deleteApplication } from '../../../services/applicationService';
import { getJobs } from '../../../services/jobService';

const JobSeekers = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // State for applicants data
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for job data (for filtering)
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  
  // State for filters
  const [filters, setFilters] = useState({
    status: 'all',
    jobId: 'all',
    searchQuery: '',
    dateRange: 'all'
  });
  
  // State for sort options
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  
  // State for UI
  const [showFilters, setShowFilters] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [notes, setNotes] = useState('');
  const [notesSaving, setNotesSaving] = useState(false);
  
  // Fetch jobs for filtering
  useEffect(() => {
    const fetchJobs = async () => {
      setJobsLoading(true);
      try {
        const response = await getJobs();
        if (response.success) {
          setJobs(response.data);
        }
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setJobs([]);
      } finally {
        setJobsLoading(false);
      }
    };
    
    fetchJobs();
  }, []);
  
  // Fetch applicants based on filters and sorting
  useEffect(() => {
    const fetchApplicants = async () => {
      setLoading(true);
      setError(null); // Reset error state
      
      try {
        // Prepare params for API
        const params = {
          page: currentPage,
          limit: itemsPerPage,
          sortBy: sortField,
          sortOrder: sortDirection
        };
        
        // Add filters if not 'all'
        if (filters.status !== 'all') {
          params.status = filters.status;
        }
        
        if (filters.jobId !== 'all') {
          params.jobId = filters.jobId;
        }
        
        if (filters.searchQuery) {
          params.search = filters.searchQuery;
        }
        
        // Add date range filter
        if (filters.dateRange !== 'all') {
          const now = new Date();
          let startDate;
          
          switch(filters.dateRange) {
            case 'today':
              startDate = new Date(now);
              startDate.setHours(0, 0, 0, 0);
              params.startDate = startDate.toISOString();
              break;
            case 'week':
              startDate = new Date(now);
              startDate.setDate(now.getDate() - 7);
              params.startDate = startDate.toISOString();
              break;
            case 'month':
              startDate = new Date(now);
              startDate.setMonth(now.getMonth() - 1);
              params.startDate = startDate.toISOString();
              break;
            default:
              break;
          }
        }
        
        console.log('Fetching applicants with params:', params);
        
        const response = await getAllApplications(params);
        
        if (response.success) {
          console.log('Successfully fetched applicants:', response.data);
          
          // Ensure skills array is properly formatted
          const formattedData = response.data.map(applicant => ({
            ...applicant,
            skills: Array.isArray(applicant.skills) 
              ? applicant.skills 
              : (typeof applicant.skills === 'string' 
                ? applicant.skills.split(',').map(s => s.trim()) 
                : [])
          }));
          
          setApplicants(formattedData);
          setTotalItems(response.totalCount || formattedData.length);
        } else {
          console.error('Failed to fetch applicants:', response.message);
          setError('Unable to fetch applicants: ' + response.message);
          setApplicants([]);
          setTotalItems(0);
        }
      } catch (err) {
        console.error('Error fetching applicants:', err);
        setError('The API service is currently unavailable. Please check your backend server or try again later.');
        setApplicants([]);
        setTotalItems(0);
      } finally {
        setLoading(false);
      }
    };
    
    fetchApplicants();
  }, [filters, currentPage, itemsPerPage, sortField, sortDirection]);
  
  // Get current page items
  const currentApplicants = () => {
    return applicants;
  };
  
  // Calculate total pages
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  // Helper to get status badge color
  const getStatusBadgeColor = (status) => {
    switch(status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800';
      case 'interviewed':
        return 'bg-purple-100 text-purple-800';
      case 'offered':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Helper to get status icon
  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending':
        return <Clock size={16} className="text-yellow-500" />;
      case 'reviewed':
        return <CheckCircle size={16} className="text-blue-500" />;
      case 'interviewed':
        return <CheckCircle size={16} className="text-purple-500" />;
      case 'offered':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'rejected':
        return <XCircle size={16} className="text-red-500" />;
      default:
        return <AlertCircle size={16} className="text-gray-500" />;
    }
  };
  
  // Handle sort change
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Handle filter change
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };
  
  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    // Filters are already applied in the API call
  };
  
  // View applicant details
  const handleViewApplicant = async (applicant) => {
    setSelectedApplicant(applicant);
    setNotes(applicant.notes || '');
    setShowModal(true);
  };
  
  // Close modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedApplicant(null);
    setNotes('');
  };
  
  // Update applicant status
  const handleUpdateStatus = async (applicantId, newStatus) => {
    try {
      const response = await updateApplicationStatus(applicantId, newStatus);
      
      if (response.success) {
        // Update local state
        setApplicants(prev => 
          prev.map(app => 
            app._id === applicantId ? { ...app, status: newStatus } : app
          )
        );
        
        // If modal is open with this applicant, update there too
        if (selectedApplicant && selectedApplicant._id === applicantId) {
          setSelectedApplicant(prev => ({ ...prev, status: newStatus }));
        }
        
        toast.success(`Application status updated to ${newStatus}`);
      } else {
        toast.error(response.message || 'Failed to update status');
      }
    } catch (err) {
      console.error('Error updating application status:', err);
      toast.error(err.message || 'Failed to update status');
    }
  };
  
  // Save notes
  const handleSaveNotes = async () => {
    if (!selectedApplicant) return;
    
    setNotesSaving(true);
    
    try {
      const response = await addApplicationNotes(selectedApplicant._id, notes);
      
      if (response.success) {
        // Update local state
        setApplicants(prev => 
          prev.map(app => 
            app._id === selectedApplicant._id ? { ...app, notes } : app
          )
        );
        
        // Update selected applicant
        setSelectedApplicant(prev => ({ ...prev, notes }));
        
        toast.success('Notes saved successfully');
      } else {
        toast.error(response.message || 'Failed to save notes');
      }
    } catch (err) {
      console.error('Error saving notes:', err);
      toast.error(err.message || 'Failed to save notes');
    } finally {
      setNotesSaving(false);
    }
  };
  
  // Delete application
  const handleDeleteApplication = async (applicantId) => {
    if (!window.confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await deleteApplication(applicantId);
      
      if (response.success) {
        // Remove from local state
        setApplicants(prev => prev.filter(app => app._id !== applicantId));
        
        // Close modal if open
        if (selectedApplicant && selectedApplicant._id === applicantId) {
          handleCloseModal();
        }
        
        toast.success('Application deleted successfully');
      } else {
        toast.error(response.message || 'Failed to delete application');
      }
    } catch (err) {
      console.error('Error deleting application:', err);
      toast.error(err.message || 'Failed to delete application');
    }
  };
  
  // Custom navigate function that fixes the React Router v6 warning about relative paths
  const safeNavigate = (path) => {
    // Using absolute paths instead of relative paths
    if (path.startsWith('/')) {
      navigate(path);
    } else {
      // For relative paths, resolve them fully based on current location
      const basePath = location.pathname.replace(/\/$/, '');
      navigate(`${basePath}/${path}`);
    }
  };
  
  // Export applications as CSV
  const handleExport = () => {
    // Get all applications first
    const fetchAllForExport = async () => {
      try {
        const response = await getAllApplications({
          ...filters,
          page: 1,
          limit: 1000, // Get a larger batch for export
          sortBy: sortField,
          sortOrder: sortDirection
        });
        
        if (response.success && response.data.length > 0) {
          // Create CSV content
          const headers = ['Name', 'Email', 'Phone', 'Job Applied For', 'Date Applied', 'Status'];
          const rows = response.data.map(app => [
            app.user?.name || 'N/A',
            app.user?.email || 'N/A',
            app.phone || 'N/A',
            app.job?.title || 'N/A',
            new Date(app.createdAt).toLocaleDateString(),
            app.status
          ]);
          
          // Combine headers and rows
          const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
          ].join('\n');
          
          // Create and download file
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.setAttribute('href', url);
          link.setAttribute('download', `job-applications-${new Date().toISOString().slice(0, 10)}.csv`);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          toast.success('Export completed successfully');
        } else {
          toast.error('No data to export');
        }
      } catch (err) {
        console.error('Error exporting applications:', err);
        toast.error('Failed to export applications');
      }
    };
    
    fetchAllForExport();
  };

  return (
    <div className="ml-64 p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-4 mb-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h1 className="text-xl font-bold text-gray-800">
            Job Applicants
            {error && <span className="text-sm text-red-500 font-normal ml-2">(API Error - Check Console)</span>}
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
            >
              <Filter size={16} className="mr-1" />
              Filters {showFilters ? <ChevronUp size={16} className="ml-1" /> : <ChevronDown size={16} className="ml-1" />}
            </button>
            <button
              onClick={handleExport}
              className="inline-flex items-center px-3 py-1.5 border border-blue-500 text-sm font-medium rounded text-white bg-blue-500 hover:bg-blue-600"
            >
              <Download size={16} className="mr-1" />
              Export
            </button>
          </div>
        </div>
      </div>
      
      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow p-4 mb-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="col-span-1 md:col-span-2">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Search by name, email or job title..."
                    value={filters.searchQuery}
                    onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={18} className="text-gray-400" />
                  </div>
                </div>
              </form>
            </div>
            
            {/* Status Filter */}
            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status-filter"
                className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="interviewed">Interviewed</option>
                <option value="offered">Offered</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            
            {/* Job Filter */}
            <div>
              <label htmlFor="job-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Job Position
              </label>
              <select
                id="job-filter"
                className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filters.jobId}
                onChange={(e) => handleFilterChange('jobId', e.target.value)}
                disabled={jobsLoading}
              >
                <option value="all">All Positions</option>
                {jobs.map(job => (
                  <option key={job._id} value={job._id}>
                    {job.title}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Date Range Filter */}
            <div>
              <label htmlFor="date-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Date Range
              </label>
              <select
                id="date-filter"
                className="w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
            </div>
          </div>
        </div>
      )}
      
      {/* Applicants Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-6 flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-500">
            <div className="flex flex-col items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-lg font-medium">{error}</p>
              <p className="mt-2 text-sm text-gray-600">
                Make sure your backend server is running and the API endpoints are correctly configured.
              </p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : currentApplicants().length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <p>No applicants found matching your criteria.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('user.name')}
                    >
                      <div className="flex items-center">
                        Name
                        {sortField === 'user.name' && (
                          <span className="ml-1">
                            {sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('job.title')}
                    >
                      <div className="flex items-center">
                        Applied For
                        {sortField === 'job.title' && (
                          <span className="ml-1">
                            {sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </span>
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort('createdAt')}
                    >
                      <div className="flex items-center">
                        Date Applied
                        {sortField === 'createdAt' && (
                          <span className="ml-1">
                            {sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentApplicants().map((applicant) => (
                    <tr key={applicant._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                            {applicant.user?.name ? applicant.user.name.charAt(0) : '?'}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{applicant.user?.name || 'Unknown'}</div>
                            <div className="text-sm text-gray-500">{applicant.user?.email || 'No email'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{applicant.job?.title || 'Unknown job'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(applicant.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(applicant.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(applicant.status)}`}>
                          <span className="flex items-center">
                            {getStatusIcon(applicant.status)}
                            <span className="ml-1 capitalize">{applicant.status}</span>
                          </span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleViewApplicant(applicant)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteApplication(applicant._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{applicants.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * itemsPerPage, totalItems)}
                    </span>{' '}
                    of <span className="font-medium">{totalItems}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                        currentPage === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronDown className="h-5 w-5 rotate-90" aria-hidden="true" />
                    </button>
                    
                    {/* Generate limited number of page buttons */}
                    {(() => {
                      const pageButtons = [];
                      const maxVisiblePages = 5;
                      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                      
                      // Adjust start page if we're near the end
                      if (endPage - startPage + 1 < maxVisiblePages) {
                        startPage = Math.max(1, endPage - maxVisiblePages + 1);
                      }
                      
                      // Show first page if not included
                      if (startPage > 1) {
                        pageButtons.push(
                          <button
                            key={1}
                            onClick={() => setCurrentPage(1)}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium bg-white text-gray-500 hover:bg-gray-50"
                          >
                            1
                          </button>
                        );
                        
                        // Add ellipsis if there's a gap
                        if (startPage > 2) {
                          pageButtons.push(
                            <span
                              key="start-ellipsis"
                              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium bg-white text-gray-700"
                            >
                              ...
                            </span>
                          );
                        }
                      }
                      
                      // Add page buttons
                      for (let i = startPage; i <= endPage; i++) {
                        pageButtons.push(
                          <button
                            key={i}
                            onClick={() => setCurrentPage(i)}
                            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                              i === currentPage
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {i}
                          </button>
                        );
                      }
                      
                      // Show last page if not included
                      if (endPage < totalPages) {
                        // Add ellipsis if there's a gap
                        if (endPage < totalPages - 1) {
                          pageButtons.push(
                            <span
                              key="end-ellipsis"
                              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium bg-white text-gray-700"
                            >
                              ...
                            </span>
                          );
                        }
                        
                        pageButtons.push(
                          <button
                            key={totalPages}
                            onClick={() => setCurrentPage(totalPages)}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium bg-white text-gray-500 hover:bg-gray-50"
                          >
                            {totalPages}
                          </button>
                        );
                      }
                      
                      return pageButtons;
                    })()}
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                        currentPage === totalPages
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Next</span>
                      <ChevronDown className="h-5 w-5 -rotate-90" aria-hidden="true" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Applicant Details Modal */}
      {showModal && selectedApplicant && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={handleCloseModal}></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="flex justify-between items-center bg-gray-50 px-6 py-4 border-b">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Applicant Details
                </h3>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-500"
                  onClick={handleCloseModal}
                >
                  <span className="sr-only">Close</span>
                  <XCircle size={24} />
                </button>
              </div>
              
              <div className="bg-white p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Personal Info */}
                  <div className="col-span-1">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex flex-col items-center mb-4">
                        <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 text-2xl font-bold mb-2">
                          {selectedApplicant.user?.name ? selectedApplicant.user.name.charAt(0) : '?'}
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900">{selectedApplicant.user?.name || 'Unknown'}</h4>
                        <p className="text-gray-600">{selectedApplicant.job?.title || 'Unknown job'}</p>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <Mail size={16} className="text-gray-400 mt-1 mr-2" />
                          <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="text-sm font-medium">{selectedApplicant.user?.email || 'No email'}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <Phone size={16} className="text-gray-400 mt-1 mr-2" />
                          <div>
                            <p className="text-sm text-gray-500">Phone</p>
                            <p className="text-sm font-medium">{selectedApplicant.phone || 'No phone'}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <MapPin size={16} className="text-gray-400 mt-1 mr-2" />
                          <div>
                            <p className="text-sm text-gray-500">Location</p>
                            <p className="text-sm font-medium">{selectedApplicant.location || 'No location'}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Status</h5>
                        <div className="flex flex-wrap gap-2">
                          <select
                            className="w-full p-2 border border-gray-300 rounded text-sm"
                            value={selectedApplicant.status}
                            onChange={(e) => handleUpdateStatus(selectedApplicant._id, e.target.value)}
                          >
                            <option value="pending">Pending</option>
                            <option value="reviewed">Reviewed</option>
                            <option value="interviewed">Interviewed</option>
                            <option value="offered">Offered</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="mt-4 space-y-2">
                        <a
                          href={selectedApplicant.resumeUrl || '#'}
                          className={`w-full block text-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${selectedApplicant.resumeUrl ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => {
                            if (!selectedApplicant.resumeUrl) {
                              e.preventDefault();
                              toast.error('No resume available');
                            }
                          }}
                        >
                          View Resume
                        </a>
                        
                        {selectedApplicant.portfolio && (
                          <a
                            href={selectedApplicant.portfolio.startsWith('http') ? selectedApplicant.portfolio : `https://${selectedApplicant.portfolio}`}
                            className="w-full block text-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View Portfolio
                          </a>
                        )}
                        
                        {selectedApplicant.linkedin && (
                          <a
                            href={selectedApplicant.linkedin.startsWith('http') ? selectedApplicant.linkedin : `https://${selectedApplicant.linkedin}`}
                            className="w-full block text-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            LinkedIn Profile
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Main Content */}
                  <div className="col-span-2 space-y-6">
                    {/* Cover Letter */}
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">Cover Letter</h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-700 whitespace-pre-line">
                          {selectedApplicant.coverLetter || 'No cover letter provided.'}
                        </p>
                      </div>
                    </div>
                    
                    {/* Skills */}
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedApplicant.skills && selectedApplicant.skills.length > 0 ? (
                          selectedApplicant.skills.map((skill, index) => (
                            <span 
                              key={index} 
                              className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
                            >
                              {typeof skill === 'string' ? skill : skill.name}
                            </span>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">No skills listed</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Experience & Education */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900 mb-2">Experience</h4>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-700">{selectedApplicant.experience || 'Not specified'}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-gray-900 mb-2">Education</h4>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-700">{selectedApplicant.education || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Notes and Actions */}
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">Notes</h4>
                      <textarea
                        className="w-full p-2 border border-gray-300 rounded-md"
                        rows="4"
                        placeholder="Add notes about this applicant..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      ></textarea>
                      
                      <div className="mt-4 flex justify-end space-x-2">
                        <button
                          type="button"
                          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                          onClick={handleCloseModal}
                        >
                          Close
                        </button>
                        <button
                          type="button"
                          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                          onClick={handleSaveNotes}
                          disabled={notesSaving}
                        >
                          {notesSaving ? 'Saving...' : 'Save Notes'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobSeekers; 
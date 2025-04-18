import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, ChevronDown, ChevronUp, Eye, Mail, Phone, Download, Trash, CheckCircle, XCircle, AlertCircle, Clock, ArrowUpDown, MapPin, User, ChevronLeft, ChevronRight, RefreshCw, PieChart } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getAllApplications, updateApplicationStatus, addApplicationNotes, deleteApplication, getAllApplicationsRaw } from '../../../services/applicationService';
import { getJobs, getJobById } from '../../../services/jobService';
import api from '../../../utils/api';
import adminApi from '../../../utils/adminApi';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

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
  const [jobsMap, setJobsMap] = useState({});
  
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
  
  // Fetch jobs for filtering and creating the job map
  useEffect(() => {
    const fetchJobs = async () => {
      setJobsLoading(true);
      try {
        const response = await getJobs();
        if (response.success) {
          setJobs(response.data);
          
          // Create a map of job IDs to job objects for quick lookup
          const jobsMapObj = {};
          response.data.forEach(job => {
            jobsMapObj[job._id] = job;
          });
          setJobsMap(jobsMapObj);
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
  
  // Custom fetch function to get applications using a direct API call
  const fetchApplicationsDirectly = async (params) => {
    try {
      // Skip using the getAllApplicationsRaw function which is causing issues
      console.log('Fetching applications with params:', params);
      
      let response = null;
      let success = false;
      
      // Use adminApi directly
      try {
        console.log('Using adminApi to fetch applications with noPopulate parameter');
        
        // Add noPopulate parameter to prevent MongoDB error
        const requestParams = {
          ...params,
          noPopulate: true,
          skipPopulate: true
        };
        
        // Use adminApi instead of regular api
        const apiResponse = await adminApi.get('/admin/applications', {
          params: requestParams
        });
        
        console.log('Admin API call response:', apiResponse.status);
        
        if (apiResponse.data) {
          response = apiResponse.data;
          success = true;
        } else {
          throw new Error('API call returned empty data');
        }
      } catch (error) {
        console.error('Admin API call failed, trying fallback approach:', error.message);
        
        // Fallback - try to directly access applications endpoint
        try {
          const fallbackResponse = await adminApi.get('/applications', {
            params: params
          });
          
          if (fallbackResponse.data) {
            response = fallbackResponse.data;
            success = true;
          } else {
            throw new Error('Fallback API call failed');
          }
        } catch (fallbackError) {
          console.error('All API approaches failed:', fallbackError.message);
          return {
            success: false,
            message: 'Failed to fetch application data',
            data: []
          };
        }
      }
      
      if (success && response) {
        // Get the data from the response
        const applications = Array.isArray(response.data) ? response.data : 
                           (response.applications || []);
        
        console.log(`Processing ${applications.length} applications`);
        
        // Process each application to add job data
        const processedApplications = await Promise.all(
          applications.map(async (application) => {
            // Get job ID, handling various formats
            const jobId = typeof application.job === 'object' ? application.job?._id : application.job;
            
            // Get job data from our map or use a placeholder
            let jobData = jobsMap[jobId] || { 
              title: 'Unknown Position',
              company: 'Unknown Company', 
              _id: jobId,
              deleted: true
            };
            
            // If we don't have the job data cached, try to fetch it
            if (!jobsMap[jobId] && jobId) {
              try {
                const jobResponse = await getJobById(jobId);
                if (jobResponse.success && jobResponse.data) {
                  jobData = jobResponse.data;
                  // Update our job map
                  setJobsMap(prev => ({ ...prev, [jobId]: jobData }));
                }
              } catch (err) {
                console.warn(`Could not fetch job data for ID: ${jobId}. It may have been deleted.`);
                // Update our job map with a placeholder to prevent further requests
                setJobsMap(prev => ({ 
                  ...prev, 
                  [jobId]: { 
                    title: `Job ID: ${jobId.slice(-6)}`, 
                    company: 'Job Not Found', 
                    _id: jobId,
                    deleted: true
                  } 
                }));
              }
            }
            
            // Process user data to ensure it's properly structured
            let userData = { name: 'Unknown Applicant', email: '', phone: '' };
            
            if (application.user) {
              if (typeof application.user === 'object') {
                // Extract string values safely
                userData = {
                  name: typeof application.user.name === 'string' ? application.user.name : 'Unknown Applicant',
                  email: typeof application.user.email === 'string' ? application.user.email : '',
                  phone: typeof application.user.phone === 'string' ? application.user.phone : '',
                  _id: application.user._id || ''
                };
              } else if (typeof application.user === 'string') {
                // If user is just a string (maybe an ID), use it as name
                userData.name = application.user;
              }
            } else if (application.applicant) {
              // Try to get user data from applicant field
              if (typeof application.applicant === 'object') {
                userData = {
                  name: typeof application.applicant.name === 'string' ? application.applicant.name : 'Unknown Applicant',
                  email: typeof application.applicant.email === 'string' ? application.applicant.email : '',
                  phone: typeof application.applicant.phone === 'string' ? application.applicant.phone : '',
                  _id: application.applicant._id || ''
                };
              } else if (typeof application.applicant === 'string') {
                userData.name = application.applicant;
              }
            }
            
            // Use any other properties that might contain user info
            if (!userData.name || userData.name === 'Unknown Applicant') {
              if (typeof application.name === 'string') userData.name = application.name;
              else if (typeof application.applicantName === 'string') userData.name = application.applicantName;
            }
            
            if (!userData.email) {
              if (typeof application.email === 'string') userData.email = application.email;
              else if (typeof application.applicantEmail === 'string') userData.email = application.applicantEmail;
            }
            
            if (!userData.phone) {
              if (typeof application.phone === 'string') userData.phone = application.phone;
              else if (typeof application.applicantPhone === 'string') userData.phone = application.applicantPhone;
            }
            
            // Create a formatted application object with job and user data
            return {
              ...application,
              job: jobData,
              user: userData,
              // Ensure status is always a string
              status: typeof application.status === 'string' ? application.status : 'pending'
            };
          })
        );
        
        return {
          success: true,
          data: processedApplications,
          totalCount: response.totalCount || response.total || processedApplications.length
        };
      }
      
      return {
        success: false,
        message: 'Failed to process applications data',
        data: []
      };
    } catch (error) {
      console.error('Error in application fetch process:', error);
      return { 
        success: false, 
        message: error.message || 'Unknown error occurred', 
        data: [] 
      };
    }
  };
  
  // Fetch applications with proper error handling
  const fetchApplications = useCallback(async (resetPage = false) => {
    setLoading(true);
    setError(null);
    
    try {
      // Check if admin token exists
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        setError('Admin authentication token not found. Please log in again.');
        setApplicants([]);
        setTotalItems(0);
        setLoading(false);
        return;
      }
      
      // Prepare parameters for API request
      const params = {
        page: resetPage ? 1 : currentPage,
        limit: itemsPerPage,
        sortBy: sortField,
        sortOrder: sortDirection,
        noPopulate: true,  // Prevent MongoDB population issues
        strictPopulate: false // Add this to prevent the Mongoose population error
      };
      
      // Add filters if they exist
      if (filters.status !== 'all') params.status = filters.status;
      if (filters.jobId !== 'all') params.jobId = filters.jobId;
      if (filters.searchQuery) params.search = filters.searchQuery;
      
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
      
      console.log('Fetching applications with params:', params);
      
      // Use the fetchApplicationsDirectly method instead of getAllApplicationsRaw
      const response = await fetchApplicationsDirectly(params);
      
      if (response.success) {
        console.log(`Processing ${response.data.length} applications`);
        
        // Update the component state with the processed applications
        setApplicants(response.data);
        setTotalItems(response.totalCount || 0);
        
        if (resetPage) {
          setCurrentPage(1);
        }
      } else {
        throw new Error(response.message || 'Failed to retrieve applications');
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      
      // Check for authentication errors
      if (error.response?.status === 401 || 
          error.message?.includes('Not authorized') || 
          error.message?.includes('auth')) {
        setError(
          'Authentication error: Your session may have expired. Please log in again as an admin user.'
        );
        // Clear token if it's expired
        localStorage.removeItem('adminToken');
      } else {
        setError(
          error.response?.data?.message || 
          error.message || 
          'Failed to load applications. Please check your connection and try again.'
        );
      }
      
      setApplicants([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters, itemsPerPage, jobsMap, sortDirection, sortField]);

  // Direct fetch method with better error handling
  const fetchJobsDirectly = useCallback(async (params = {}) => {
    const adminToken = localStorage.getItem('adminToken');
    
    if (!adminToken) {
      return {
        success: false,
        message: 'Admin authentication token not found',
        data: []
      };
    }
    
    try {
      // Make a direct API call with admin token
      const response = await adminApi.get('/jobs', {
        params: {
          ...params,
          limit: 100,
          active: true
        }
      });
      
      if (response.data && (response.data.success || Array.isArray(response.data.data))) {
        return {
          success: true,
          data: response.data.data || [],
          totalCount: response.data.totalCount || response.data.data?.length || 0
        };
      }
      
      return {
        success: false,
        message: response.data?.message || 'Failed to fetch jobs',
        data: []
      };
    } catch (error) {
      console.error('Error fetching jobs directly:', error);
      
      // Check for authentication errors
      if (error.response?.status === 401 || 
          (error.response?.data?.message && 
           error.response.data.message.includes('auth'))) {
        // Clear token if it's expired
        localStorage.removeItem('adminToken');
        return {
          success: false,
          message: 'Authentication error: Your session may have expired',
          data: []
        };
      }
      
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to fetch jobs',
        data: []
      };
    }
  }, []);
  
  // Fetch jobs data for filtering using direct method
  const fetchJobs = useCallback(async () => {
    setJobsLoading(true);
    
    try {
      const response = await fetchJobsDirectly();
      
      if (response.success) {
        setJobs(response.data || []);
        
        // Build job map for quick reference
        const newJobsMap = {};
        response.data.forEach(job => {
          newJobsMap[job._id] = job;
        });
        setJobsMap(prev => ({ ...prev, ...newJobsMap }));
      } else {
        console.error('Failed to fetch jobs:', response.message);
      }
    } catch (error) {
      console.error('Error in fetchJobs:', error);
      toast.error('Failed to load jobs for filtering');
    } finally {
      setJobsLoading(false);
    }
  }, [fetchJobsDirectly]);
  
  // Get current page items
  const currentApplicants = useCallback(() => {
    return applicants;
  }, [applicants]);
  
  // Calculate total pages
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  // Helper to get status badge color
  const getStatusBadgeColor = useCallback((status) => {
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
  }, []);
  
  // Helper to get status icon
  const getStatusIcon = useCallback((status) => {
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
  }, []);
  
  // Sort function for local sorting
  const handleSort = useCallback((field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField, sortDirection]);
  
  // Handle filter change
  const handleFilterChange = useCallback((filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
    setCurrentPage(1); // Reset to first page on filter change
  }, []);
  
  // Handle search input
  const handleSearch = useCallback((e) => {
    setFilters(prev => ({ ...prev, searchQuery: e.target.value }));
    setCurrentPage(1); // Reset to first page on search
  }, []);
  
  // View applicant details
  const handleViewApplicant = useCallback((applicant) => {
    setSelectedApplicant(applicant);
    setNotes(applicant.notes || '');
    setShowModal(true);
  }, []);
  
  // Close modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedApplicant(null);
    setNotes('');
  };
  
  // Handle applicant status update
  const handleUpdateStatus = useCallback(async (id, status) => {
    try {
      const response = await adminApi.patch(`/applications/${id}/status`, {
        status: status
      });
      
      if (response.data && response.data.success) {
        toast.success(`Status updated to ${status}`);
        
        // Update the applicant in the list
        setApplicants(prev => prev.map(app => 
          app._id === id ? { ...app, status: status } : app
        ));
        
        // Update the selected applicant if it's the same one
        if (selectedApplicant && selectedApplicant._id === id) {
          setSelectedApplicant(prev => ({ ...prev, status: status }));
        }
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status: ' + (error.message || 'Unknown error'));
    }
  }, [selectedApplicant]);
  
  // Save notes
  const handleSaveNotes = useCallback(async () => {
    if (!selectedApplicant) return;
    
    try {
      const response = await adminApi.patch(`/applications/${selectedApplicant._id}/notes`, {
        notes: notes
      });
      
      if (response.data && response.data.success) {
        toast.success('Notes saved successfully');
        
        // Update the applicant in the list
        setApplicants(prev => prev.map(app => 
          app._id === selectedApplicant._id ? { ...app, notes: notes } : app
        ));
      } else {
        toast.error('Failed to save notes');
      }
    } catch (error) {
      console.error('Error saving notes:', error);
      toast.error('Failed to save notes: ' + (error.message || 'Unknown error'));
    }
  }, [selectedApplicant, notes]);
  
  // Delete application
  const handleDeleteApplication = useCallback(async (id) => {
    if (!window.confirm('Are you sure you want to delete this application?')) {
      return;
    }
    
    try {
      const response = await adminApi.delete(`/applications/${id}`);
      
      if (response.data && response.data.success) {
        toast.success('Application deleted successfully');
        
        // Remove the applicant from the list
        setApplicants(prev => prev.filter(app => app._id !== id));
        
        // Close the details panel if it's the same one
        if (selectedApplicant && selectedApplicant._id === id) {
          handleCloseModal();
        }
      } else {
        toast.error('Failed to delete application');
      }
    } catch (error) {
      console.error('Error deleting application:', error);
      toast.error('Failed to delete application: ' + (error.message || 'Unknown error'));
    }
  }, [selectedApplicant, handleCloseModal]);
  
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

  // Fetch data on component mount
  useEffect(() => {
    // Fetch jobs data for filtering
    fetchJobs();
  }, [fetchJobs]);

  // Fetch applications when filters, pagination, or sorting changes
  useEffect(() => {
    fetchApplications(false);
  }, [fetchApplications, filters, currentPage, itemsPerPage, sortField, sortDirection]);

  // Calculate application stats for pie chart
  const calculateApplicationStats = useCallback(() => {
    if (!applicants.length) {
      return {
        labels: ['No Data'],
        datasets: [{
          data: [1],
          backgroundColor: ['#f3f4f6'],
          borderColor: ['#e5e7eb'],
          borderWidth: 1,
        }]
      };
    }
    
    // Define all possible statuses and their display names
    const statusMap = {
      'pending': 'Pending',
      'reviewed': 'Reviewed',
      'reviewing': 'Reviewing',
      'interview': 'Interview',
      'interviewed': 'Interviewed',
      'rejected': 'Rejected',
      'offered': 'Offered',
      'accepted': 'Accepted',
      'hired': 'Hired',
      'shortlisted': 'Shortlisted',
      'declined': 'Declined',
      'withdrawn': 'Withdrawn'
    };
    
    // Count occurrences of each status
    const statusCounts = {};
    let otherCount = 0;
    
    applicants.forEach(app => {
      // Normalize status to lowercase and trim
      const rawStatus = app.status ? app.status.toLowerCase().trim() : 'pending';
      
      // Map similar statuses to canonical forms
      let status = rawStatus;
      if (rawStatus.includes('review')) status = 'reviewed';
      else if (rawStatus.includes('interview')) status = 'interviewed';
      else if (rawStatus.includes('reject')) status = 'rejected';
      else if (rawStatus.includes('offer')) status = 'offered';
      else if (rawStatus.includes('hire')) status = 'hired';
      else if (rawStatus.includes('accept')) status = 'accepted';
      else if (rawStatus.includes('short')) status = 'shortlisted';
      else if (rawStatus.includes('decline')) status = 'declined';
      else if (rawStatus.includes('withdraw')) status = 'withdrawn';
      
      // Count the status
      if (statusMap[status]) {
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      } else {
        otherCount++;
      }
    });
    
    // Create arrays for chart data
    const labels = [];
    const data = [];
    const backgroundColors = [];
    const borderColors = [];
    
    // Status colors with expanded palette
    const statusColorMap = {
      'pending': '#FFCD56',     // Yellow
      'reviewed': '#36A2EB',    // Blue
      'reviewing': '#36A2EB',   // Blue (same as reviewed)
      'interviewed': '#9966FF', // Purple
      'interview': '#9966FF',   // Purple (same as interviewed)
      'shortlisted': '#4BC0C0', // Teal
      'offered': '#4BC0C0',     // Teal (same as shortlisted)
      'accepted': '#2ECC71',    // Green
      'hired': '#2ECC71',       // Green (same as accepted)
      'rejected': '#FF6384',    // Red
      'declined': '#FF6384',    // Red (same as rejected)
      'withdrawn': '#FF9F40',   // Orange
      'other': '#C9CBCF'        // Gray
    };
    
    // Add all statuses that have at least one occurrence
    Object.keys(statusCounts).forEach(status => {
      if (statusCounts[status] > 0) {
        labels.push(statusMap[status] || status);
        data.push(statusCounts[status]);
        backgroundColors.push(statusColorMap[status] || statusColorMap.other);
        borderColors.push(statusColorMap[status] || statusColorMap.other);
      }
    });
    
    // Add 'Other' category if there are any statuses not explicitly handled
    if (otherCount > 0) {
      labels.push('Other');
      data.push(otherCount);
      backgroundColors.push(statusColorMap.other);
      borderColors.push(statusColorMap.other);
    }
    
    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1,
        },
      ],
    };
  }, [applicants]);

  // Helper function to safely get application stats summary without relying on the chart component
  const getApplicationStatusSummary = useCallback(() => {
    // Return empty state if no applications
    if (!applicants || applicants.length === 0) {
      return [];
    }
    
    // Map statuses to standard categories for counting
    const statusMap = {};
    
    applicants.forEach(app => {
      // Normalize status to lowercase and trim
      const rawStatus = app.status ? app.status.toLowerCase().trim() : 'pending';
      
      // Map similar statuses to canonical forms
      let status = rawStatus;
      if (rawStatus.includes('review')) status = 'reviewed';
      else if (rawStatus.includes('interview')) status = 'interviewed';
      else if (rawStatus.includes('reject')) status = 'rejected';
      else if (rawStatus.includes('offer')) status = 'offered';
      else if (rawStatus.includes('hire')) status = 'hired';
      else if (rawStatus.includes('accept')) status = 'accepted';
      else if (rawStatus.includes('short')) status = 'shortlisted';
      else if (rawStatus.includes('decline')) status = 'declined';
      else if (rawStatus.includes('withdraw')) status = 'withdrawn';
      else if (rawStatus === '') status = 'pending';
      
      // Count the status
      statusMap[status] = (statusMap[status] || 0) + 1;
    });
    
    // Create an array of status objects sorted by count (descending)
    return Object.entries(statusMap)
      .map(([status, count]) => ({
        status,
        label: status.charAt(0).toUpperCase() + status.slice(1),
        count
      }))
      .sort((a, b) => b.count - a.count);
  }, [applicants]);

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          padding: 10,
          font: {
            size: 11
          },
          boxWidth: 10
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      },
      title: {
        display: false,
        text: 'Application Status Distribution',
        font: {
          size: 14,
          weight: 'bold'
        }
      }
    },
    cutout: '30%',
    radius: '90%'
  };

  // Create a separate pie chart component for better error handling
  const ApplicationStatusChart = ({ data, options, loading, applicants }) => {
    const [chartError, setChartError] = useState(false);
    const statusSummary = getApplicationStatusSummary();

    // Reset error state when data changes
    useEffect(() => {
      setChartError(false);
    }, [data]);

    if (loading) {
      return (
        <div className="h-56 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (chartError) {
      return (
        <div className="h-56 flex flex-col items-center justify-center text-gray-500 p-2">
          <AlertCircle size={20} className="mb-2" />
          <p className="text-center text-sm mb-2">Unable to display chart</p>
          
          {statusSummary.length > 0 && (
            <div className="w-full text-xs">
              <p className="font-medium mb-1">Application Status Summary:</p>
              <ul className="space-y-1">
                {statusSummary.map(item => (
                  <li key={item.status} className="flex justify-between">
                    <span>{item.label}:</span>
                    <span className="font-medium">{item.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      );
    }

    return (
      <>
        <div className="h-56">
          <Pie 
            data={data} 
            options={options} 
            onError={() => setChartError(true)} 
          />
        </div>
        {applicants.length === 0 && (
          <div className="text-center text-gray-500 text-xs mt-2">
            No application data to display
          </div>
        )}
        <div className="text-center text-gray-500 text-xs mt-2">
          Total: {applicants.length} applications
        </div>
      </>
    );
  };

  return (
    <div className="section-body">
      <div className="page-header mb-6 flex flex-col lg:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Job Applicants</h1>
          <p className="text-gray-500">Manage and track applicants for your job listings</p>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-4 w-full lg:w-auto">
          <button 
            onClick={handleExport}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center transition-colors w-full md:w-auto justify-center"
            disabled={loading || applicants.length === 0}
          >
            <Download size={18} className="mr-1" />
            <span>Export Data</span>
          </button>
        </div>
      </div>
      
      {/* Filters and Search */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <div className="flex flex-col space-y-4">
          {/* Search and Filter controls */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Search applicants..."
                className="w-full px-4 py-2 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.searchQuery}
                onChange={handleSearch}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
            
            <div className="flex gap-2 w-full md:w-auto">
              {/* Status Filter */}
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="interviewed">Interviewed</option>
                <option value="offered">Offered</option>
                <option value="rejected">Rejected</option>
              </select>
              
              {/* Job Filter */}
              <select
                value={filters.jobId}
                onChange={(e) => handleFilterChange('jobId', e.target.value)}
                className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={jobsLoading}
              >
                <option value="all">All Jobs</option>
                {jobs.map(job => (
                  <option key={job._id} value={job._id}>{job.title}</option>
                ))}
              </select>
              
              {/* Date Range Filter */}
              <select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
              
              {/* Reset Filters */}
              <button
                onClick={() => {
                  handleFilterChange('status', 'all');
                  handleFilterChange('jobId', 'all');
                  handleFilterChange('dateRange', 'all');
                  handleFilterChange('searchQuery', '');
                  setCurrentPage(1);
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
          <p className="flex items-center">
            <AlertCircle size={18} className="mr-2" />
            {error}
          </p>
          <div className="mt-2 flex">
            <button
              onClick={() => fetchApplications(true)}
              className="mr-3 inline-flex items-center px-3 py-2 border border-transparent text-sm rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Retry
            </button>
          </div>
        </div>
      )}
      
      {/* Main Content - Applicants List */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-semibold">All Applicants</h3>
          <div className="text-sm text-gray-500">
            {totalItems > 0 && `Total: ${totalItems} applicants`}
          </div>
        </div>

        {/* Loading, Empty, or Table Content */}
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
              <p className="text-gray-500">Loading applicants...</p>
            </div>
          </div>
        ) : applicants.length === 0 ? (
          <div className="p-8 text-center">
            <AlertCircle className="mx-auto text-gray-400 mb-2" size={32} />
            <p className="text-gray-500 mb-4">
              {filters.searchQuery || filters.status !== 'all' || filters.jobId !== 'all' || filters.dateRange !== 'all'
                ? "No applicants match your filters."
                : "No applicants found in the system."}
            </p>
            {(filters.searchQuery || filters.status !== 'all' || filters.jobId !== 'all' || filters.dateRange !== 'all') && (
              <button 
                onClick={() => {
                  handleFilterChange('status', 'all');
                  handleFilterChange('jobId', 'all');
                  handleFilterChange('dateRange', 'all');
                  handleFilterChange('searchQuery', '');
                  setCurrentPage(1);
                }}
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
                    <th className="p-3 text-left">
                      <button 
                        className="flex items-center space-x-1 group"
                        onClick={() => handleSort('user.name')}
                      >
                        <span>Applicant</span>
                        {sortField === 'user.name' && (
                          sortDirection === 'asc' ? 
                          <ChevronUp size={16} className="text-blue-500" /> : 
                          <ChevronDown size={16} className="text-blue-500" />
                        )}
                      </button>
                    </th>
                    <th className="p-3 text-left">
                      <button 
                        className="flex items-center space-x-1 group"
                        onClick={() => handleSort('job.title')}
                      >
                        <span>Job</span>
                        {sortField === 'job.title' && (
                          sortDirection === 'asc' ? 
                          <ChevronUp size={16} className="text-blue-500" /> : 
                          <ChevronDown size={16} className="text-blue-500" />
                        )}
                      </button>
                    </th>
                    <th className="p-3 text-center">
                      <button 
                        className="flex items-center justify-center space-x-1 mx-auto"
                        onClick={() => handleSort('status')}
                      >
                        <span>Status</span>
                        {sortField === 'status' && (
                          sortDirection === 'asc' ? 
                          <ChevronUp size={16} className="text-blue-500" /> : 
                          <ChevronDown size={16} className="text-blue-500" />
                        )}
                      </button>
                    </th>
                    <th className="p-3 text-center">
                      <button 
                        className="flex items-center justify-center space-x-1 mx-auto"
                        onClick={() => handleSort('createdAt')}
                      >
                        <span>Date Applied</span>
                        {sortField === 'createdAt' && (
                          sortDirection === 'asc' ? 
                          <ChevronUp size={16} className="text-blue-500" /> : 
                          <ChevronDown size={16} className="text-blue-500" />
                        )}
                      </button>
                    </th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentApplicants().map((applicant) => (
                    <tr key={applicant._id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="flex items-center">
                          {/* Profile Image or Icon */}
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 mr-3">
                            {typeof applicant.user === 'object' && typeof applicant.user.name === 'string' 
                              ? applicant.user.name.charAt(0).toUpperCase() 
                              : '?'}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {typeof applicant.user === 'object' && typeof applicant.user.name === 'string' 
                                ? applicant.user.name 
                                : (typeof applicant.user === 'string' ? applicant.user : 'Unknown')}
                            </div>
                            <div className="text-sm text-gray-500">
                              {typeof applicant.user === 'object' && typeof applicant.user.email === 'string' 
                                ? applicant.user.email 
                                : ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-gray-900">
                          {typeof applicant.job === 'object' 
                            ? (applicant.job.deleted 
                                ? (
                                  <span className="flex items-center">
                                    {typeof applicant.job.title === 'string' ? applicant.job.title : 'Unknown Position'}
                                    <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">Deleted</span>
                                  </span>
                                ) 
                                : (typeof applicant.job.title === 'string' ? applicant.job.title : 'Unknown Position')
                              )
                            : 'Unknown Position'
                          }
                        </div>
                        {typeof applicant.job === 'object' && typeof applicant.job.company === 'string' && (
                          <div className="text-xs text-gray-500">{applicant.job.company}</div>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(applicant.status)}`}>
                          {getStatusIcon(applicant.status)}
                          <span className="ml-1 capitalize">{typeof applicant.status === 'string' ? applicant.status : 'pending'}</span>
                        </span>
                      </td>
                      <td className="p-3 text-center text-sm text-gray-500">
                        {new Date(applicant.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex justify-center items-center space-x-2">
                          <button
                            onClick={() => handleViewApplicant(applicant)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteApplication(applicant._id)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Delete Application"
                          >
                            <Trash size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {applicants.length > 0 && (
              <div className="p-4 border-t flex flex-col sm:flex-row justify-between items-center">
                <div className="text-sm text-gray-500 mb-4 sm:mb-0">
                  Showing {Math.min(1 + (currentPage - 1) * itemsPerPage, totalItems)} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} applicants
                </div>
                
                <div className="flex items-center space-x-1">
                  <button 
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
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
                          onClick={() => setCurrentPage(number + 1)}
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
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
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
      
      {/* Application Status Chart - Moved below the table */}
      {!loading && (
        <div className="mt-6 bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-base font-semibold text-gray-700 mb-4 flex items-center">
            <PieChart size={18} className="mr-2" />
            Application Status Distribution
          </h3>
          
          <div className="flex flex-col md:flex-row items-center">
            <div className="w-full md:w-1/2 lg:w-1/3 mx-auto">
              <ApplicationStatusChart 
                data={calculateApplicationStats()} 
                options={chartOptions} 
                loading={loading} 
                applicants={applicants} 
              />
            </div>
            
            {applicants.length > 0 && (
              <div className="w-full md:w-1/2 mt-4 md:mt-0 md:pl-6">
                <h4 className="text-sm font-medium mb-2 text-gray-600">Status Breakdown</h4>
                <div className="grid grid-cols-2 gap-2">
                  {getApplicationStatusSummary().map(item => (
                    <div key={item.status} className="flex justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{item.label}:</span>
                      <span className="text-sm font-medium">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Add the modal code for viewing applicant details here */}
      {showModal && selectedApplicant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal content */}
            <h3 className="text-xl font-semibold mb-4">Applicant Details</h3>
            
            {/* Applicant Info */}
            <div className="mb-6">
              <h4 className="text-lg font-medium mb-2">Personal Information</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 mr-4">
                    {typeof selectedApplicant.user === 'object' && typeof selectedApplicant.user.name === 'string' 
                      ? selectedApplicant.user.name.charAt(0).toUpperCase() 
                      : '?'}
                  </div>
                  <div>
                    <div className="text-lg font-semibold">
                      {typeof selectedApplicant.user === 'object' && typeof selectedApplicant.user.name === 'string' 
                        ? selectedApplicant.user.name 
                        : 'Unknown Applicant'}
                    </div>
                    {typeof selectedApplicant.user === 'object' && typeof selectedApplicant.user.email === 'string' && (
                      <div className="flex items-center text-gray-600">
                        <Mail size={14} className="mr-1" />
                        {selectedApplicant.user.email}
                      </div>
                    )}
                    {selectedApplicant.phone && (
                      <div className="flex items-center text-gray-600">
                        <Phone size={14} className="mr-1" />
                        {selectedApplicant.phone}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Job Info */}
            <div className="mb-6">
              <h4 className="text-lg font-medium mb-2">Job Information</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="mb-2">
                  <span className="font-medium">Position: </span>
                  {typeof selectedApplicant.job === 'object' && typeof selectedApplicant.job.title === 'string' 
                    ? selectedApplicant.job.title 
                    : 'Unknown Position'}
                </div>
                {typeof selectedApplicant.job === 'object' && typeof selectedApplicant.job.company === 'string' && (
                  <div className="mb-2">
                    <span className="font-medium">Company: </span>
                    {selectedApplicant.job.company}
                  </div>
                )}
                <div className="mb-2">
                  <span className="font-medium">Applied: </span>
                  {new Date(selectedApplicant.createdAt).toLocaleDateString()}
                </div>
                <div className="mb-2">
                  <span className="font-medium">Status: </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(selectedApplicant.status)}`}>
                    {getStatusIcon(selectedApplicant.status)}
                    <span className="ml-1 capitalize">
                      {typeof selectedApplicant.status === 'string' ? selectedApplicant.status : 'pending'}
                    </span>
                  </span>
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex justify-end mt-6">
              <button 
                className="px-4 py-2 border rounded-md hover:bg-gray-100"
                onClick={handleCloseModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobSeekers; 
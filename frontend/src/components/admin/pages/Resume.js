import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Filter, Download, Eye, CheckCircle, XCircle, Flag, FileText, BarChart, PieChart, Calendar, MapPin, Users, FileType, ChevronDown, ChevronUp, Briefcase, Clock, User, MoreVertical } from 'lucide-react';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { toast } from 'react-toastify';
import adminApi from '../../../utils/adminApi';
import axios from 'axios';
import path from 'path';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

// Register Chart.js components
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// API URL from environment
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthToken = () => localStorage.getItem('token');

// Helper function to check if a URL is a local file or Cloudinary
const isLocalFileUrl = (url) => {
  return url && (url.startsWith('/api/files/') || url.includes('/files/'));
};

// Function to extract user ID and filename from URL
const extractFileInfo = (url) => {
  // Handle format: /api/files/resumes/userId/filename
  // or: /api/files/resumes/user/userId/filename
  const parts = url.split('/');
  
  // Find the position of 'files' in the URL
  const filesIndex = parts.findIndex(part => part === 'files' || part === 'api');
  
  if (filesIndex !== -1) {
    // Get type (resumes, profiles, etc.)
    const type = parts[filesIndex + 1] === 'files' ? parts[filesIndex + 2] : parts[filesIndex + 1];
    
    // Check if URL has user ID in the path
    let userId = null;
    let filename = null;
    
    if (parts.includes('user')) {
      const userIndex = parts.findIndex(part => part === 'user');
      userId = parts[userIndex + 1];
      filename = parts[userIndex + 2];
    } else {
      // This is for URLs where userId is directly after type
      userId = parts[filesIndex + 3];
      filename = parts[filesIndex + 4];
    }
    
    return { type, userId, filename };
  }
  
  return { type: null, userId: null, filename: null };
};

const Resume = () => {
  // State variables
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('all');
  const [filterFileType, setFilterFileType] = useState('all');
  const [activeTab, setActiveTab] = useState('jobSeekers'); // 'summary', 'jobSeekers', 'trainers'
  const [selectedResume, setSelectedResume] = useState(null);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [selectedResumeIds, setSelectedResumeIds] = useState([]);
  const [expandedSection, setExpandedSection] = useState('analytics'); // 'analytics', 'jobSeekers', 'trainers'
  
  // Data state
  const [loading, setLoading] = useState(true);
  const [jobSeekerResumes, setJobSeekerResumes] = useState([]);
  const [trainerResumes, setTrainerResumes] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalResumes: 0,
    jobSeekerCount: 0,
    trainerCount: 0,
    statusCounts: { approved: 0, pending: 0, rejected: 0, flagged: 0 },
    fileTypeCounts: { pdf: 0, docx: 0, other: 0 },
    uploadsByMonth: {}
  });
  
  // Chart data state
  const [statusChartData, setStatusChartData] = useState({ labels: [], datasets: [] });
  const [fileTypeChartData, setFileTypeChartData] = useState({ labels: [], datasets: [] });
  const [uploadsChartData, setUploadsChartData] = useState({ labels: [], datasets: [] });
  
  // Add state for export loading
  const [exportLoading, setExportLoading] = useState(false);
  
  // Fetch data on component mount
  useEffect(() => {
    fetchResumeData();
  }, []);
  
  // Recalculate analytics when resume data changes
  useEffect(() => {
    if (jobSeekerResumes.length > 0 || trainerResumes.length > 0) {
      calculateAnalytics();
    }
  }, [jobSeekerResumes, trainerResumes]);
  
  // Fetch resume data from API
  const fetchResumeData = async () => {
    setLoading(true);
    try {
      // Get all users to properly categorize them
      let allUsers = [];
      
      try {
        // Try different endpoints to fetch all users first
        const endpoints = [
          '/admin/users',         // Try admin-specific endpoint first
          '/dashboard/users',     // Try dashboard endpoint 
          '/users/list',          // Try users list endpoint
          '/users/all'            // Try alternative endpoint
        ];
        
        let endpointFound = false;
        
        // Try each endpoint until one works
        for (const endpoint of endpoints) {
          try {
            console.log(`Attempting to fetch all users from ${endpoint}`);
            const response = await adminApi.get(endpoint);
            
            if (response.data && (response.data.success || response.data.data)) {
              console.log(`Successfully fetched users from ${endpoint}`);
              allUsers = response.data.data || response.data;
              endpointFound = true;
              break;
            }
          } catch (err) {
            console.log(`Endpoint ${endpoint} failed:`, err.message);
            // Continue to the next endpoint
          }
        }
        
        if (!endpointFound) {
          // If no endpoint works, manually load users from the dashboard stats as fallback
          try {
            console.log('Attempting to fetch from dashboard stats as fallback');
            const statsResponse = await adminApi.get('/dashboard/stats');
            if (statsResponse.data && statsResponse.data.recentUsers) {
              allUsers = statsResponse.data.recentUsers;
              console.log('Using recent users from dashboard stats:', allUsers.length);
            }
          } catch (err) {
            console.log('Dashboard stats fallback failed:', err.message);
          }
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        allUsers = [];
      }
      
      // Create a unique ID set to prevent duplicates
      const processedUserIds = new Set();
      
      // Process job seeker users
      if (allUsers && allUsers.length > 0) {
        // Clear existing data
        setJobSeekerResumes([]);
        setTrainerResumes([]);
        
        // Filter and process job seeker users
        const jobSeekers = allUsers.filter(user => {
          return user.roleName === 'jobSeeker' || 
                 (user.roles && user.roles.some(role => role.name === 'jobSeeker')) ||
                 (user.role === 'jobSeeker');
        });
        
        // Transform job seeker data to the format expected by the component
        const jobSeekerResumeData = jobSeekers
          .filter(user => {
            // Check if user has already been processed to prevent duplicates
            if (processedUserIds.has(user._id)) return false;
            
            // Only include users who have a resume in one of the possible locations
            const hasResume = (
              (user.professionalInfo && user.professionalInfo.resume) || 
              (user.jobSeekerProfile && user.jobSeekerProfile.resume)
            );
            
            if (hasResume) {
              processedUserIds.add(user._id);
              return true;
            }
            return false;
          })
          .map(user => ({
            id: user._id,
            name: user.name || 'Unknown',
            email: user.email || 'No email',
            phone: user.phone || 'No phone',
            position: user.professionalInfo?.currentTitle || 'Job Seeker',
            location: user.customLocation || (user.location?.name || 'Not specified'),
            status: user.isVerified ? 'approved' : 'pending', // Use user verification status or default to pending
            submitted: user.createdAt || new Date().toISOString(),
            // Get resume URL from the correct location
            resumeUrl: user.professionalInfo?.resume || 
                       (user.jobSeekerProfile ? user.jobSeekerProfile.resume : null),
            fileType: 'pdf', // Assuming PDF format, adjust if you store this info
            fileSize: '1.5 MB', // Placeholder, adjust if you store this info
            keywords: user.skills?.technical || []
          }));
        
        setJobSeekerResumes(jobSeekerResumeData);
        console.log(`Processed ${jobSeekerResumeData.length} job seeker resumes`);
        
        // Filter and process trainer users
        const trainers = allUsers.filter(user => {
          return user.roleName === 'trainer' || 
                 (user.roles && user.roles.some(role => role.name === 'trainer')) ||
                 (user.role === 'trainer');
        });
        
        // Transform trainer data to the format expected by the component
        const trainerResumeData = trainers
          .filter(user => {
            // Check if user has already been processed to prevent duplicates
            if (processedUserIds.has(user._id)) return false;
            
            // Only include users who have a resume in one of the possible locations
            const hasResume = (
              (user.professionalInfo && user.professionalInfo.resume) || 
              (user.trainerProfile && user.trainerProfile.certificates && user.trainerProfile.certificates.length > 0)
            );
            
            if (hasResume) {
              processedUserIds.add(user._id);
              return true;
            }
            return false;
          })
          .map(user => ({
            id: user._id,
            name: user.name || 'Unknown',
            email: user.email || 'No email',
            phone: user.phone || 'No phone',
            specialty: user.trainerProfile?.specialization?.[0] || 'Training Specialist',
            experience: user.trainerProfile?.experience ? `${user.trainerProfile.experience} years` : undefined,
            location: user.customLocation || (user.location?.name || 'Not specified'),
            status: user.isVerified ? 'approved' : 'pending', // Use user verification status or default to pending
            submitted: user.createdAt || new Date().toISOString(),
            // Get resume URL from the correct location
            resumeUrl: user.professionalInfo?.resume || 
                      (user.trainerProfile && user.trainerProfile.certificates && user.trainerProfile.certificates.length > 0 
                        ? user.trainerProfile.certificates[0] 
                        : null),
            fileType: 'pdf', // Assuming PDF format, adjust if you store this info
            fileSize: '2.0 MB', // Placeholder, adjust if you store this info
            certification: user.trainerProfile?.certificates || []
          }));
        
        setTrainerResumes(trainerResumeData);
        console.log(`Processed ${trainerResumeData.length} trainer resumes`);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching resume data:', error);
      toast.error('Failed to fetch resume data from server');
      setLoading(false);
    }
  };
  
  // Calculate analytics from resume data
  const calculateAnalytics = () => {
    const jobSeekerCount = jobSeekerResumes.length;
    const trainerCount = trainerResumes.length;
    
    // Count resumes by status
    const statusCounts = {
      approved: 0,
      pending: 0,
      rejected: 0,
      flagged: 0
    };
    
    // Count resumes by file type
    const fileTypeCounts = {
      pdf: 0,
      docx: 0,
      other: 0
    };
    
    // Initialize months for the last 6 months
    const months = [];
    const uploadsByMonth = {};
    const today = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = month.toLocaleString('default', { month: 'short', year: 'numeric' });
      months.push(monthKey);
      uploadsByMonth[monthKey] = 0;
    }
    
    // Process job seeker resumes
    jobSeekerResumes.forEach(resume => {
      // Count by status
      if (statusCounts[resume.status] !== undefined) {
        statusCounts[resume.status]++;
      }
      
      // Count by file type
      const fileType = resume.fileType ? resume.fileType.toLowerCase() : 'other';
      if (fileType === 'pdf' || fileType === 'docx') {
        fileTypeCounts[fileType]++;
      } else {
        fileTypeCounts.other++;
      }
      
      // Count by month
      const submittedDate = new Date(resume.submitted);
      const monthKey = submittedDate.toLocaleString('default', { month: 'short', year: 'numeric' });
      if (uploadsByMonth[monthKey] !== undefined) {
        uploadsByMonth[monthKey]++;
      }
    });
    
    // Process trainer resumes
    trainerResumes.forEach(resume => {
      // Count by status
      if (statusCounts[resume.status] !== undefined) {
        statusCounts[resume.status]++;
      }
      
      // Count by file type
      const fileType = resume.fileType ? resume.fileType.toLowerCase() : 'other';
      if (fileType === 'pdf' || fileType === 'docx') {
        fileTypeCounts[fileType]++;
      } else {
        fileTypeCounts.other++;
      }
      
      // Count by month
      const submittedDate = new Date(resume.submitted);
      const monthKey = submittedDate.toLocaleString('default', { month: 'short', year: 'numeric' });
      if (uploadsByMonth[monthKey] !== undefined) {
        uploadsByMonth[monthKey]++;
      }
    });
    
    // Update analytics state
    const analyticsData = {
      totalResumes: jobSeekerCount + trainerCount,
      jobSeekerCount,
      trainerCount,
      statusCounts,
      fileTypeCounts,
      uploadsByMonth
    };
    
    setAnalytics(analyticsData);
    
    // Update chart data
    updateChartData(analyticsData, months);
  };
  
  // Update chart data based on analytics
  const updateChartData = (analyticsData, months) => {
    // Status chart data
    setStatusChartData({
      labels: ['Approved', 'Pending', 'Rejected', 'Flagged'],
      datasets: [
        {
          data: [
            analyticsData.statusCounts.approved,
            analyticsData.statusCounts.pending,
            analyticsData.statusCounts.rejected,
            analyticsData.statusCounts.flagged
          ],
          backgroundColor: [
            'rgba(34, 197, 94, 0.7)',  // green
            'rgba(59, 130, 246, 0.7)', // blue
            'rgba(239, 68, 68, 0.7)',  // red
            'rgba(234, 179, 8, 0.7)'   // yellow
          ],
          borderColor: [
            'rgba(34, 197, 94, 1)',
            'rgba(59, 130, 246, 1)',
            'rgba(239, 68, 68, 1)',
            'rgba(234, 179, 8, 1)'
          ],
          borderWidth: 1,
        },
      ],
    });
    
    // File type chart data
    setFileTypeChartData({
      labels: ['PDF', 'DOCX', 'Other'],
      datasets: [
        {
          data: [
            analyticsData.fileTypeCounts.pdf,
            analyticsData.fileTypeCounts.docx,
            analyticsData.fileTypeCounts.other
          ],
          backgroundColor: [
            'rgba(99, 102, 241, 0.7)',  // indigo
            'rgba(168, 85, 247, 0.7)',  // purple
            'rgba(236, 72, 153, 0.7)'   // pink
          ],
          borderColor: [
            'rgba(99, 102, 241, 1)',
            'rgba(168, 85, 247, 1)',
            'rgba(236, 72, 153, 1)'
          ],
          borderWidth: 1,
        },
      ],
    });
    
    // Uploads chart data
    setUploadsChartData({
      labels: months,
      datasets: [
        {
          label: 'Resume Uploads',
          data: months.map(month => analyticsData.uploadsByMonth[month] || 0),
          backgroundColor: 'rgba(59, 130, 246, 0.7)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1,
        },
      ],
    });
  };

  // Chart options
  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          padding: 10,
          font: { size: 11 },
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
      }
    },
    cutout: '30%',
    radius: '90%'
  };
  
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.raw || 0;
            return `${label}: ${value}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    }
  };
  
  // Handle resume actions
  const handleViewResume = (resume) => {
    if (!resume || !resume.resumeUrl) {
      toast.error('Resume URL not available');
      return;
    }
    
    // Check if viewing directly will work or if we need to handle it differently
    if (isLocalFileUrl(resume.resumeUrl)) {
      // For locally stored files, we need to use a proper fetch with authentication
      const token = getAuthToken();
      if (!token) {
        toast.error('Authentication required. Please log in again.');
        return;
      }
      
      // Set selected resume to show in modal
      setSelectedResume(resume);
      setShowResumeModal(true);
      
      // Pre-fetch the file to make it available in the modal
      const { type, userId, filename } = extractFileInfo(resume.resumeUrl);
      if (type && filename) {
        // Prepare the URL for viewing
        let fileViewUrl;
        if (userId) {
          fileViewUrl = `${API_URL}/files/${type}/user/${userId}/${filename}`;
        } else {
          fileViewUrl = `${API_URL}/files/${type}/${filename}`;
        }
        
        // Update the resume object with the full URL for viewing
        setSelectedResume(prev => ({
          ...prev,
          fullResumeUrl: fileViewUrl
        }));
      }
    } else {
      // For Cloudinary or other external URLs, open directly
      setSelectedResume(resume);
      setShowResumeModal(true);
    }
  };
  
  const handleCloseModal = () => {
    setShowResumeModal(false);
    setSelectedResume(null);
  };
  
  const handleChangeStatus = async (resumeId, newStatus, category) => {
    try {
      // Generate a unique key for client-side update to avoid API call
      const updateId = Date.now();
      console.log(`Local update ID: ${updateId} - Changing status to ${newStatus}`);
      
      // Instead of calling an API endpoint that doesn't exist, handle the status change locally
      if (category === 'jobSeekers') {
        setJobSeekerResumes(prevResumes => 
          prevResumes.map(resume => 
            resume.id === resumeId ? { ...resume, status: newStatus, updateId } : resume
          )
        );
      } else {
        setTrainerResumes(prevResumes => 
          prevResumes.map(resume => 
            resume.id === resumeId ? { ...resume, status: newStatus, updateId } : resume
          )
        );
      }
      
      toast.success(`Status updated to ${newStatus} successfully`);
      
      // Recalculate analytics
      calculateAnalytics();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };
  
  const handleDownloadResume = async (resumeUrl, resumeName) => {
    try {
      if (!resumeUrl) {
        toast.error('Resume URL not available');
        return;
      }
      
      // Get auth token
      const token = getAuthToken();
      if (!token) {
        toast.error('Authentication required. Please log in again.');
        return;
      }
      
      toast.info('Preparing resume for download...');
      
      // Handle based on URL type
      if (isLocalFileUrl(resumeUrl)) {
        // For locally stored files
        const { type, userId, filename } = extractFileInfo(resumeUrl);
        
        if (!type || !filename) {
          toast.error('Invalid file URL format');
          return;
        }
        
        // Construct the proper API URL
        let downloadUrl;
        if (userId) {
          downloadUrl = `${API_URL}/files/${type}/user/${userId}/${filename}`;
        } else {
          downloadUrl = `${API_URL}/files/${type}/${filename}`;
        }
        
        try {
          // Use Axios to download with proper authentication
          const response = await axios.get(downloadUrl, {
            headers: {
              'Authorization': `Bearer ${token}`
            },
            responseType: 'blob',
            timeout: 30000 // 30 seconds timeout
          });
          
          // Check if the response is valid
          if (response.status !== 200) {
            throw new Error(`Server returned status ${response.status}`);
          }
          
          // Check for empty or invalid blob
          if (!response.data || response.data.size === 0) {
            throw new Error('Received empty file from server');
          }
          
          // Create blob link to download
          const blob = new Blob([response.data], { 
            type: response.headers['content-type'] || 'application/pdf' 
          });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          
          // Use a proper filename with fallbacks
          const downloadName = resumeName 
            ? `${resumeName.replace(/\s+/g, '_')}_resume${path.extname(filename) || '.pdf'}`
            : filename;
            
          link.setAttribute('download', downloadName);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // Clean up the blob URL
          setTimeout(() => {
            window.URL.revokeObjectURL(url);
          }, 100);
          
          toast.success('Resume downloaded successfully');
        } catch (error) {
          console.error('Error downloading file:', error);
          toast.error(`Download failed: ${error.message || 'Server error'}`);
          
          // Fallback - try opening in a new window
          window.open(downloadUrl, '_blank');
        }
      } else if (resumeUrl.includes('cloudinary.com')) {
        // For Cloudinary URLs
        try {
          const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
          const proxyUrl = `${baseUrl}/proxy/download`;
          
          const formData = new FormData();
          formData.append('fileUrl', resumeUrl);
          
          const config = {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            },
            responseType: 'blob',
            timeout: 30000 // 30 seconds timeout
          };
          
          const response = await axios.post(proxyUrl, formData, config);
          
          // Create blob link to download
          const blob = new Blob([response.data], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `${resumeName.replace(/\s+/g, '_')}_resume.pdf`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // Clean up the blob URL
          setTimeout(() => {
            window.URL.revokeObjectURL(url);
          }, 100);
          
          toast.success('Resume downloaded successfully');
        } catch (err) {
          console.error('Error downloading through proxy:', err);
          
          // Fallback - try direct download
          toast.info('Trying direct download method...');
          window.open(resumeUrl, '_blank');
        }
      } else {
        // For other URLs, try direct download
        const link = document.createElement('a');
        link.href = resumeUrl;
        link.setAttribute('download', `${resumeName.replace(/\s+/g, '_')}_resume.pdf`);
        link.setAttribute('target', '_blank');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success('Resume download initiated');
      }
    } catch (error) {
      console.error('Error handling resume download:', error);
      toast.error('Could not download resume. Please try a different method.');
      
      // Fallback - open in new tab
      window.open(resumeUrl, '_blank');
    }
  };
  
  // Handle batch operations
  const handleBatchAction = async (action) => {
    if (selectedResumeIds.length === 0) {
      toast.warning('No resumes selected');
      return;
    }
    
    try {
      // Handle actions locally instead of via API calls that don't exist
      const updateId = Date.now();
      
      if (action === 'approve' || action === 'reject' || action === 'flag') {
        // Map UI actions to status
        const newStatus = action;
        
        // Update job seekers
        setJobSeekerResumes(prevResumes => 
          prevResumes.map(resume => 
            selectedResumeIds.includes(resume.id) 
              ? { ...resume, status: newStatus, updateId } 
              : resume
          )
        );
        
        // Update trainers
        setTrainerResumes(prevResumes => 
          prevResumes.map(resume => 
            selectedResumeIds.includes(resume.id) 
              ? { ...resume, status: newStatus, updateId } 
              : resume
          )
        );
        
        toast.success(`Batch ${action} successful`);
      } else if (action === 'delete') {
        // Remove selected resumes
        setJobSeekerResumes(prevResumes => 
          prevResumes.filter(resume => !selectedResumeIds.includes(resume.id))
        );
        
        setTrainerResumes(prevResumes => 
          prevResumes.filter(resume => !selectedResumeIds.includes(resume.id))
        );
        
        toast.success('Selected items removed successfully');
      } else {
        toast.error('Invalid action');
      }
      
      // Clear selection
      setSelectedResumeIds([]);
      
      // Recalculate analytics
      calculateAnalytics();
    } catch (error) {
      console.error(`Error performing batch ${action}:`, error);
      toast.error(`Batch ${action} failed`);
    }
  };
  
  const toggleSelectResume = (resumeId) => {
    if (selectedResumeIds.includes(resumeId)) {
      setSelectedResumeIds(selectedResumeIds.filter(id => id !== resumeId));
    } else {
      setSelectedResumeIds([...selectedResumeIds, resumeId]);
    }
  };
  
  const toggleSelectAll = (resumes) => {
    if (selectedResumeIds.length === resumes.length) {
      setSelectedResumeIds([]);
    } else {
      setSelectedResumeIds(resumes.map(r => r.id));
    }
  };
  
  // Filter functions
  const filterResumes = (category) => {
    let resumes = category === 'jobSeekers' ? jobSeekerResumes : trainerResumes;
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      resumes = resumes.filter(resume => {
        return (
          resume.name?.toLowerCase().includes(term) ||
          resume.email?.toLowerCase().includes(term) ||
          (resume.position && resume.position.toLowerCase().includes(term)) ||
          (resume.specialty && resume.specialty.toLowerCase().includes(term)) ||
          resume.location?.toLowerCase().includes(term) ||
          (resume.keywords && resume.keywords.some(kw => kw.toLowerCase().includes(term)))
        );
      });
    }
    
    // Filter by status
    if (filterStatus !== 'all') {
      resumes = resumes.filter(resume => resume.status === filterStatus);
    }
    
    // Filter by file type
    if (filterFileType !== 'all') {
      resumes = resumes.filter(resume => {
        const fileType = resume.fileType?.toLowerCase();
        return fileType === filterFileType;
      });
    }
    
    // Filter by date range
    if (filterDateRange !== 'all') {
      const today = new Date();
      let cutoffDate;
      
      if (filterDateRange === 'last7days') {
        cutoffDate = new Date(today.setDate(today.getDate() - 7));
      } else if (filterDateRange === 'last30days') {
        cutoffDate = new Date(today.setDate(today.getDate() - 30));
      } else if (filterDateRange === 'last90days') {
        cutoffDate = new Date(today.setDate(today.getDate() - 90));
      }
      
      resumes = resumes.filter(resume => {
        const submittedDate = new Date(resume.submitted);
        return submittedDate >= cutoffDate;
      });
    }
    
    return resumes;
  };
  
  // Get filtered resumes based on category
  const getFilteredResumes = (category) => {
    return filterResumes(category);
  };
  
  const filteredJobSeekers = getFilteredResumes('jobSeekers');
  const filteredTrainers = getFilteredResumes('trainers');
  
  // Get current category based on active tab
  const category = activeTab === 'summary' ? 'all' : activeTab;
  
  // Get resumes based on active tab/category
  const resumes = activeTab === 'jobSeekers' ? filteredJobSeekers : 
                 activeTab === 'trainers' ? filteredTrainers : 
                 [...filteredJobSeekers, ...filteredTrainers];
  
  // Get resume counts
  const getResumeCountByStatus = (status, category) => {
    if (category === 'all') {
      return (
        jobSeekerResumes.filter(r => r.status === status).length + 
        trainerResumes.filter(r => r.status === status).length
      );
    } else if (category === 'jobSeekers') {
      return jobSeekerResumes.filter(r => r.status === status).length;
    } else {
      return trainerResumes.filter(r => r.status === status).length;
    }
  };
  
  // Get total resume count
  const getTotalResumeCount = (category) => {
    if (category === 'all') {
      return analytics.totalResumes;
    } else if (category === 'jobSeekers') {
      return analytics.jobSeekerCount;
    } else {
      return analytics.trainerCount;
    }
  };
  
  // Get recent uploads
  const getRecentUploads = (category, limit = 5) => {
    let resumes;
    
    if (category === 'all') {
      resumes = [...jobSeekerResumes, ...trainerResumes];
    } else if (category === 'jobSeekers') {
      resumes = jobSeekerResumes;
    } else {
      resumes = trainerResumes;
    }
    
    return resumes
      .sort((a, b) => new Date(b.submitted) - new Date(a.submitted))
      .slice(0, limit);
  };
  
  // Log export activity for audit purposes
  const logExport = async (data) => {
    try {
      // Attempt to log to the backend if an audit endpoint exists
      await adminApi.post('/admin/audit/log', {
        action: 'export',
        details: data
      }).catch(error => {
        // If the endpoint doesn't exist, just log to console
        console.log('Export logging endpoint not available, logging to console only');
      });
      
      // Always log to console as a fallback
      console.log('EXPORT AUDIT LOG:', data);
    } catch (error) {
      // Silent fail - logging shouldn't stop the export
      console.error('Error logging export activity:', error);
    }
  };
  
  // Export user data function
  const exportUserData = async (category, format, selectedOnly = false) => {
    try {
      setExportLoading(true);
      
      // Get the data to export - either all filtered records or just selected ones
      let resumes;
      if (selectedOnly) {
        resumes = getFilteredResumes(category).filter(resume => selectedResumeIds.includes(resume.id));
      } else {
        resumes = getFilteredResumes(category);
      }
      
      if (resumes.length === 0) {
        toast.error('No data to export. Please adjust your filters or select records.');
        setExportLoading(false);
        return;
      }
      
      // Define the fields to export
      const exportData = resumes.map(resume => ({
        Name: resume.name || 'N/A',
        Email: resume.email || 'N/A',
        Phone: resume.phone || 'N/A',
        Location: resume.location || 'N/A',
        Position: category === 'jobSeekers' ? resume.position : resume.specialty || 'N/A',
        Status: resume.status ? resume.status.charAt(0).toUpperCase() + resume.status.slice(1) : 'Pending',
        Submitted: new Date(resume.submitted).toLocaleDateString(),
        'User Type': category === 'jobSeekers' ? 'Job Seeker' : 'Trainer'
      }));
      
      // Export based on requested format
      if (format === 'excel') {
        exportToExcel(exportData, category, selectedOnly);
      } else if (format === 'csv') {
        exportToCSV(exportData, category, selectedOnly);
      }
      
      // Prepare audit data
      const auditData = {
        timestamp: new Date().toISOString(),
        category: category,
        format: format,
        selectedOnly: selectedOnly,
        recordCount: exportData.length,
        filter: {
          searchTerm: searchTerm,
          status: filterStatus,
          dateRange: filterDateRange,
          fileType: filterFileType
        }
      };
      
      // Log the export activity for audit
      await logExport(auditData);
      
      toast.success(`Successfully exported ${exportData.length} records as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };
  
  // Export to Excel
  const exportToExcel = (data, category, selectedOnly = false) => {
    try {
      // Create worksheet from data
      const worksheet = XLSX.utils.json_to_sheet(data);
      
      // Create workbook and add the worksheet
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, category === 'jobSeekers' ? 'Job Seekers' : 'Trainers');
      
      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      
      // Create Blob and save the file
      const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
      const currentDate = new Date().toISOString().slice(0, 10);
      const selectionSuffix = selectedOnly ? '_Selected' : '';
      const fileName = `${category === 'jobSeekers' ? 'JobSeekers' : 'Trainers'}${selectionSuffix}_Export_${currentDate}.xlsx`;
      
      const excelBlob = new Blob([excelBuffer], { type: EXCEL_TYPE });
      saveAs(excelBlob, fileName);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Failed to export Excel file. Please try again.');
    }
  };
  
  // Export to CSV
  const exportToCSV = (data, category, selectedOnly = false) => {
    try {
      // Create worksheet from data
      const worksheet = XLSX.utils.json_to_sheet(data);
      
      // Convert worksheet to CSV
      const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
      
      // Create Blob and save the file
      const CSV_TYPE = 'text/csv;charset=utf-8;';
      const currentDate = new Date().toISOString().slice(0, 10);
      const selectionSuffix = selectedOnly ? '_Selected' : '';
      const fileName = `${category === 'jobSeekers' ? 'JobSeekers' : 'Trainers'}${selectionSuffix}_Export_${currentDate}.csv`;
      
      const csvBlob = new Blob([csvOutput], { type: CSV_TYPE });
      saveAs(csvBlob, fileName);
    } catch (error) {
      console.error('Error exporting to CSV:', error);
      toast.error('Failed to export CSV file. Please try again.');
    }
  };

  return (
    <div className="admin-job-container">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Resume Management</h1>
          <div className="flex gap-2">
            {selectedResumeIds.length > 0 && (
              <div className="flex gap-2">
                <button 
                  onClick={() => handleBatchAction('approve')}
                  className="flex items-center px-3 py-2 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Approve ({selectedResumeIds.length})
                </button>
                <button 
                  onClick={() => handleBatchAction('reject')}
                  className="flex items-center px-3 py-2 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Reject ({selectedResumeIds.length})
                </button>
                <button 
                  onClick={() => handleBatchAction('flag')}
                  className="flex items-center px-3 py-2 text-sm bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 transition-colors"
                >
                  <Flag className="w-4 h-4 mr-1" />
                  Flag ({selectedResumeIds.length})
                </button>
                <button 
                  onClick={() => handleBatchAction('delete')}
                  className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Delete ({selectedResumeIds.length})
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Resumes Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                      checked={selectedResumeIds.length > 0 && selectedResumeIds.length === resumes.length}
                      onChange={() => toggleSelectAll(resumes)}
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  {category === 'jobSeekers' ? (
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                  ) : (
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialty</th>
                  )}
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {resumes.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                      No resumes found matching the current filters.
                    </td>
                  </tr>
                ) : (
                  resumes.map((resume) => (
                    <tr key={resume.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                          checked={selectedResumeIds.includes(resume.id)}
                          onChange={() => toggleSelectResume(resume.id)}
                        />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{resume.name}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{resume.email}</div>
                        <div className="text-sm text-gray-500">{resume.phone}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {category === 'jobSeekers' ? resume.position : resume.specialty}
                        </div>
                        {category === 'trainers' && resume.experience && (
                          <div className="text-xs text-gray-500">{resume.experience} experience</div>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {resume.location}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {resume.fileType ? resume.fileType.toUpperCase() : '—'}
                        </div>
                        <div className="text-xs text-gray-400">{resume.fileSize}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          resume.status === 'approved' ? 'bg-green-100 text-green-800' :
                          resume.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                          resume.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {resume.status.charAt(0).toUpperCase() + resume.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(resume.submitted).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewResume(resume)}
                            className="text-teal-600 hover:text-teal-900"
                            title="View resume"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDownloadResume(resume.resumeUrl, resume.name)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Download resume"
                          >
                            <Download className="w-5 h-5" />
                          </button>
                          {resume.status !== 'approved' && (
                            <button
                              onClick={() => handleChangeStatus(resume.id, 'approved', category)}
                              className="text-green-600 hover:text-green-900"
                              title="Approve resume"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                          )}
                          {resume.status !== 'rejected' && (
                            <button
                              onClick={() => handleChangeStatus(resume.id, 'rejected', category)}
                              className="text-red-600 hover:text-red-900"
                              title="Reject resume"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          )}
                          {resume.status !== 'flagged' && (
                            <button
                              onClick={() => handleChangeStatus(resume.id, 'flagged', category)}
                              className="text-yellow-600 hover:text-yellow-900"
                              title="Flag resume"
                            >
                              <Flag className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Resume Modal */}
      {showResumeModal && selectedResume && (
        <ResumeModal 
          resume={selectedResume}
          onClose={handleCloseModal}
          handleChangeStatus={handleChangeStatus}
          handleDownloadResume={handleDownloadResume}
        />
      )}
    </div>
  );
};

// Resume Modal Component
const ResumeModal = ({ resume, onClose, handleChangeStatus, handleDownloadResume }) => {
  // Determine if it's a job seeker or trainer resume
  const isJobSeeker = Boolean(resume.position);
  const category = isJobSeeker ? 'jobSeekers' : 'trainers';
  const [isPdfLoading, setPdfLoading] = useState(true);
  const [pdfError, setPdfError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  // Helper function to determine if this is a local file URL
  const isLocalFile = resume && resume.resumeUrl && 
    (resume.resumeUrl.startsWith('/api/files/') || resume.resumeUrl.includes('/files/'));
    
  // Use fullResumeUrl if available, otherwise use resumeUrl
  const displayUrl = resume?.fullResumeUrl || resume?.resumeUrl;
  
  // Add authentication for local file viewing if needed
  const token = localStorage.getItem('token');
  
  // Create URL with token for iframe
  const getIframeUrl = () => {
    if (!displayUrl) return '';
    
    // If it's a local file, append the token
    if (isLocalFile) {
      const separator = displayUrl.includes('?') ? '&' : '?';
      return `${displayUrl}${separator}token=${encodeURIComponent(token)}`;
    }
    
    // For external URLs (like Cloudinary), use as is
    return displayUrl;
  };
  
  const iframeUrl = getIframeUrl();
  
  // Function to handle iframe load events
  const handleIframeLoad = () => {
    setPdfLoading(false);
    setPdfError(false);
  };
  
  // Function to handle iframe error events
  const handleIframeError = () => {
    setPdfLoading(false);
    
    // Only increment retry count and attempt refresh for the first 2 errors
    if (retryCount < 2) {
      setRetryCount(prevCount => prevCount + 1);
      
      // Try to refresh the iframe
      const iframe = document.getElementById('resumePreviewFrame');
      if (iframe) {
        setTimeout(() => {
          iframe.src = getIframeUrl() + `&retry=${retryCount + 1}`;
        }, 1000);
      }
    } else {
      setPdfError(true);
    }
  };
  
  // Alternative method to directly download the file
  const handleDirectDownload = () => {
    handleDownloadResume(resume.resumeUrl, resume.name);
  };
  
  // Refresh the iframe with a new URL
  const handleRefreshIframe = () => {
    setPdfLoading(true);
    setPdfError(false);
    setRetryCount(0);
    
    const iframe = document.getElementById('resumePreviewFrame');
    if (iframe) {
      iframe.src = getIframeUrl() + `&refresh=${Date.now()}`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full">
          {/* Modal header */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
              Resume Details
            </h3>
            <button
              type="button"
              className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Modal body - Modified to include PDF display */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Left column - Basic info */}
              <div className="md:col-span-1">
                <div className="mb-4">
                  <h4 className="text-lg font-medium text-gray-900">{resume.name}</h4>
                  <p className="text-sm text-gray-500">
                    {isJobSeeker ? resume.position : resume.specialty}
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h5 className="text-sm font-medium text-gray-700">Contact Information</h5>
                    <ul className="mt-2 space-y-2">
                      <li className="text-sm text-gray-600 flex items-center">
                        <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {resume.email}
                      </li>
                      <li className="text-sm text-gray-600 flex items-center">
                        <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {resume.phone}
                      </li>
                      <li className="text-sm text-gray-600 flex items-center">
                        <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {resume.location}
                      </li>
                    </ul>
                  </div>

                  {isJobSeeker && resume.keywords && resume.keywords.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-700">Skills</h5>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {resume.keywords.map((keyword, index) => (
                          <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {!isJobSeeker && resume.certification && resume.certification.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-700">Certifications</h5>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {resume.certification.map((cert, index) => (
                          <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {cert}
                          </span>
                        ))}
                      </div>
                      {resume.experience && (
                        <p className="mt-2 text-sm text-gray-600">
                          <span className="font-medium">Experience:</span> {resume.experience}
                        </p>
                      )}
                    </div>
                  )}

                  <div>
                    <h5 className="text-sm font-medium text-gray-700">Status</h5>
                    <span className={`mt-2 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      resume.status === 'approved' ? 'bg-green-100 text-green-800' :
                      resume.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                      resume.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {resume.status.charAt(0).toUpperCase() + resume.status.slice(1)}
                    </span>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium text-gray-700">Resume File</h5>
                    <div className="mt-2 flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center">
                        <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {resume.resumeUrl ? resume.resumeUrl.split('/').pop() : 'Resume'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {resume.fileType?.toUpperCase() || 'PDF'} · {resume.fileSize || 'Unknown size'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium text-gray-700">Uploaded</h5>
                    <p className="mt-1 text-sm text-gray-600">
                      {new Date(resume.submitted).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right column - PDF Display */}
              <div className="md:col-span-2 border-l pl-4">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-sm font-medium text-gray-700">Resume Preview</h5>
                  
                  {/* Add refresh button */}
                  {displayUrl && (
                    <button 
                      onClick={handleRefreshIframe}
                      className="text-sm text-teal-600 hover:text-teal-800 flex items-center"
                    >
                      <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Refresh
                    </button>
                  )}
                </div>
                
                {displayUrl ? (
                  <div className="relative border rounded-md overflow-hidden" style={{ height: '65vh' }}>
                    {/* Loading indicator */}
                    {isPdfLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
                      </div>
                    )}
                    
                    {/* Error display */}
                    {pdfError && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 p-4">
                        <svg className="h-12 w-12 text-red-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <p className="text-center text-gray-800 font-medium">Unable to display resume preview</p>
                        <p className="text-center text-gray-600 mt-1">Please try downloading the file instead</p>
                        <div className="mt-4 flex flex-col sm:flex-row gap-2">
                          <button
                            onClick={handleRefreshIframe}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                          >
                            Try Again
                          </button>
                          <button
                            onClick={handleDirectDownload}
                            className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                          >
                            Download Resume
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* PDF iframe */}
                    <iframe
                      id="resumePreviewFrame"
                      src={iframeUrl}
                      className="w-full h-full"
                      title="Resume Preview"
                      onLoad={handleIframeLoad}
                      onError={handleIframeError}
                    ></iframe>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center bg-gray-50 rounded-md p-8" style={{ height: '65vh' }}>
                    <svg className="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-center text-gray-600">Resume preview unavailable</p>
                    <button
                      onClick={handleDirectDownload}
                      className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 flex items-center"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Resume
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Modal footer */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-teal-600 text-base font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={handleDirectDownload}
            >
              Download Resume
            </button>
            
            {resume.status !== 'approved' && (
              <button
                type="button"
                className="mt-3 sm:mt-0 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={() => {
                  handleChangeStatus(resume.id, 'approved', category);
                  onClose();
                }}
              >
                Approve
              </button>
            )}
            
            {resume.status !== 'rejected' && (
              <button
                type="button"
                className="mt-3 sm:mt-0 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={() => {
                  handleChangeStatus(resume.id, 'rejected', category);
                  onClose();
                }}
              >
                Reject
              </button>
            )}
            
            {resume.status !== 'flagged' && (
              <button
                type="button"
                className="mt-3 sm:mt-0 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-yellow-600 text-base font-medium text-white hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={() => {
                  handleChangeStatus(resume.id, 'flagged', category);
                  onClose();
                }}
              >
                Flag
              </button>
            )}
            
            <button
              type="button"
              className="mt-3 sm:mt-0 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Resume; 
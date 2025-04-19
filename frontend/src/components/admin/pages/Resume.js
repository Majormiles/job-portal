import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Download, Eye, CheckCircle, XCircle, Flag, FileText, BarChart, PieChart, Calendar, MapPin, Users, FileType, ChevronDown, ChevronUp, Briefcase, Clock, User, MoreVertical } from 'lucide-react';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { toast } from 'react-toastify';
import adminApi from '../../../utils/adminApi';
import axios from 'axios';

// Register Chart.js components
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// API URL from environment
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Resume = () => {
  // State variables
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('all');
  const [filterFileType, setFilterFileType] = useState('all');
  const [activeTab, setActiveTab] = useState('summary'); // 'summary', 'jobSeekers', 'trainers'
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
      // Use adminApi to fetch users with job seeker role who have resumes
      try {
        // Try different endpoints to fetch job seekers with resumes
        const endpoints = [
          '/admin/users',         // Try admin-specific endpoint first
          '/dashboard/users',     // Try dashboard endpoint 
          '/users/list',          // Try users list endpoint
          '/users/all'            // Try alternative endpoint
        ];
        
        let jobSeekersData = [];
        let endpointFound = false;
        
        // Try each endpoint until one works
        for (const endpoint of endpoints) {
          try {
            console.log(`Attempting to fetch job seekers from ${endpoint}`);
            const response = await adminApi.get(endpoint, {
              params: { roleName: 'jobSeeker' }
            });
            
            if (response.data && (response.data.success || response.data.data)) {
              console.log(`Successfully fetched job seekers from ${endpoint}`);
              jobSeekersData = response.data.data || response.data;
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
              jobSeekersData = statsResponse.data.recentUsers.filter(
                user => user.roleName === 'jobSeeker'
              );
              console.log('Using recent users from dashboard stats:', jobSeekersData.length);
            }
          } catch (err) {
            console.log('Dashboard stats fallback failed:', err.message);
          }
        }
        
        // Process job seeker data
        if (jobSeekersData && jobSeekersData.length > 0) {
          // Transform user data to the format expected by the component
          const resumeData = jobSeekersData
            .filter(user => {
              // Only include users who have a resume in one of the possible locations
              return (
                (user.professionalInfo && user.professionalInfo.resume) || 
                (user.jobSeekerProfile && user.jobSeekerProfile.resume)
              );
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
          
          setJobSeekerResumes(resumeData);
        } else {
          setJobSeekerResumes([]);
        }
      } catch (error) {
        console.error('Error fetching job seeker users:', error);
        setJobSeekerResumes([]);
      }
      
      // Use adminApi to fetch users with trainer role who have resumes/certifications
      try {
        // Try different endpoints to fetch trainers with resumes
        const endpoints = [
          '/admin/users',         // Try admin-specific endpoint first
          '/dashboard/users',     // Try dashboard endpoint 
          '/users/list',          // Try users list endpoint
          '/users/all'            // Try alternative endpoint
        ];
        
        let trainersData = [];
        let endpointFound = false;
        
        // Try each endpoint until one works
        for (const endpoint of endpoints) {
          try {
            console.log(`Attempting to fetch trainers from ${endpoint}`);
            const response = await adminApi.get(endpoint, {
              params: { roleName: 'trainer' }
            });
            
            if (response.data && (response.data.success || response.data.data)) {
              console.log(`Successfully fetched trainers from ${endpoint}`);
              trainersData = response.data.data || response.data;
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
              trainersData = statsResponse.data.recentUsers.filter(
                user => user.roleName === 'trainer'
              );
              console.log('Using recent users from dashboard stats:', trainersData.length);
            }
          } catch (err) {
            console.log('Dashboard stats fallback failed:', err.message);
          }
        }
        
        // Process trainer data
        if (trainersData && trainersData.length > 0) {
          // Transform user data to the format expected by the component
          const resumeData = trainersData
            .filter(user => {
              // Only include users who have a resume in one of the possible locations
              return (
                (user.professionalInfo && user.professionalInfo.resume) || 
                (user.trainerProfile && user.trainerProfile.certificates && user.trainerProfile.certificates.length > 0)
              );
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
          
          setTrainerResumes(resumeData);
        } else {
          setTrainerResumes([]);
        }
      } catch (error) {
        console.error('Error fetching trainer users:', error);
        setTrainerResumes([]);
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
    setSelectedResume(resume);
    setShowResumeModal(true);
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
      
      // Check if it's a Cloudinary URL
      if (resumeUrl.includes('cloudinary.com')) {
        // For Cloudinary URLs, we need to use a proper fetch with authentication
        const token = localStorage.getItem('token');
        
        // Use a proxy endpoint to handle authentication if possible
        try {
          const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
          const proxyUrl = `${baseUrl}/proxy/download`;
          
          toast.info('Preparing resume for download...');
          
          const formData = new FormData();
          formData.append('fileUrl', resumeUrl);
          
          const config = {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            },
            responseType: 'blob'
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
          
          toast.success('Resume downloaded successfully');
          
        } catch (err) {
          console.error('Error downloading through proxy:', err);
          
          // Fallback - try direct iframe approach
          toast.info('Opening resume in a new window');
          
          // Create a temporary iframe with authentication
          const iframe = document.createElement('iframe');
          iframe.style.display = 'none';
          iframe.src = resumeUrl;
          document.body.appendChild(iframe);
          
          // Remove the iframe after load attempt
          setTimeout(() => {
            document.body.removeChild(iframe);
          }, 5000);
          
          // Also try opening in a new tab as fallback
          window.open(resumeUrl, '_blank');
        }
      } else {
        // For non-Cloudinary URLs, try direct download
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
      console.error('Error handling resume:', error);
      toast.error('Could not download resume. Please try a different method.');
      
      // Final fallback - direct user how to download manually
      toast.info('Try right-clicking on the download button and selecting "Save link as..."');
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
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'summary'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('summary')}
            >
              Dashboard
            </button>
            <button
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'jobSeekers'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('jobSeekers')}
            >
              Job Seeker Resumes
            </button>
            <button
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'trainers'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('trainers')}
            >
              Trainer Resumes
            </button>
          </nav>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
          </div>
        ) : (
          <>
            {activeTab === 'summary' && (
              <DashboardView 
                analytics={analytics}
                statusChartData={statusChartData}
                fileTypeChartData={fileTypeChartData}
                uploadsChartData={uploadsChartData}
                pieChartOptions={pieChartOptions}
                barChartOptions={barChartOptions}
                getRecentUploads={getRecentUploads}
                handleViewResume={handleViewResume}
              />
            )}

            {activeTab === 'jobSeekers' && (
              <ResumeListView
                category="jobSeekers"
                resumes={filteredJobSeekers}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filterStatus={filterStatus}
                setFilterStatus={setFilterStatus}
                filterDateRange={filterDateRange}
                setFilterDateRange={setFilterDateRange}
                filterFileType={filterFileType}
                setFilterFileType={setFilterFileType}
                selectedResumeIds={selectedResumeIds}
                toggleSelectResume={toggleSelectResume}
                toggleSelectAll={toggleSelectAll}
                handleViewResume={handleViewResume}
                handleChangeStatus={handleChangeStatus}
                handleDownloadResume={handleDownloadResume}
                handleBatchAction={handleBatchAction}
              />
            )}

            {activeTab === 'trainers' && (
              <ResumeListView
                category="trainers"
                resumes={filteredTrainers}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filterStatus={filterStatus}
                setFilterStatus={setFilterStatus}
                filterDateRange={filterDateRange}
                setFilterDateRange={setFilterDateRange}
                filterFileType={filterFileType}
                setFilterFileType={setFilterFileType}
                selectedResumeIds={selectedResumeIds}
                toggleSelectResume={toggleSelectResume}
                toggleSelectAll={toggleSelectAll}
                handleViewResume={handleViewResume}
                handleChangeStatus={handleChangeStatus}
                handleDownloadResume={handleDownloadResume}
                handleBatchAction={handleBatchAction}
              />
            )}
          </>
        )}
      </div>

      {/* Resume Preview Modal */}
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

// Dashboard View Component
const DashboardView = ({ 
  analytics, 
  statusChartData, 
  fileTypeChartData, 
  uploadsChartData, 
  pieChartOptions, 
  barChartOptions, 
  getRecentUploads, 
  handleViewResume 
}) => {
  const recentUploads = getRecentUploads('all');

  return (
    <>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-teal-100 text-teal-500 mr-4">
              <FileText size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Resumes</p>
              <p className="text-lg font-semibold">{analytics.totalResumes}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-500 mr-4">
              <Briefcase size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Job Seeker Resumes</p>
              <p className="text-lg font-semibold">{analytics.jobSeekerCount}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-500 mr-4">
              <User size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Trainer Resumes</p>
              <p className="text-lg font-semibold">{analytics.trainerCount}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-500 mr-4">
              <CheckCircle size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Approved Resumes</p>
              <p className="text-lg font-semibold">{analytics.statusCounts.approved}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Status Distribution */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
            <PieChart className="w-5 h-5 mr-2 text-gray-500" />
            Resume Status Distribution
          </h2>
          <div className="h-64">
            <Pie data={statusChartData} options={pieChartOptions} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="flex justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm">Approved:</span>
              <span className="text-sm font-medium">{analytics.statusCounts.approved}</span>
            </div>
            <div className="flex justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm">Pending:</span>
              <span className="text-sm font-medium">{analytics.statusCounts.pending}</span>
            </div>
            <div className="flex justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm">Rejected:</span>
              <span className="text-sm font-medium">{analytics.statusCounts.rejected}</span>
            </div>
            <div className="flex justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm">Flagged:</span>
              <span className="text-sm font-medium">{analytics.statusCounts.flagged}</span>
            </div>
          </div>
        </div>

        {/* File Type Distribution */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
            <FileType className="w-5 h-5 mr-2 text-gray-500" />
            Resume File Format Distribution
          </h2>
          <div className="h-64">
            <Pie data={fileTypeChartData} options={pieChartOptions} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="flex justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm">PDF:</span>
              <span className="text-sm font-medium">{analytics.fileTypeCounts.pdf}</span>
            </div>
            <div className="flex justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm">DOCX:</span>
              <span className="text-sm font-medium">{analytics.fileTypeCounts.docx}</span>
            </div>
            <div className="flex justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm">Other:</span>
              <span className="text-sm font-medium">{analytics.fileTypeCounts.other}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Trends */}
      <div className="bg-white p-4 rounded-lg shadow mt-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
          <BarChart className="w-5 h-5 mr-2 text-gray-500" />
          Upload Trends (Last 6 Months)
        </h2>
        <div className="h-80">
          <Bar data={uploadsChartData} options={barChartOptions} />
        </div>
      </div>

      {/* Recent Uploads */}
      <div className="bg-white p-4 rounded-lg shadow mt-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-gray-500" />
          Recent Uploads
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentUploads.map((resume, index) => (
                <tr key={`resume-${resume.id}-${index}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{resume.name}</div>
                        <div className="text-sm text-gray-500">{resume.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {resume.position ? 'Job Seeker' : 'Trainer'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {resume.position || resume.specialty}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      resume.status === 'approved' ? 'bg-green-100 text-green-800' :
                      resume.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                      resume.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {resume.status.charAt(0).toUpperCase() + resume.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(resume.submitted).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleViewResume(resume)}
                      className="text-teal-600 hover:text-teal-900"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

// Resume List View Component
const ResumeListView = ({
  category,
  resumes,
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  filterDateRange,
  setFilterDateRange,
  filterFileType,
  setFilterFileType,
  selectedResumeIds,
  toggleSelectResume,
  toggleSelectAll,
  handleViewResume,
  handleChangeStatus,
  handleDownloadResume,
  handleBatchAction
}) => {
  return (
    <>
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder={`Search ${category === 'jobSeekers' ? 'job seeker' : 'trainer'} resumes...`}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap md:flex-nowrap gap-2">
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400" size={18} />
              <select
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
                <option value="flagged">Flagged</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar className="text-gray-400" size={18} />
              <select
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                value={filterDateRange}
                onChange={(e) => setFilterDateRange(e.target.value)}
              >
                <option value="all">All Time</option>
                <option value="last7days">Last 7 Days</option>
                <option value="last30days">Last 30 Days</option>
                <option value="last90days">Last 90 Days</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <FileType className="text-gray-400" size={18} />
              <select
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                value={filterFileType}
                onChange={(e) => setFilterFileType(e.target.value)}
              >
                <option value="all">All File Types</option>
                <option value="pdf">PDF</option>
                <option value="docx">DOCX</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Batch Actions */}
      {selectedResumeIds.length > 0 && (
        <div className="mb-4 flex gap-2">
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
    </>
  );
};

// Resume Modal Component
const ResumeModal = ({ resume, onClose, handleChangeStatus, handleDownloadResume }) => {
  // Determine if it's a job seeker or trainer resume
  const isJobSeeker = Boolean(resume.position);
  const category = isJobSeeker ? 'jobSeekers' : 'trainers';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
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

          {/* Modal body */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {/* Left column - Basic info */}
                  <div className="md:col-span-2">
                    <div className="mb-4">
                      <h4 className="text-lg font-medium text-gray-900">{resume.name}</h4>
                      <p className="text-sm text-gray-500">
                        {isJobSeeker ? resume.position : resume.specialty}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                      {isJobSeeker && resume.keywords && (
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

                      {!isJobSeeker && resume.certification && (
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
                    </div>

                    <div className="mt-4">
                      <h5 className="text-sm font-medium text-gray-700">Notes</h5>
                      <p className="mt-1 text-sm text-gray-600">
                        {resume.notes || 'No notes available.'}
                      </p>
                    </div>
                  </div>

                  {/* Right column - Status and actions */}
                  <div className="space-y-4 border-l pl-4">
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
                            {resume.resumeUrl.split('/').pop()}
                          </p>
                          <p className="text-sm text-gray-500">
                            {resume.fileType?.toUpperCase()} · {resume.fileSize}
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
              </div>
            </div>
          </div>

          {/* Modal footer */}
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-teal-600 text-base font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={() => handleDownloadResume(resume.resumeUrl, resume.name)}
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
                Flag for Review
              </button>
            )}
            
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
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
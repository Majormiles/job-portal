import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  Filter, 
  ChevronDown, 
  X, 
  RefreshCw, 
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  Briefcase,
  Layers,
  Plus,
  Edit,
  Calendar,
  Trash2,
  Download
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, parseISO, addMonths, isSameDay, isWithinInterval, differenceInCalendarDays } from 'date-fns';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { getJobs } from '../../../services/jobService';
import adminApi from '../../../utils/adminApi';
import { toast } from 'react-hot-toast';

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;
// Batch size for rendering large datasets
const RENDER_BATCH_SIZE = 200;

const CalendarComponent = () => {
  const calendarRef = useRef(null);
  
  // Base state
  const [events, setEvents] = useState([]);
  const [visibleEvents, setVisibleEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [jobsMap, setJobsMap] = useState({});
  const [users, setUsers] = useState([]);
  
  // Export options state
  const [showExportOptions, setShowExportOptions] = useState(false);
  
  // Calendar view state
  const [currentViewInfo, setCurrentViewInfo] = useState({
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date()),
    view: 'dayGridMonth'
  });
  
  // Performance optimization state
  const [isLargeDataset, setIsLargeDataset] = useState(false);
  
  // UI state
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState({
    status: false,
    jobId: false,
    eventType: false
  });
  
  // Data cache
  const [resumeCache, setResumeCache] = useState({
    data: {},
    timestamp: {}
  });
  
  // Filters for calendar events with localStorage persistence
  const [filters, setFilters] = useState(() => {
    const savedFilters = localStorage.getItem('calendarFilters');
    return savedFilters ? JSON.parse(savedFilters) : {
      status: 'all',
      jobId: 'all',
      eventType: 'all'
    };
  });
  
  // Modal states
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [newEventDate, setNewEventDate] = useState(null);
  
  // Pagination for large datasets
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 500,
    hasMore: false,
    total: 0
  });
  
  // Status colors for events
  const statusColors = {
    pending: '#FFCD56',     // Yellow
    reviewing: '#36A2EB',   // Blue
    reviewed: '#36A2EB',    // Blue
    shortlisted: '#4BC0C0', // Teal
    interviewed: '#9966FF', // Purple
    offered: '#4BC0C0',     // Teal
    accepted: '#2ECC71',    // Green
    hired: '#2ECC71',       // Green
    rejected: '#FF6384',    // Red
    declined: '#FF6384',    // Red
    withdrawn: '#FF9F40',   // Orange
    other: '#C9CBCF'        // Gray
  };
  
  // Event types with enhanced metadata
  const eventTypes = useMemo(() => ({
    resume: {
      title: 'Resume',
      color: '#36A2EB', // Blue
      icon: <Briefcase size={14} />,
      description: 'User resume upload'
    },
    interview: {
      title: 'Interview',
      color: '#9966FF', // Purple
      icon: <User size={14} />,
      description: 'Candidate interview'
    },
    newJob: {
      title: 'New Job',
      color: '#2ECC71', // Green
      icon: <Layers size={14} />,
      description: 'New job posting'
    },
    deadline: {
      title: 'Deadline',
      color: '#FF6384', // Red
      icon: <Calendar size={14} />,
      description: 'Application deadline'
    },
    custom: {
      title: 'Custom Event',
      color: '#FF9F40', // Orange
      icon: <Plus size={14} />,
      description: 'Custom calendar event'
    }
  }), []);
  
  // Memoized date range helpers
  const dateRangeKey = useMemo(() => {
    if (!currentViewInfo.startDate || !currentViewInfo.endDate) return null;
    return `${currentViewInfo.startDate.toISOString()}_${currentViewInfo.endDate.toISOString()}`;
  }, [currentViewInfo.startDate, currentViewInfo.endDate]);

  // Track retry attempts for robust error handling
  const [retryAttempts, setRetryAttempts] = useState(0);
  const maxRetryAttempts = 3;
  
  // Reference to track first mount
  const isMounted = useRef(true);
  
  // Save filters to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('calendarFilters', JSON.stringify(filters));
  }, [filters]);
  
  // Enhanced job fetching with caching and retry mechanism
  const fetchJobs = useCallback(async (forceRefresh = false) => {
    // Don't refetch if we already have jobs and aren't forcing a refresh
    if (jobs.length > 0 && !forceRefresh) {
      return;
    }

    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      try {
        const response = await getJobs();
        
        if (response && response.success) {
          const jobData = response.data || [];
          setJobs(jobData);
          
          // Create a map of job IDs to job objects for quick lookup
          const jobMap = {};
          jobData.forEach(job => {
            jobMap[job._id] = job;
          });
          setJobsMap(jobMap);
          
          return jobData; // Return data for chaining
        } else {
          throw new Error(response?.message || 'Failed to fetch jobs');
        }
      } catch (error) {
        attempts++;
        if (attempts >= maxAttempts) {
          console.error('Error fetching jobs after multiple attempts:', error);
          toast.error('Failed to load jobs. Please try again later.');
          return [];
        }
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempts)));
      }
    }
  }, [jobs.length]);
  
  // Create events for job postings
  const createJobEvents = useCallback((jobs, startDate, endDate) => {
    return jobs
      .filter(job => {
        const jobDate = new Date(job.createdAt);
        return isWithinInterval(jobDate, { start: startDate, end: endDate });
      })
      .map(job => ({
        id: `job-${job._id}`,
        title: `New Job: ${job.title}`,
        start: job.createdAt,
        backgroundColor: eventTypes.newJob.color,
        borderColor: eventTypes.newJob.color,
        textColor: '#fff',
        extendedProps: {
          type: 'newJob',
          job: job
        }
      }));
  }, [eventTypes]);
  
  // Create events for application deadlines
  const createDeadlineEvents = useCallback((jobs, startDate, endDate) => {
    return jobs
      .filter(job => job.applicationDeadline && 
        isWithinInterval(new Date(job.applicationDeadline), { start: startDate, end: endDate }))
      .map(job => ({
        id: `deadline-${job._id}`,
        title: `Deadline: ${job.title}`,
        start: job.applicationDeadline,
        backgroundColor: eventTypes.deadline.color,
        borderColor: eventTypes.deadline.color,
        textColor: '#fff',
        allDay: true,
        extendedProps: {
          type: 'deadline',
          job: job
        }
      }));
  }, [eventTypes]);
  
  // Process resumes into calendar events
  const processResumesIntoEvents = useCallback((resumes, startDate, endDate) => {
    const calendarEvents = [];
    let processedCount = 0;
    let errorCount = 0;
    
    resumes.forEach(user => {
      try {
        // Only process users with resumes
        if (!(user.professionalInfo?.resume || 
             (user.jobSeekerProfile && user.jobSeekerProfile.resume))) {
          return;
        }

        // Get resume URL from proper location
        const resumeUrl = user.professionalInfo?.resume || 
                        (user.jobSeekerProfile ? user.jobSeekerProfile.resume : null);
        
        if (!resumeUrl) return;
        
        // Get user details
        const userName = user.name || 'Unknown User';
        const userRole = user.roleName || user.role || 'jobseeker';
        
        // Determine color based on verification status
        const status = user.isVerified ? 'approved' : 'pending';
        const color = statusColors[status] || statusColors.other;
        
        // Determine event date - use createdAt if available, otherwise current time
        const eventDate = user.createdAt || user.professionalInfo?.updatedAt || new Date().toISOString();
        
        // Create resume event
        calendarEvents.push({
          id: user._id,
          title: `Resume: ${userName} - ${userRole}`,
          start: eventDate,
          backgroundColor: color,
          borderColor: color,
          textColor: '#fff',
          extendedProps: {
            type: 'resume',
            user: {
              id: user._id,
              name: userName,
              email: user.email || '',
              phone: user.phone || '',
              role: userRole
            },
            status: status,
            resumeUrl: resumeUrl
          }
        });
        
        processedCount++;
      } catch (error) {
        errorCount++;
        console.error('Error processing resume into event:', error, user);
        // Continue processing other resumes
      }
    });
    
    // Log issues if there were errors
    if (errorCount > 0) {
      console.warn(`Processed ${processedCount} resumes with ${errorCount} errors`);
      
      // If more than 10% of resumes had errors, show a warning to the user
      if (errorCount > resumes.length * 0.1) {
        toast.warning('Some events may not display correctly due to data issues');
      }
    }
    
    return calendarEvents;
  }, [statusColors]);
  
  // Fetch user resumes with caching and fallback
  const fetchResumes = useCallback(async (startDate, endDate, options = {}) => {
    const { forceRefresh = false, page = 1, limit = pagination.limit } = options;
    
    if (!startDate || !endDate) {
      return;
    }
    
    // Create a cache key based on dates and filters
    const formattedStartDate = startDate.toISOString();
    const formattedEndDate = endDate.toISOString();
    const cacheKey = `${formattedStartDate}_${formattedEndDate}_${filters.status}_${filters.jobId}_${filters.eventType}_${page}_${limit}`;
    
    // Check if we have cached data and it's still valid (within cache duration)
    const cachedData = resumeCache.data[cacheKey];
    const cachedTimestamp = resumeCache.timestamp[cacheKey];
    const isCacheValid = cachedData && cachedTimestamp && (Date.now() - cachedTimestamp) < CACHE_DURATION;
    
    // Return cached data if valid and not forcing refresh
    if (isCacheValid && !forceRefresh) {
      console.log('Using cached calendar data:', cachedData.events.length, 'events');
      setEvents(cachedData.events);
      setPagination(prevPagination => ({
        ...prevPagination,
        page,
        hasMore: cachedData.hasMore,
        total: cachedData.total
      }));
      setLoading(false);
      return cachedData;
    }
    
    // Start loading
    setLoading(true);
    setError(null);
    
    // Start performance monitoring
    const startTime = performance.now();
    
    let currentRetryAttempt = 0;
    
    // Add fallback mock data for development/testing when API fails
    const MOCK_USERS = [
      {
        _id: 'mock-user-1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        roleName: 'jobseeker',
        isVerified: true,
        createdAt: new Date().toISOString(),
        professionalInfo: {
          resume: 'https://example.com/resume1.pdf'
        }
      },
      {
        _id: 'mock-user-2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+1234567891',
        roleName: 'jobseeker',
        isVerified: false,
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        professionalInfo: {
          resume: 'https://example.com/resume2.pdf'
        }
      },
      {
        _id: 'mock-user-3',
        name: 'Bob Johnson',
        email: 'bob@example.com',
        phone: '+1234567892',
        roleName: 'employer',
        isVerified: true,
        createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        professionalInfo: {
          resume: 'https://example.com/resume3.pdf'
        }
      }
    ];
    
    while (currentRetryAttempt <= maxRetryAttempts) {
      try {
        // Log the fetch attempt
        console.log(`Calendar: Fetching data attempt ${currentRetryAttempt + 1}/${maxRetryAttempts + 1}`);
        
        // Prepare date range filter for backend
        const dateFilter = {
          createdAt: {
            $gte: formattedStartDate,
            $lte: formattedEndDate
          }
        };
        
        // Construct query params with optimized settings
        const params = {
          page,
          limit,
          sort: '-createdAt', // Newest first
          strictPopulate: false, // Prevent mongoose populate errors
          noPopulate: true, // Optimize by not fetching related docs
        };
        
        console.log('Calendar fetching user resume data with params:', params);
        
        // Attempt to get users with resume data
        const endpoints = [
          '/admin/users',
          '/dashboard/users', 
          '/users/list',
          '/users/all'
        ];
        
        let response = null;
        let allUsers = [];
        let endpointErrors = [];
        
        // Try each endpoint until one works
        for (const endpoint of endpoints) {
          try {
            console.log(`Attempting to fetch users with resumes from ${endpoint}`);
            const endpointResponse = await adminApi.get(endpoint, { params });
            
            if (endpointResponse.data && (endpointResponse.data.success || endpointResponse.data.data)) {
              console.log(`Successfully fetched users from ${endpoint}`);
              response = endpointResponse;
              allUsers = endpointResponse.data.data || endpointResponse.data;
              
              // If data is empty but status is success, it might just be an empty dataset
              if (allUsers && Array.isArray(allUsers) && allUsers.length === 0) {
                console.log(`Endpoint ${endpoint} returned empty data array`);
              } else if (allUsers) {
                break; // We have valid data, exit the loop
              }
            }
          } catch (err) {
            const errorMessage = err.message || 'Unknown error';
            console.log(`Endpoint ${endpoint} failed: ${errorMessage}`);
            endpointErrors.push({ endpoint, error: errorMessage });
            // Continue to the next endpoint
          }
        }
        
        // If no endpoint worked, try the dashboard stats as a fallback
        if (!response || !allUsers || allUsers.length === 0) {
          try {
            console.log('Attempting to fetch from dashboard stats as fallback');
            const statsResponse = await adminApi.get('/dashboard/stats');
            if (statsResponse.data && statsResponse.data.recentUsers) {
              allUsers = statsResponse.data.recentUsers;
              console.log('Using recent users from dashboard stats:', allUsers.length);
              response = { data: { success: true, data: allUsers } };
            }
          } catch (err) {
            console.log('Dashboard stats fallback failed:', err.message);
          }
        }
        
        // Fallback to mock data if all API calls failed
        if (!allUsers || allUsers.length === 0) {
          // Log all the errors we encountered
          console.warn('All API endpoints failed:', endpointErrors);
          
          // Check if we're in development mode before using mock data
          const isDevelopment = process.env.NODE_ENV === 'development' || 
                              window.location.hostname === 'localhost' || 
                              window.location.hostname === '127.0.0.1';
          
          // Use mock data as last resort in dev mode or show error in production
          if (isDevelopment) {
            console.warn('Using mock data as fallback');
            allUsers = MOCK_USERS;
            response = { data: { success: true, data: allUsers } };
            
            // Notify user that mock data is being used
            toast.warning('Using mock data - API endpoints unavailable');
          } else {
            throw new Error('Failed to fetch user data from all available endpoints');
          }
        }
        
        // If we successfully got user data
        if (response && allUsers && allUsers.length > 0) {
          // Reset retry counter on success
          setRetryAttempts(0);
          
          // Filter users based on selected filters
          if (filters.status !== 'all') {
            allUsers = allUsers.filter(user => {
              if (filters.status === 'approved') {
                return user.isVerified === true;
              } else if (filters.status === 'pending') {
                return user.isVerified === false || user.isVerified === undefined;
              }
              return true;
            });
          }
          
          // Filter by user role if selected
          if (filters.jobId !== 'all') {
            allUsers = allUsers.filter(user => {
              const userRole = user.roleName || user.role || '';
              if (filters.jobId === 'jobSeeker') {
                return userRole.toLowerCase() === 'jobseeker';
              } else if (filters.jobId === 'trainer') {
                return userRole.toLowerCase() === 'trainer';
              } else if (filters.jobId === 'employer') {
                return userRole.toLowerCase() === 'employer';
              }
              return true;
            });
          }
          
          setUsers(allUsers);
          
          // Process users into calendar events
          const calendarEvents = processResumesIntoEvents(allUsers, startDate, endDate);
          
          // Add job postings as events if needed
          if (filters.eventType === 'all' || filters.eventType === 'newJob') {
            const jobEvents = createJobEvents(jobs, startDate, endDate);
            calendarEvents.push(...jobEvents);
          }
          
          // Add application deadlines if needed
          if (filters.eventType === 'all' || filters.eventType === 'deadline') {
            const deadlineEvents = createDeadlineEvents(jobs, startDate, endDate);
            calendarEvents.push(...deadlineEvents);
          }
          
          // Filter events based on event type filter
          let filteredEvents = calendarEvents;
          if (filters.eventType !== 'all') {
            filteredEvents = calendarEvents.filter(event => 
              event.extendedProps.type === filters.eventType
            );
          }
          
          // Cache the result
          setResumeCache(prevCache => ({
            data: {
              ...prevCache.data,
              [cacheKey]: {
                events: filteredEvents,
                hasMore: false, // For users we don't support pagination in the same way
                total: filteredEvents.length
              }
            },
            timestamp: {
              ...prevCache.timestamp,
              [cacheKey]: Date.now()
            }
          }));
          
          // Update state
          setEvents(filteredEvents);
          setPagination(prevPagination => ({
            ...prevPagination,
            page,
            hasMore: false,
            total: filteredEvents.length
          }));
          
          setLoading(false);
          
          // End performance monitoring
          const endTime = performance.now();
          const fetchTime = endTime - startTime;
          
          // Log performance metrics
          if (fetchTime > 1000) {
            console.warn(`Calendar data fetch took ${fetchTime.toFixed(0)}ms - consider optimizing API or adding more caching`);
          }
          
          // If fetch took more than 3 seconds, show a toast to the user
          if (fetchTime > 3000) {
            toast.success(`Loaded ${filteredEvents.length} events in ${(fetchTime / 1000).toFixed(1)}s`);
          }
          
          return {
            events: filteredEvents,
            hasMore: false,
            total: filteredEvents.length,
            fetchTime
          };
          
        } else {
          throw new Error('Failed to fetch user resume data from available endpoints');
        }
      } catch (error) {
        currentRetryAttempt++;
        console.error(`Calendar data fetch attempt ${currentRetryAttempt} failed:`, error);
        
        if (currentRetryAttempt > maxRetryAttempts) {
          console.error('Error fetching calendar data after retries:', error);
          setRetryAttempts(retryAttempts + 1);
          
          // Try to find any cached data as a last resort before showing error
          const anyCachedData = Object.values(resumeCache.data)[0];
          if (anyCachedData) {
            console.log('Using any cached data as emergency fallback');
            setEvents(anyCachedData.events);
            setLoading(false);
            toast.warning('Using cached data due to API errors. Some data may be outdated.');
            
            return {
              events: anyCachedData.events,
              hasMore: false,
              total: anyCachedData.events.length,
              error: true,
              usingFallback: true
            };
          }
          
          setError(`API Error: ${error.message}. Unable to fetch data.`);
          setLoading(false);
          
          return {
            events: [],
            hasMore: false,
            total: 0,
            error: true
          };
        }
        
        // Exponential backoff for retries
        const backoffDelay = 1000 * Math.pow(2, currentRetryAttempt);
        console.log(`Retrying in ${backoffDelay/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
      }
    }
  }, [filters, jobs, maxRetryAttempts, pagination.limit, retryAttempts, resumeCache, processResumesIntoEvents, createJobEvents, createDeadlineEvents]);
  
  // Enhanced fetch function to handle large datasets efficiently
  const fetchResumesEnhanced = useCallback(async (startDate, endDate, options = {}) => {
    const result = await fetchResumes(startDate, endDate, options);
    
    // If we have a large dataset, apply optimization techniques
    if (result && result.events && result.events.length > RENDER_BATCH_SIZE) {
      toast.success(`Loaded ${result.events.length} events. Optimizing display...`);
      
      // If visible range is much smaller than total range, filter only relevant events
      if (currentViewInfo.view === 'timeGridDay' || currentViewInfo.view === 'timeGridWeek') {
        const visibleStart = new Date(currentViewInfo.startDate);
        const visibleEnd = new Date(currentViewInfo.endDate);
        
        // Pre-filter events for current view to improve performance
        const relevantEvents = result.events.filter(event => {
          const eventDate = new Date(event.start);
          return isWithinInterval(eventDate, { start: visibleStart, end: visibleEnd });
        });
        
        // Update events state with all events, but immediately set visible events to only relevant ones
        setEvents(result.events);
        setVisibleEvents(relevantEvents);
        return;
      }
    }
    
    // For regular dataset sizes, normal handling applies (the useEffect above will manage visibleEvents)
    return result;
  }, [fetchResumes, currentViewInfo]);
  
  // Enhanced calendar date range change handler with debouncing
  const handleDatesSet = useCallback((dateInfo) => {
    // First call prevention - using a static flag to avoid the initial fetch
    if (!window.calendarInitialDatesSet) {
      window.calendarInitialDatesSet = true;
      console.log('Calendar: Skipping initial dates set fetch');
      
      // Still update the view info
      setCurrentViewInfo({
        startDate: dateInfo.start,
        endDate: dateInfo.end,
        view: dateInfo.view.type
      });
      
      return;
    }
    
    // Store current view info
    setCurrentViewInfo({
      startDate: dateInfo.start,
      endDate: dateInfo.end,
      view: dateInfo.view.type
    });
    
    // Skip fetch if we're in the middle of loading
    if (loading) {
      return;
    }
    
    // Use debouncing to prevent multiple fetches when quickly navigating
    // Clear any existing timeout
    if (window.datesFetchTimeout) {
      clearTimeout(window.datesFetchTimeout);
    }
    
    // Set a new timeout with longer delay for large datasets
    const debounceDelay = isLargeDataset ? 500 : 300;
    window.datesFetchTimeout = setTimeout(() => {
      console.log('Calendar: Fetching data after date range change');
      fetchResumesEnhanced(dateInfo.start, dateInfo.end);
    }, debounceDelay);
  }, [fetchResumesEnhanced, loading, isLargeDataset]);
  
  // Refresh data periodically (every 5 minutes) if the component is visible
  useEffect(() => {
    let refreshInterval;
    let lastRefresh = Date.now(); // Track when we last refreshed
    
    const refreshData = () => {
      // Only refresh if:
      // 1. Document is visible (tab is active)
      // 2. Not currently loading
      // 3. Last refresh was more than 4.5 minutes ago (prevent duplicate refreshes)
      if (document.visibilityState === 'visible' && 
          !loading && 
          (Date.now() - lastRefresh) > 4.5 * 60 * 1000) {
            
        console.log('Calendar: Performing scheduled refresh');
        lastRefresh = Date.now();
        
        fetchResumesEnhanced(currentViewInfo.startDate, currentViewInfo.endDate, { 
          forceRefresh: true 
        });
      }
    };
    
    // Set a longer interval (5 minutes) to reduce unnecessary checks
    refreshInterval = setInterval(refreshData, 5 * 60 * 1000); // 5 minutes
    
    // Clear interval on unmount
    return () => {
      clearInterval(refreshInterval);
    };
  }, [fetchResumesEnhanced, currentViewInfo.startDate, currentViewInfo.endDate, loading]);
  
  // Handle window visibility change to refresh data when tab becomes active
  useEffect(() => {
    let lastVisibilityRefresh = 0;
    
    const handleVisibilityChange = () => {
      // Only refresh if:
      // 1. Document is visible (tab is active)
      // 2. Not loading
      // 3. At least 30 seconds since last visibility refresh (debounce)
      if (document.visibilityState === 'visible' && 
          !loading && 
          (Date.now() - lastVisibilityRefresh) > 30000) {
          
        lastVisibilityRefresh = Date.now();
        
        // Check if cache is older than 5 minutes
        const cacheKey = `${currentViewInfo.startDate?.toISOString()}_${currentViewInfo.endDate?.toISOString()}_${filters.status}_${filters.jobId}_${filters.eventType}_1_${pagination.limit}`;
        const timestamp = resumeCache.timestamp[cacheKey];
        
        if (!timestamp || (Date.now() - timestamp) > CACHE_DURATION) {
          console.log('Calendar: Refreshing on tab visibility change');
          fetchResumesEnhanced(currentViewInfo.startDate, currentViewInfo.endDate, { 
            forceRefresh: true 
          });
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [
    fetchResumesEnhanced, 
    currentViewInfo.startDate, 
    currentViewInfo.endDate, 
    filters, 
    resumeCache.timestamp, 
    loading,
    pagination.limit
  ]);
  
  // Performance optimization for large datasets
  useEffect(() => {
    // Check if we have a large dataset
    const isLarge = events.length > RENDER_BATCH_SIZE;
    setIsLargeDataset(isLarge);
    
    // Cancel any existing render timeouts to avoid race conditions
    if (window.renderBatchTimeout) {
      clearTimeout(window.renderBatchTimeout);
      window.renderBatchTimeout = null;
    }
    
    if (isLarge) {
      // For large datasets, use a more efficient method
      
      // First, immediately show a subset for initial rendering
      // Use the most recent events as they're likely most relevant
      const initialBatch = events.slice(0, Math.min(RENDER_BATCH_SIZE, events.length));
      setVisibleEvents(initialBatch);
      
      // Then set up deferred loading of the rest
      let processed = RENDER_BATCH_SIZE;
      
      const processNextBatch = () => {
        // If all events processed or component unmounted, stop
        if (processed >= events.length || !document.body.contains(calendarRef.current?.elRef.current)) {
          return;
        }
        
        // Only process more if the user is actually interacting with the page
        // This prevents background processing from slowing down foreground interactions
        if (document.visibilityState === 'visible') {
          const batchSize = Math.min(RENDER_BATCH_SIZE, events.length - processed);
          const nextBatch = events.slice(0, processed + batchSize);
          
          // Using functional update to avoid stale state issues
          setVisibleEvents(nextBatch);
          processed += batchSize;
          
          // Schedule next batch with increasing delays to allow UI responsiveness
          const delay = Math.min(100, 10 * Math.floor(processed / RENDER_BATCH_SIZE));
          window.renderBatchTimeout = setTimeout(processNextBatch, delay);
        } else {
          // If page not visible, try again in a second
          window.renderBatchTimeout = setTimeout(processNextBatch, 1000);
        }
      };
      
      // Start background processing after a short delay
      // to let the initial render complete
      window.renderBatchTimeout = setTimeout(processNextBatch, 100);
    } else {
      // For smaller datasets, render all at once
      setVisibleEvents(events);
    }
    
    // Cleanup function
    return () => {
      if (window.renderBatchTimeout) {
        clearTimeout(window.renderBatchTimeout);
        window.renderBatchTimeout = null;
      }
    };
  }, [events, calendarRef]);
  
  // Automatic recovery
  useEffect(() => {
    // If loading gets stuck for more than 10 seconds, attempt recovery
    let loadingTimeout;
    
    if (loading) {
      loadingTimeout = setTimeout(() => {
        console.warn('Loading state stuck for too long, attempting recovery');
        setLoading(false);
        
        // If we have cached data, use it
        if (dateRangeKey && resumeCache.data[dateRangeKey]) {
          setEvents(resumeCache.data[dateRangeKey].events);
          toast.warning('Using cached data. Pull down to refresh.');
        } else {
          setError('Loading took too long. Please try refreshing the page.');
        }
      }, 10000); // 10 seconds timeout
    }
    
    return () => {
      if (loadingTimeout) clearTimeout(loadingTimeout);
    };
  }, [loading, dateRangeKey, resumeCache]);
  
  // Calendar viewport change optimization
  useEffect(() => {
    let viewportMutationObserver;
    
    // Only observe if we're rendering a large dataset
    if (isLargeDataset && calendarRef.current) {
      // Create a mutation observer to detect when calendar viewport changes (e.g., scroll)
      // This helps us optimize rendering by only showing events in the current viewport
      const calendarEl = calendarRef.current.elRef.current;
      
      viewportMutationObserver = new MutationObserver((mutations) => {
        // Throttle updates to avoid performance issues
        if (!window.calendarViewportThrottle) {
          window.calendarViewportThrottle = setTimeout(() => {
            const visibleArea = calendarEl.getBoundingClientRect();
            
            // Find visible date cells
            const dateCells = calendarEl.querySelectorAll('.fc-daygrid-day');
            const visibleDates = [];
            
            dateCells.forEach(cell => {
              const cellRect = cell.getBoundingClientRect();
              // Check if cell is in viewport
              if (cellRect.top < visibleArea.bottom && 
                  cellRect.bottom > visibleArea.top) {
                const dateAttr = cell.getAttribute('data-date');
                if (dateAttr) visibleDates.push(dateAttr);
              }
            });
            
            // Prioritize events for visible dates
            if (visibleDates.length > 0 && events.length > RENDER_BATCH_SIZE) {
              const prioritizedEvents = [...events].sort((a, b) => {
                const aDate = a.start.split('T')[0]; // Extract YYYY-MM-DD part
                const bDate = b.start.split('T')[0];
                
                const aIsVisible = visibleDates.includes(aDate);
                const bIsVisible = visibleDates.includes(bDate);
                
                if (aIsVisible && !bIsVisible) return -1;
                if (!aIsVisible && bIsVisible) return 1;
                return 0;
              });
              
              // Update visible events with prioritized batch
              setVisibleEvents(prioritizedEvents.slice(0, RENDER_BATCH_SIZE));
            }
            
            window.calendarViewportThrottle = null;
          }, 100);
        }
      });
      
      viewportMutationObserver.observe(calendarEl, { 
        childList: true, 
        subtree: true, 
        attributes: true 
      });
    }
    
    return () => {
      if (viewportMutationObserver) {
        viewportMutationObserver.disconnect();
      }
      if (window.calendarViewportThrottle) {
        clearTimeout(window.calendarViewportThrottle);
      }
    };
  }, [isLargeDataset, events]);
  
  // Export calendar events to CSV
  const exportToCSV = useCallback(() => {
    if (events.length === 0) {
      toast.error('No events to export');
      return;
    }
    
    // Format events for CSV
    const csvData = events.map(event => {
      const eventDate = new Date(event.start);
      const eventType = event.extendedProps?.type || 'event';
      const status = event.extendedProps?.status || 'n/a';
      const title = event.title || 'Untitled Event';
      
      // Get user info for resume events
      const userName = event.extendedProps?.user?.name || 'n/a';
      const userEmail = event.extendedProps?.user?.email || 'n/a';
      const userRole = event.extendedProps?.user?.role || 'n/a';
      
      return [
        eventDate.toLocaleDateString(),
        eventDate.toLocaleTimeString(),
        title,
        eventType,
        status,
        userName,
        userEmail,
        userRole
      ].join(',');
    });
    
    // Add header row
    const headers = ['Date', 'Time', 'Title', 'Event Type', 'Status', 'User Name', 'User Email', 'User Role'].join(',');
    const csvContent = [headers, ...csvData].join('\n');
    
    // Create file and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `resume-calendar-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Events exported to CSV');
    setShowExportOptions(false);
  }, [events]);
  
  // Export calendar events to JSON
  const exportToJSON = useCallback(() => {
    if (events.length === 0) {
      toast.error('No events to export');
      return;
    }
    
    // Format events for JSON
    const jsonData = events.map(event => ({
      title: event.title,
      date: new Date(event.start).toISOString(),
      type: event.extendedProps?.type || 'event',
      status: event.extendedProps?.status || null,
      user: event.extendedProps?.type === 'resume' ? {
        name: event.extendedProps.user?.name || null,
        email: event.extendedProps.user?.email || null,
        role: event.extendedProps.user?.role || null
      } : null,
      resumeUrl: event.extendedProps?.resumeUrl || null
    }));
    
    // Create file and download
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `resume-calendar-${format(new Date(), 'yyyy-MM-dd')}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Events exported to JSON');
    setShowExportOptions(false);
  }, [events]);
  
  // Export calendar events to iCalendar format
  const exportToICalendar = useCallback(() => {
    if (events.length === 0) {
      toast.error('No events to export');
      return;
    }
    
    // Basic iCalendar format
    let iCalContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//JobPortal//Calendar//EN'
    ];
    
    // Add events
    events.forEach(event => {
      const startDate = new Date(event.start);
      const endDate = event.end ? new Date(event.end) : new Date(startDate.getTime() + 60 * 60 * 1000); // Default 1 hour
      
      // Format dates in iCalendar format (YYYYMMDDTHHmmssZ)
      const formatDate = (date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      };
      
      // Add event
      iCalContent = [
        ...iCalContent,
        'BEGIN:VEVENT',
        `UID:${event.id || Math.random().toString(36).substring(2, 11)}`,
        `DTSTAMP:${formatDate(new Date())}`,
        `DTSTART:${formatDate(startDate)}`,
        `DTEND:${formatDate(endDate)}`,
        `SUMMARY:${event.title}`,
        'END:VEVENT'
      ];
    });
    
    // Close iCalendar
    iCalContent.push('END:VCALENDAR');
    
    // Create file and download
    const blob = new Blob([iCalContent.join('\r\n')], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `calendar-events-${format(new Date(), 'yyyy-MM-dd')}.ics`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Events exported to iCalendar format');
    setShowExportOptions(false);
  }, [events]);
  
  // Handle event click with extended functionality
  const handleEventClick = useCallback((clickInfo) => {
    clickInfo.jsEvent.preventDefault();
    setSelectedEvent(clickInfo.event);
    setShowEventModal(true);
  }, []);
  
  // Handle date click for creating new events
  const handleDateClick = useCallback((dateClickInfo) => {
    setNewEventDate(dateClickInfo.date);
    setShowCreateEventModal(true);
  }, []);
  
  // Enhanced filter change handler with analytics tracking
  const handleFilterChange = useCallback((filterName, value) => {
    setFilters(prev => {
      const newFilters = { ...prev, [filterName]: value };
      
      // Track filter usage for analytics (implementation depends on your analytics setup)
      try {
        if (window.analytics) {
          window.analytics.track('Calendar Filter Change', {
            filterName,
            newValue: value,
            previousValue: prev[filterName]
          });
        }
      } catch (e) {
        console.error('Analytics error:', e);
      }
      
      return newFilters;
    });
    
    // Close the filter dropdown
    setIsFilterDropdownOpen(prev => ({
      ...prev,
      [filterName]: false
    }));
  }, []);
  
  // Toggle filter dropdown
  const toggleFilterDropdown = useCallback((dropdownName) => {
    setIsFilterDropdownOpen(prev => ({
      ...prev,
      [dropdownName]: !prev[dropdownName]
    }));
  }, []);
  
  // Close event modal with cleanup
  const closeEventModal = useCallback(() => {
    setShowEventModal(false);
    // Use setTimeout to prevent flickering
    setTimeout(() => {
      setSelectedEvent(null);
    }, 300);
  }, []);
  
  // Close create event modal
  const closeCreateEventModal = useCallback(() => {
    setShowCreateEventModal(false);
    setNewEventDate(null);
  }, []);
  
  // Handle event drag and drop for rescheduling
  const handleEventDrop = useCallback(async (eventDropInfo) => {
    const { event, oldEvent } = eventDropInfo;
    
    // Get difference in days for user feedback
    const daysDifference = differenceInCalendarDays(
      new Date(event.start),
      new Date(oldEvent.start)
    );
    
    const direction = daysDifference > 0 ? 'forward' : 'backward';
    const dayText = Math.abs(daysDifference) === 1 ? 'day' : 'days';
    
    // Show confirmation toast
    const confirmMove = await new Promise(resolve => {
      toast((t) => (
        <div>
          <p>Move event {Math.abs(daysDifference)} {dayText} {direction}?</p>
          <div className="mt-2 flex justify-end space-x-2">
            <button 
              onClick={() => {
                toast.dismiss(t.id);
                resolve(false);
              }}
              className="px-2 py-1 text-sm bg-gray-200 rounded"
            >
              Cancel
            </button>
            <button 
              onClick={() => {
                toast.dismiss(t.id);
                resolve(true);
              }}
              className="px-2 py-1 text-sm bg-blue-500 text-white rounded"
            >
              Confirm
            </button>
          </div>
        </div>
      ), { duration: 5000 });
    });
    
    if (!confirmMove) {
      // Revert the event to its original position
      eventDropInfo.revert();
      return;
    }
    
    // Handle different event types
    try {
      const eventType = event.extendedProps.type;
      
      if (eventType === 'interview') {
        // Update interview date logic would go here
        // This would call your API to update the interview date
        // Example: await updateInterview(event.extendedProps.application._id, { interviewDate: event.start });
        
        toast.success(`Interview rescheduled successfully`);
      } else if (eventType === 'deadline') {
        // Update job application deadline logic would go here
        // Example: await updateJob(event.extendedProps.job._id, { applicationDeadline: event.start });
        
        toast.success(`Application deadline updated successfully`);
      } else {
        // Other event types may not be movable
        eventDropInfo.revert();
        toast.error(`Cannot reschedule this type of event`);
      }
      
      // Refresh events after successful update
      fetchResumesEnhanced(currentViewInfo.startDate, currentViewInfo.endDate, { forceRefresh: true });
      
    } catch (error) {
      console.error('Error updating event date:', error);
      eventDropInfo.revert();
      toast.error('Failed to update event date. Please try again.');
    }
  }, [currentViewInfo.startDate, currentViewInfo.endDate, fetchResumesEnhanced]);
  
  // Load more applications when scrolling to the bottom of the calendar
  const handleMoreLinkClick = useCallback(async (info) => {
    // Prevent default FullCalendar behavior
    info.jsEvent.preventDefault();
    
    // If we have more pages to load
    if (pagination.hasMore) {
      const nextPage = pagination.page + 1;
      
      setLoading(true);
      
      try {
        // Fetch next page of applications
        await fetchResumesEnhanced(currentViewInfo.startDate, currentViewInfo.endDate, {
          page: nextPage
        });
        
        toast.success(`Loaded more events`);
      } catch (error) {
        console.error('Error loading more events:', error);
        toast.error('Failed to load more events');
      } finally {
        setLoading(false);
      }
    }
    
    // Return false to prevent default +more behavior
    return false;
  }, [pagination.hasMore, pagination.page, currentViewInfo.startDate, currentViewInfo.endDate, fetchResumesEnhanced]);
  
  // Create a new custom event
  const handleCreateEvent = useCallback(async (eventData) => {
    // This would call your API to create a new event
    // Implementation depends on your backend API
    
    try {
      // Example: await createCalendarEvent({ ...eventData, date: newEventDate });
      
      toast.success('Event created successfully');
      closeCreateEventModal();
      
      // Refresh calendar events
      fetchResumesEnhanced(currentViewInfo.startDate, currentViewInfo.endDate, { forceRefresh: true });
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event');
    }
  }, [newEventDate, currentViewInfo.startDate, currentViewInfo.endDate, fetchResumesEnhanced, closeCreateEventModal]);
  
  // Initialize - optimized fetching of jobs and applications data
  useEffect(() => {
    // Reset the global flags to ensure proper initialization
    window.calendarInitialDatesSet = false;
    
    // Fetch jobs first, then fetch applications, but only on first mount
    // Fetch jobs first, then fetch applications, but only on first mount
    const fetchInitialData = async () => {
      // Only run on first mount
      if (!isMounted.current) return;
      
      // Mark as no longer first mount to prevent future runs
      isMounted.current = false;
      
      try {
        console.log('Calendar: Starting initial data fetch');
        setLoading(true);
        await fetchJobs();
        
        // Then fetch applications for current view after jobs are loaded
        if (currentViewInfo.startDate && currentViewInfo.endDate) {
          await fetchResumesEnhanced(currentViewInfo.startDate, currentViewInfo.endDate);
        }
      } catch (error) {
        console.error('Error during initial data fetch:', error);
        setError('Failed to load initial calendar data. Please try refreshing.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialData();
    
    // Add window click handler to close dropdowns when clicking outside
    const handleClickOutside = (event) => {
      const dropdowns = document.querySelectorAll('.origin-top-right');
      if (dropdowns.length === 0) return;
      
      let clickedInsideDropdown = false;
      dropdowns.forEach(dropdown => {
        if (dropdown.contains(event.target)) {
          clickedInsideDropdown = true;
        }
      });
      
      if (!clickedInsideDropdown) {
        setIsFilterDropdownOpen({
          status: false,
          jobId: false,
          eventType: false
        });
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    
    // Clear any timeouts and remove event listeners on unmount
    return () => {
      if (window.datesFetchTimeout) {
        clearTimeout(window.datesFetchTimeout);
      }
      document.removeEventListener('click', handleClickOutside);
    };
  // Remove dependencies that cause re-triggering 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  return (
    <div className="admin-job-container">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start p-5 border-b border-gray-200">
          <div>
            <h1 className="text-xl font-bold text-gray-800 flex items-center">
              <CalendarIcon size={20} className="mr-2" />
              Resume Calendar
            </h1>
            <p className="text-gray-500 mt-1">
              Track resume uploads and related events
            </p>
          </div>
          
          <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {/* Export dropdown */}
            <div className="relative inline-block text-left w-full sm:w-auto">
              <div>
                <button 
                  className="flex justify-between items-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                  onClick={() => setShowExportOptions(!showExportOptions)}
                >
                  <div className="flex items-center">
                    <Download size={16} className="mr-2" />
                    <span>Export</span>
                  </div>
                  <ChevronDown size={16} className="ml-2" />
                </button>
              </div>

              {showExportOptions && (
                <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    <button 
                      className="text-gray-700 block px-4 py-2 text-sm w-full text-left hover:bg-gray-100"
                      onClick={exportToCSV}
                    >
                      Export to CSV
                    </button>
                    <button 
                      className="text-gray-700 block px-4 py-2 text-sm w-full text-left hover:bg-gray-100"
                      onClick={exportToJSON}
                    >
                      Export to JSON
                    </button>
                    <button 
                      className="text-gray-700 block px-4 py-2 text-sm w-full text-left hover:bg-gray-100"
                      onClick={exportToICalendar}
                    >
                      Export to iCalendar (.ics)
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Filter dropdown for status */}
            <div className="relative inline-block text-left w-full sm:w-auto">
              <div>
                <button 
                  className="flex justify-between items-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                  onClick={() => toggleFilterDropdown('status')}
                >
                  <div className="flex items-center">
                    <Filter size={16} className="mr-2" />
                    <span>{filters.status === 'all' ? 'All Statuses' : filters.status.charAt(0).toUpperCase() + filters.status.slice(1)}</span>
                  </div>
                  <ChevronDown size={16} className="ml-2" />
                </button>
              </div>

              {isFilterDropdownOpen.status && (
                <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                  <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                    <button 
                      className={`${filters.status === 'all' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} block px-4 py-2 text-sm w-full text-left hover:bg-gray-100`}
                      onClick={() => handleFilterChange('status', 'all')}
                    >
                      All Statuses
                    </button>
                    <button 
                      className={`${filters.status === 'approved' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} block px-4 py-2 text-sm w-full text-left hover:bg-gray-100`}
                      onClick={() => handleFilterChange('status', 'approved')}
                    >
                      <div className="flex items-center">
                        <span 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{backgroundColor: statusColors.approved}}
                        ></span>
                        Approved
                      </div>
                    </button>
                    <button 
                      className={`${filters.status === 'pending' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} block px-4 py-2 text-sm w-full text-left hover:bg-gray-100`}
                      onClick={() => handleFilterChange('status', 'pending')}
                    >
                      <div className="flex items-center">
                        <span 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{backgroundColor: statusColors.pending}}
                        ></span>
                        Pending
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Filter dropdown for user roles */}
            <div className="relative inline-block text-left w-full sm:w-auto">
              <div>
                <button 
                  className="flex justify-between items-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                  onClick={() => toggleFilterDropdown('jobId')}
                >
                  <div className="flex items-center">
                    <User size={16} className="mr-2" />
                    <span>User Roles</span>
                  </div>
                  <ChevronDown size={16} className="ml-2" />
                </button>
              </div>

              {isFilterDropdownOpen.jobId && (
                <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                  <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                    <button 
                      className={`${filters.jobId === 'all' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} block px-4 py-2 text-sm w-full text-left hover:bg-gray-100`}
                      onClick={() => handleFilterChange('jobId', 'all')}
                    >
                      All Roles
                    </button>
                    <button 
                      className={`${filters.jobId === 'jobSeeker' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} block px-4 py-2 text-sm w-full text-left hover:bg-gray-100`}
                      onClick={() => handleFilterChange('jobId', 'jobSeeker')}
                    >
                      Job Seekers
                    </button>
                    <button 
                      className={`${filters.jobId === 'trainer' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} block px-4 py-2 text-sm w-full text-left hover:bg-gray-100`}
                      onClick={() => handleFilterChange('jobId', 'trainer')}
                    >
                      Trainers
                    </button>
                    <button 
                      className={`${filters.jobId === 'employer' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} block px-4 py-2 text-sm w-full text-left hover:bg-gray-100`}
                      onClick={() => handleFilterChange('jobId', 'employer')}
                    >
                      Employers
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Filter dropdown for event types */}
            <div className="relative inline-block text-left w-full sm:w-auto">
              <div>
                <button 
                  className="flex justify-between items-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                  onClick={() => toggleFilterDropdown('eventType')}
                >
                  <div className="flex items-center">
                    <Layers size={16} className="mr-2" />
                    <span>{filters.eventType === 'all' ? 'All Event Types' : (
                      eventTypes[filters.eventType]?.title || 'Selected Event Type'
                    )}</span>
                  </div>
                  <ChevronDown size={16} className="ml-2" />
                </button>
              </div>

              {isFilterDropdownOpen.eventType && (
                <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                  <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                    <button 
                      className={`${filters.eventType === 'all' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} block px-4 py-2 text-sm w-full text-left hover:bg-gray-100`}
                      onClick={() => handleFilterChange('eventType', 'all')}
                    >
                      All Event Types
                    </button>
                    {Object.entries(eventTypes).map(([type, info]) => (
                      <button 
                        key={type}
                        className={`${filters.eventType === type ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} block px-4 py-2 text-sm w-full text-left hover:bg-gray-100`}
                        onClick={() => handleFilterChange('eventType', type)}
                      >
                        <div className="flex items-center">
                          <span 
                            className="w-3 h-3 rounded-full mr-1.5" 
                            style={{backgroundColor: info.color}}
                          ></span>
                          {info.title}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Calendar Legend */}
        <div className="px-5 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-wrap gap-4">
            <div className="text-sm font-medium">Event Types:</div>
            
            {Object.entries(eventTypes).map(([type, info]) => (
              <div key={type} className="flex items-center text-sm">
                <span 
                  className="w-3 h-3 rounded-full mr-1.5" 
                  style={{backgroundColor: info.color}}
                ></span>
                <span>{info.title}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Error state with retry */}
        {error && (
          <div className="p-5 bg-red-50 border-b border-red-100">
            <div className="flex items-center text-red-700">
              <AlertCircle size={18} className="mr-2" />
              <p>{error}</p>
            </div>
            <button
              onClick={() => {
                setLoading(true);
                setError(null);
                setRetryAttempts(0); // Reset retry attempts to give it a fresh start
                // Force a refresh of the calendar data
                fetchResumesEnhanced(currentViewInfo.startDate, currentViewInfo.endDate, { 
                  forceRefresh: true,
                  page: 1, // Reset to page 1
                  byppassCache: true // Custom flag to bypass cache completely
                });
                toast.info('Retrying data fetch...');
              }}
              className="mt-2 inline-flex items-center px-3 py-1.5 border border-red-300 text-sm rounded-md text-red-700 bg-white hover:bg-red-50 disabled:opacity-50"
              disabled={retryAttempts >= maxRetryAttempts}
            >
              <RefreshCw 
                size={14} 
                className={loading ? "mr-1.5 animate-spin" : "mr-1.5"} 
              />
              <span>
                {loading ? 'Loading...' : (retryAttempts >= maxRetryAttempts ? 'Too many retries' : 'Retry')}
              </span>
            </button>
          </div>
        )}
        
        {/* Calendar Container */}
        <div className={`p-3 md:p-5 relative ${loading ? 'opacity-50' : ''}`}>
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-white bg-opacity-70">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <p className="mt-3 text-gray-600">Loading calendar data...</p>
              </div>
            </div>
          )}
          
          {isLargeDataset && (
            <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-md">
              <div className="flex justify-between items-center">
                <p className="flex items-center text-sm">
                  <AlertCircle size={16} className="mr-2" />
                  Optimized view for large dataset ({events.length} events) - showing {visibleEvents.length} at a time.
                </p>
                <button 
                  onClick={() => setVisibleEvents(events.slice(0, Math.min(events.length, RENDER_BATCH_SIZE * 2)))}
                  className="text-xs bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded"
                  disabled={visibleEvents.length >= events.length}
                >
                  Load more events
                </button>
              </div>
            </div>
          )}
          
          <div className="h-[75vh]">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth'
              }}
              events={visibleEvents}
              eventClick={handleEventClick}
              datesSet={handleDatesSet}
              dateClick={handleDateClick}
              eventDrop={handleEventDrop}
              moreLinkClick={handleMoreLinkClick}
              height="100%"
              eventTimeFormat={{
                hour: '2-digit',
                minute: '2-digit',
                meridiem: 'short'
              }}
              dayMaxEvents={3}
              eventDisplay="auto"
              eventColor="#3788d8"
              nowIndicator={true}
              editable={true}
              droppable={true}
              selectable={true}
              selectMirror={true}
              weekNumbers={true}
              navLinks={true}
              businessHours={{
                daysOfWeek: [1, 2, 3, 4, 5], // Monday - Friday
                startTime: '08:00',
                endTime: '18:00',
              }}
              slotMinTime="07:00:00"
              slotMaxTime="20:00:00"
              slotDuration="00:30:00"
              allDaySlot={true}
              allDayText="All Day"
              firstDay={1} // Monday as first day
              lazyFetching={true}
              progressiveEventRendering={true}
              rerenderDelay={10}
              eventDidMount={(info) => {
                // Skip tooltip creation for events that aren't fully in the viewport
                // This dramatically reduces DOM elements for large calendars
                const calendarViewport = calendarRef.current?.elRef.current;
                if (calendarViewport) {
                  const viewportRect = calendarViewport.getBoundingClientRect();
                  const eventRect = info.el.getBoundingClientRect();
                  
                  // If event is completely outside viewport, skip tooltip creation
                  if (eventRect.bottom < viewportRect.top - 100 || 
                      eventRect.top > viewportRect.bottom + 100 ||
                      eventRect.right < viewportRect.left - 50 || 
                      eventRect.left > viewportRect.right + 50) {
                    return; // Skip tooltip for off-screen events
                  }
                }
                
                // Add tooltips to events
                const eventType = info.event.extendedProps.type;
                const typeInfo = eventTypes[eventType] || {};
                
                // Create tooltip content
                const tooltipContent = `
                  <div class="p-2">
                    <div class="font-semibold text-gray-800 mb-1">${info.event.title}</div>
                    ${typeInfo.description ? 
                      `<div class="text-xs text-gray-600 mb-1.5">${typeInfo.description}</div>` : ''}
                    
                    ${info.event.extendedProps.status ? 
                      `<div class="text-xs mt-1.5">
                        <span class="font-medium">Status:</span> 
                        <span class="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium" 
                          style="background-color: ${statusColors[info.event.extendedProps.status] || statusColors.other}; color: white;">
                          ${info.event.extendedProps.status.charAt(0).toUpperCase() + info.event.extendedProps.status.slice(1)}
                        </span>
                      </div>` : ''}
                    
                    ${info.event.extendedProps.user ? 
                      `<div class="text-xs mt-1.5">
                        <span class="font-medium">User:</span> 
                        ${info.event.extendedProps.user.name || 'Unknown'}
                      </div>` : ''}
                    
                    <div class="text-xs mt-1.5 text-gray-500">
                      ${format(new Date(info.event.start), 'MMM d, yyyy h:mm a')}
                    </div>
                  </div>
                `;
                
                // Add a simple tooltip
                const tooltip = document.createElement('div');
                tooltip.className = 'calendar-tooltip bg-white shadow-lg rounded-md text-sm z-50 absolute';
                tooltip.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                tooltip.style.border = '1px solid rgba(0, 0, 0, 0.1)';
                tooltip.style.zIndex = '9999'; // Ensure it's above everything
                tooltip.style.maxWidth = '250px';
                tooltip.style.padding = '8px';
                tooltip.innerHTML = tooltipContent;
                tooltip.style.display = 'none';
                
                document.body.appendChild(tooltip);

                // Performance optimization: Throttle mousemove calculations
                let throttleTimer;
                const throttleDuration = 50; // ms between calculations
                
                // Show/hide tooltip on hover with throttled positioning
                info.el.addEventListener('mouseover', () => {
                  // Only show tooltip, positioning will be handled by mousemove
                  tooltip.style.display = 'block';
                  
                  // Position once initially without waiting for mousemove
                  positionTooltip();
                });
                
                // Use mousemove with throttling instead of recalculating on every pixel movement
                const positionTooltip = () => {
                  if (throttleTimer) return;
                  
                  throttleTimer = setTimeout(() => {
                    throttleTimer = null;
                    
                    const rect = info.el.getBoundingClientRect();
                    const windowWidth = window.innerWidth;
                    const tooltipRect = tooltip.getBoundingClientRect();
                    
                    // Simplified positioning logic - only check right edge overflow as that's most common
                    const willOverflowRight = (rect.right + tooltipRect.width + 10) > windowWidth;
                    
                    // Apply position based on overflow status
                    if (willOverflowRight) {
                      tooltip.style.left = `${Math.max(10, rect.left - tooltipRect.width - 10)}px`;
                    } else {
                      tooltip.style.left = `${rect.right + 10}px`;
                    }
                    
                    // Simplify vertical positioning - just align with top of element
                    tooltip.style.top = `${rect.top}px`;
                  }, throttleDuration);
                };
                
                // Handle mousemove for repositioning with throttling
                info.el.addEventListener('mousemove', positionTooltip);
                
                info.el.addEventListener('mouseout', () => {
                  tooltip.style.display = 'none';
                  // Clear any pending throttle timer
                  if (throttleTimer) {
                    clearTimeout(throttleTimer);
                    throttleTimer = null;
                  }
                });
                
                // Clean up on event unmount - be thorough with removing event listeners
                const cleanup = () => {
                  if (document.body.contains(tooltip)) {
                    document.body.removeChild(tooltip);
                  }
                  // Also clear any timers
                  if (throttleTimer) {
                    clearTimeout(throttleTimer);
                  }
                };
                
                info.el.addEventListener('eventUnmount', cleanup);
                
                // Add a fail-safe cleanup after 30 seconds if eventUnmount doesn't fire
                // This prevents tooltip divs from accumulating in the DOM
                setTimeout(() => {
                  cleanup();
                }, 30000);
              }}
            />
          </div>
        </div>
        
        {/* Stats Summary */}
        <div className="p-5 border-t border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">Total Resumes</p>
              <p className="text-2xl font-semibold">{events.filter(e => e.extendedProps?.type === 'resume').length}</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">Approved Resumes</p>
              <p className="text-2xl font-semibold">{events.filter(e => e.extendedProps?.type === 'resume' && e.extendedProps?.status === 'approved').length}</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">Pending Resumes</p>
              <p className="text-2xl font-semibold">{events.filter(e => e.extendedProps?.type === 'resume' && e.extendedProps?.status === 'pending').length}</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">Other Events</p>
              <p className="text-2xl font-semibold">{events.filter(e => e.extendedProps?.type !== 'resume').length}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Event Detail Modal */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold">{selectedEvent.title}</h3>
                <button 
                  onClick={closeEventModal}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-5">
              <div className="space-y-4">
                {/* Event Date */}
                <div className="flex items-start">
                  <CalendarIcon size={18} className="text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Date</p>
                    <p className="text-sm text-gray-800">
                      {format(new Date(selectedEvent.start), 'PPP p')}
                    </p>
                  </div>
                </div>
                
                {/* Event Type */}
                <div className="flex items-start">
                  <Layers size={18} className="text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Event Type</p>
                    <p className="text-sm text-gray-800 capitalize flex items-center">
                      {eventTypes[selectedEvent.extendedProps.type]?.icon}
                      <span className="ml-1">{eventTypes[selectedEvent.extendedProps.type]?.title || selectedEvent.extendedProps.type}</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      {eventTypes[selectedEvent.extendedProps.type]?.description || ''}
                    </p>
                  </div>
                </div>
                
                {/* User Details for Resume */}
                {selectedEvent.extendedProps.type === 'resume' && (
                  <div className="flex items-start">
                    <User size={18} className="text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">User</p>
                      <p className="text-sm text-gray-800">
                        {selectedEvent.extendedProps.user?.name || 'Unknown User'}
                      </p>
                      {selectedEvent.extendedProps.user?.email && (
                        <p className="text-xs text-gray-500">
                          Email: {selectedEvent.extendedProps.user.email}
                        </p>
                      )}
                      {selectedEvent.extendedProps.user?.phone && (
                        <p className="text-xs text-gray-500">
                          Phone: {selectedEvent.extendedProps.user.phone}
                        </p>
                      )}
                      {selectedEvent.extendedProps.user?.role && (
                        <p className="text-xs text-gray-500">
                          Role: {selectedEvent.extendedProps.user.role}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Job (for applications/jobs) */}
                {selectedEvent.extendedProps.job && (
                  <div className="flex items-start">
                    <Briefcase size={18} className="text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Job Position</p>
                      <p className="text-sm text-gray-800">
                        {selectedEvent.extendedProps.job?.title || 'Unknown Position'}
                      </p>
                      {selectedEvent.extendedProps.job?.department && (
                        <p className="text-xs text-gray-500">
                          Department: {selectedEvent.extendedProps.job.department}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Status */}
                <div className="flex items-start">
                  <div className="text-gray-400 mt-0.5 mr-3 flex-shrink-0">
                    {selectedEvent.extendedProps.status === 'pending' ? (
                      <Clock size={18} />
                    ) : selectedEvent.extendedProps.status === 'rejected' ? (
                      <X size={18} />
                    ) : (
                      <CheckCircle size={18} />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <p className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" 
                      style={{
                        backgroundColor: statusColors[selectedEvent.extendedProps.status] || statusColors.other,
                        color: '#fff'
                      }}
                    >
                      {selectedEvent.extendedProps.status?.charAt(0).toUpperCase() + selectedEvent.extendedProps.status?.slice(1) || 'Unknown'}
                    </p>
                  </div>
                </div>
                
                {/* Resume URL (for resume events) */}
                {selectedEvent.extendedProps.type === 'resume' && selectedEvent.extendedProps.resumeUrl && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Resume</h4>
                    <div className="flex items-center">
                      <a 
                        href={selectedEvent.extendedProps.resumeUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="px-3 py-1.5 bg-blue-50 text-blue-500 rounded-md text-sm font-medium hover:bg-blue-100 transition-colors flex items-center"
                      >
                        <Download size={14} className="mr-1.5" />
                        View Resume
                      </a>
                    </div>
                  </div>
                )}
                
                {/* Actions for events based on type */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Actions</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedEvent.extendedProps.type === 'resume' && (
                      <>
                        <button className="px-3 py-1.5 bg-blue-50 text-blue-500 rounded-md text-sm font-medium hover:bg-blue-100 transition-colors">
                          View User Profile
                        </button>
                        <button className="px-3 py-1.5 bg-green-50 text-green-500 rounded-md text-sm font-medium hover:bg-green-100 transition-colors">
                          Contact User
                        </button>
                      </>
                    )}
                    
                    {selectedEvent.extendedProps.type === 'interview' && (
                      <>
                        <button className="px-3 py-1.5 bg-purple-50 text-purple-500 rounded-md text-sm font-medium hover:bg-purple-100 transition-colors">
                          Reschedule
                        </button>
                        <button className="px-3 py-1.5 bg-blue-50 text-blue-500 rounded-md text-sm font-medium hover:bg-blue-100 transition-colors">
                          Send Reminder
                        </button>
                      </>
                    )}
                    
                    {selectedEvent.extendedProps.type === 'deadline' && (
                      <button className="px-3 py-1.5 bg-red-50 text-red-500 rounded-md text-sm font-medium hover:bg-red-100 transition-colors">
                        Extend Deadline
                      </button>
                    )}
                    
                    {selectedEvent.extendedProps.type === 'newJob' && (
                      <button className="px-3 py-1.5 bg-green-50 text-green-500 rounded-md text-sm font-medium hover:bg-green-100 transition-colors">
                        Edit Job
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button
                onClick={closeEventModal}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Create Event Modal */}
      {showCreateEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full">
            <div className="p-5 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold">Create New Event</h3>
                <button 
                  onClick={closeCreateEventModal}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-5">
              <div className="space-y-4">
                {/* Event Date Display */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <div className="p-3 bg-gray-50 rounded-md text-gray-800">
                    {newEventDate ? format(newEventDate, 'PPP') : 'No date selected'}
                  </div>
                </div>
                
                {/* Event Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Type
                  </label>
                  <select 
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    defaultValue="custom"
                  >
                    {Object.entries(eventTypes).map(([key, value]) => (
                      <option key={key} value={key}>{value.title}</option>
                    ))}
                  </select>
                </div>
                
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input 
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Event title"
                  />
                </div>
                
                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Event description"
                  />
                </div>
                
                {/* All Day Toggle */}
                <div className="flex items-center">
                  <input
                    id="all-day"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="all-day" className="ml-2 block text-sm text-gray-700">
                    All Day Event
                  </label>
                </div>
                
                {/* Time Range (if not all day) */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time
                    </label>
                    <input 
                      type="time"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time
                    </label>
                    <input 
                      type="time"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
              <button
                onClick={closeCreateEventModal}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleCreateEvent({
                  title: document.querySelector('input[placeholder="Event title"]').value,
                  description: document.querySelector('textarea').value,
                  allDay: document.getElementById('all-day').checked,
                  startTime: document.querySelector('input[type="time"]').value,
                  endTime: document.querySelectorAll('input[type="time"]')[1].value,
                  type: document.querySelector('select').value
                })}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Create Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarComponent; 
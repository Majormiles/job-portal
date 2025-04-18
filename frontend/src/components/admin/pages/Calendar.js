import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Layers
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { getAllApplications } from '../../../services/applicationService';
import { getJobs } from '../../../services/jobService';
import { toast } from 'react-hot-toast';

const Calendar = () => {
  const calendarRef = useRef(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [jobsMap, setJobsMap] = useState({});
  const [currentViewInfo, setCurrentViewInfo] = useState({
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date()),
    view: 'dayGridMonth'
  });
  
  // Filters for calendar events
  const [filters, setFilters] = useState({
    status: 'all',
    jobId: 'all',
    eventType: 'all' // 'applications', 'jobs', 'interviews'
  });
  
  // Modal for event details
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  
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
  
  // Event types
  const eventTypes = {
    application: {
      title: 'Application',
      color: '#36A2EB', // Blue
      icon: <Briefcase size={14} />
    },
    interview: {
      title: 'Interview',
      color: '#9966FF', // Purple
      icon: <User size={14} />
    },
    newJob: {
      title: 'New Job',
      color: '#2ECC71', // Green
      icon: <Layers size={14} />
    }
  };
  
  // Fetch jobs data
  const fetchJobs = useCallback(async () => {
    try {
      const response = await getJobs();
      if (response && response.success) {
        setJobs(response.data || []);
        
        // Create a map of job IDs to job objects for quick lookup
        const jobMap = {};
        response.data.forEach(job => {
          jobMap[job._id] = job;
        });
        setJobsMap(jobMap);
      }
    } catch (error) {
      console.error('Error fetching jobs for calendar:', error);
    }
  }, []);
  
  // Fetch applications data based on date range
  const fetchApplications = useCallback(async (startDate, endDate) => {
    setLoading(true);
    setError(null);
    
    try {
      // Format dates for API request
      const formattedStartDate = startDate.toISOString();
      const formattedEndDate = endDate.toISOString();
      
      // Prepare query parameters
      const params = {
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        limit: 500, // Get more applications for calendar view
        sort: 'createdAt'
      };
      
      // Add status filter if selected
      if (filters.status !== 'all') {
        params.status = filters.status;
      }
      
      // Add job filter if selected
      if (filters.jobId !== 'all') {
        params.jobId = filters.jobId;
      }
      
      const response = await getAllApplications(params);
      
      if (response && response.success) {
        // Process applications into calendar events
        const calendarEvents = [];
        
        response.data.forEach(application => {
          // Get job details from map or use placeholder
          const jobId = typeof application.job === 'object' ? application.job._id : application.job;
          const job = jobsMap[jobId] || { title: 'Unknown Position' };
          
          // Get applicant details
          const applicantName = typeof application.user === 'object' && application.user.name 
            ? application.user.name 
            : 'Unknown Applicant';
            
          // Determine color based on status
          const status = (application.status || 'pending').toLowerCase();
          const color = statusColors[status] || statusColors.other;
          
          // Create application event
          calendarEvents.push({
            id: application._id,
            title: `Application: ${applicantName} - ${job.title}`,
            start: application.createdAt, // Application date
            backgroundColor: color,
            borderColor: color,
            textColor: '#fff',
            extendedProps: {
              type: 'application',
              applicant: application.user,
              job: job,
              status: status,
              application: application
            }
          });
          
          // If there's an interview date, add it as a separate event
          if (application.interviewDate) {
            calendarEvents.push({
              id: `interview-${application._id}`,
              title: `Interview: ${applicantName} - ${job.title}`,
              start: application.interviewDate,
              backgroundColor: eventTypes.interview.color,
              borderColor: eventTypes.interview.color,
              textColor: '#fff',
              extendedProps: {
                type: 'interview',
                applicant: application.user,
                job: job,
                status: status,
                application: application
              }
            });
          }
        });
        
        // Filter events based on event type filter
        let filteredEvents = calendarEvents;
        
        if (filters.eventType !== 'all') {
          filteredEvents = calendarEvents.filter(event => 
            event.extendedProps.type === filters.eventType
          );
        }
        
        setEvents(filteredEvents);
      } else {
        throw new Error(response?.message || 'Failed to fetch applications');
      }
    } catch (error) {
      console.error('Error fetching calendar data:', error);
      setError(error.message || 'Failed to load calendar data');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [filters, jobsMap]);
  
  // Handle calendar date range change
  const handleDatesSet = (dateInfo) => {
    setCurrentViewInfo({
      startDate: dateInfo.start,
      endDate: dateInfo.end,
      view: dateInfo.view.type
    });
    
    // Fetch applications for the new date range
    fetchApplications(dateInfo.start, dateInfo.end);
  };
  
  // Handle event click to show details
  const handleEventClick = (clickInfo) => {
    setSelectedEvent(clickInfo.event);
    setShowEventModal(true);
  };
  
  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };
  
  // Close event modal
  const closeEventModal = () => {
    setShowEventModal(false);
    setSelectedEvent(null);
  };
  
  // Initialize - fetch jobs first, then applications
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);
  
  // Re-fetch events when filters change
  useEffect(() => {
    if (currentViewInfo.startDate && currentViewInfo.endDate) {
      fetchApplications(currentViewInfo.startDate, currentViewInfo.endDate);
    }
  }, [fetchApplications, filters, currentViewInfo]);
  
  return (
    <div className="admin-job-container">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start p-5 border-b border-gray-200">
          <div>
            <h1 className="text-xl font-bold text-gray-800 flex items-center">
              <CalendarIcon size={20} className="mr-2" />
              Activity Calendar
            </h1>
            <p className="text-gray-500 mt-1">
              Track application activities and events
            </p>
          </div>
          
          <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {/* Filter dropdown for status */}
            <div className="relative inline-block text-left w-full sm:w-auto">
              <div>
                <button 
                  className="flex justify-between items-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                  onClick={() => {}}
                >
                  <div className="flex items-center">
                    <Filter size={16} className="mr-2" />
                    <span>{filters.status === 'all' ? 'All Statuses' : filters.status.charAt(0).toUpperCase() + filters.status.slice(1)}</span>
                  </div>
                  <ChevronDown size={16} className="ml-2" />
                </button>
              </div>

              <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                  <button 
                    className={`${filters.status === 'all' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} block px-4 py-2 text-sm w-full text-left hover:bg-gray-100`}
                    onClick={() => handleFilterChange('status', 'all')}
                  >
                    All Statuses
                  </button>
                  {Object.keys(statusColors).map(status => (
                    <button 
                      key={status}
                      className={`${filters.status === status ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} block px-4 py-2 text-sm w-full text-left hover:bg-gray-100`}
                      onClick={() => handleFilterChange('status', status)}
                    >
                      <div className="flex items-center">
                        <span 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{backgroundColor: statusColors[status]}}
                        ></span>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Filter dropdown for jobs */}
            <div className="relative inline-block text-left w-full sm:w-auto">
              <div>
                <button 
                  className="flex justify-between items-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                  onClick={() => {}}
                >
                  <div className="flex items-center">
                    <Briefcase size={16} className="mr-2" />
                    <span>{filters.jobId === 'all' ? 'All Jobs' : (jobsMap[filters.jobId]?.title || 'Selected Job')}</span>
                  </div>
                  <ChevronDown size={16} className="ml-2" />
                </button>
              </div>

              <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                <div className="py-1 max-h-60 overflow-auto" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                  <button 
                    className={`${filters.jobId === 'all' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} block px-4 py-2 text-sm w-full text-left hover:bg-gray-100`}
                    onClick={() => handleFilterChange('jobId', 'all')}
                  >
                    All Jobs
                  </button>
                  {jobs.map(job => (
                    <button 
                      key={job._id}
                      className={`${filters.jobId === job._id ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 truncate`}
                      onClick={() => handleFilterChange('jobId', job._id)}
                    >
                      {job.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Filter dropdown for event types */}
            <div className="relative inline-block text-left w-full sm:w-auto">
              <div>
                <button 
                  className="flex justify-between items-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                  onClick={() => {}}
                >
                  <div className="flex items-center">
                    <Layers size={16} className="mr-2" />
                    <span>{filters.eventType === 'all' ? 'All Event Types' : (
                      filters.eventType === 'application' ? 'Applications' :
                      filters.eventType === 'interview' ? 'Interviews' : 
                      'New Jobs'
                    )}</span>
                  </div>
                  <ChevronDown size={16} className="ml-2" />
                </button>
              </div>

              <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                  <button 
                    className={`${filters.eventType === 'all' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} block px-4 py-2 text-sm w-full text-left hover:bg-gray-100`}
                    onClick={() => handleFilterChange('eventType', 'all')}
                  >
                    All Event Types
                  </button>
                  <button 
                    className={`${filters.eventType === 'application' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} block px-4 py-2 text-sm w-full text-left hover:bg-gray-100`}
                    onClick={() => handleFilterChange('eventType', 'application')}
                  >
                    <div className="flex items-center">
                      <span 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{backgroundColor: eventTypes.application.color}}
                      ></span>
                      Applications
                    </div>
                  </button>
                  <button 
                    className={`${filters.eventType === 'interview' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} block px-4 py-2 text-sm w-full text-left hover:bg-gray-100`}
                    onClick={() => handleFilterChange('eventType', 'interview')}
                  >
                    <div className="flex items-center">
                      <span 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{backgroundColor: eventTypes.interview.color}}
                      ></span>
                      Interviews
                    </div>
                  </button>
                  <button 
                    className={`${filters.eventType === 'newJob' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'} block px-4 py-2 text-sm w-full text-left hover:bg-gray-100`}
                    onClick={() => handleFilterChange('eventType', 'newJob')}
                  >
                    <div className="flex items-center">
                      <span 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{backgroundColor: eventTypes.newJob.color}}
                      ></span>
                      New Jobs
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Calendar Legend */}
        <div className="px-5 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-wrap gap-4">
            <div className="text-sm font-medium">Event Status:</div>
            
            {Object.entries(statusColors).slice(0, 6).map(([status, color]) => (
              <div key={status} className="flex items-center text-sm">
                <span 
                  className="w-3 h-3 rounded-full mr-1.5" 
                  style={{backgroundColor: color}}
                ></span>
                <span className="capitalize">{status}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Error state */}
        {error && (
          <div className="p-5 bg-red-50 border-b border-red-100">
            <div className="flex items-center text-red-700">
              <AlertCircle size={18} className="mr-2" />
              <p>{error}</p>
            </div>
            <button
              onClick={() => fetchApplications(currentViewInfo.startDate, currentViewInfo.endDate)}
              className="mt-2 inline-flex items-center px-3 py-1.5 border border-red-300 text-sm rounded-md text-red-700 bg-white hover:bg-red-50"
            >
              <RefreshCw size={14} className="mr-1.5" />
              Retry
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
          
          <div className="h-[75vh]">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
              }}
              events={events}
              eventClick={handleEventClick}
              datesSet={handleDatesSet}
              height="100%"
              eventTimeFormat={{
                hour: '2-digit',
                minute: '2-digit',
                meridiem: 'short'
              }}
              dayMaxEvents={3}
              eventDisplay="block"
              eventColor="#3788d8"
              nowIndicator={true}
            />
          </div>
        </div>
        
        {/* Stats Summary */}
        <div className="p-5 border-t border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">Total Applications</p>
              <p className="text-2xl font-semibold">{events.filter(e => e.extendedProps?.type === 'application').length}</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">Interviews Scheduled</p>
              <p className="text-2xl font-semibold">{events.filter(e => e.extendedProps?.type === 'interview').length}</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">Rejected Applications</p>
              <p className="text-2xl font-semibold">{events.filter(e => e.extendedProps?.status === 'rejected').length}</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <p className="text-sm text-gray-500">Accepted Applications</p>
              <p className="text-2xl font-semibold">{events.filter(e => ['accepted', 'hired'].includes(e.extendedProps?.status)).length}</p>
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
                    <p className="text-sm text-gray-800 capitalize">
                      {selectedEvent.extendedProps.type}
                    </p>
                  </div>
                </div>
                
                {/* Job */}
                <div className="flex items-start">
                  <Briefcase size={18} className="text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Job Position</p>
                    <p className="text-sm text-gray-800">
                      {selectedEvent.extendedProps.job?.title || 'Unknown Position'}
                    </p>
                  </div>
                </div>
                
                {/* Applicant */}
                {selectedEvent.extendedProps.applicant && (
                  <div className="flex items-start">
                    <User size={18} className="text-gray-400 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Applicant</p>
                      <p className="text-sm text-gray-800">
                        {typeof selectedEvent.extendedProps.applicant === 'object' && selectedEvent.extendedProps.applicant.name
                          ? selectedEvent.extendedProps.applicant.name 
                          : 'Unknown Applicant'}
                      </p>
                      {typeof selectedEvent.extendedProps.applicant === 'object' && selectedEvent.extendedProps.applicant.email && (
                        <p className="text-xs text-gray-500">{selectedEvent.extendedProps.applicant.email}</p>
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
                
                {/* Other Application Details */}
                {selectedEvent.extendedProps.application && selectedEvent.extendedProps.application.notes && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Notes</h4>
                    <p className="text-sm text-gray-800 whitespace-pre-line">
                      {selectedEvent.extendedProps.application.notes}
                    </p>
                  </div>
                )}
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
    </div>

    
  );
};

export default Calendar; 
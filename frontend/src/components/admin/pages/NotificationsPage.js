import React, { useState, useEffect, useRef } from 'react';
import { X, Bell, CheckCircle, AlertTriangle, Info, AlertCircle, Trash2, RefreshCw } from 'lucide-react';
import axios from 'axios';
import adminApi from '../../../utils/adminApi';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, unread: 0, read: 0 });
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [highlightedId, setHighlightedId] = useState(null);
  const highlightedRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Extract highlight ID from URL query
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const highlightId = searchParams.get('highlight');
    
    if (highlightId) {
      setHighlightedId(highlightId);
    }
  }, [location.search]);

  // Scroll to highlighted notification
  useEffect(() => {
    if (highlightedId && highlightedRef.current) {
      // Allow a small delay for rendering
      setTimeout(() => {
        highlightedRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'center'
        });
        
        // Add a visual flash effect
        highlightedRef.current.classList.add('bg-yellow-100');
        setTimeout(() => {
          if (highlightedRef.current) {
            highlightedRef.current.classList.remove('bg-yellow-100');
            highlightedRef.current.classList.add('bg-yellow-50');
            
            // Remove highlight parameter from URL after highlighting
            // But keep other parameters intact
            const searchParams = new URLSearchParams(location.search);
            searchParams.delete('highlight');
            navigate({ 
              pathname: location.pathname,
              search: searchParams.toString() 
            }, { replace: true });
          }
        }, 1500);
      }, 100);
    }
  }, [highlightedId, notifications, loading, navigate, location]);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const readFilter = filter === 'read' ? 'true' : filter === 'unread' ? 'false' : '';
        
        const token = localStorage.getItem('adminToken');
        if (!token) {
          toast.error('Authentication error. Please login again.');
          return;
        }

        const response = await adminApi.get(
          `/admin/notifications?page=${currentPage}&limit=20${readFilter ? `&read=${readFilter}` : ''}`
        );

        if (response.data && response.data.success) {
          setNotifications(response.data.data);
          setTotalPages(response.data.pagination.pages);
          
          // Get notification stats
          const statsResponse = await adminApi.get('/admin/notifications/stats');
          
          if (statsResponse.data && statsResponse.data.success) {
            setStats(statsResponse.data.data);
          }
        } else {
          toast.error('Failed to fetch notifications');
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
        toast.error('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [currentPage, filter, refreshKey]);

  // Mark notification as read
  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return;

      await adminApi.put(`/admin/notifications/${id}/read`, {});

      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === id ? { ...notif, read: true } : notif
        )
      );
      
      // Update stats
      setStats(prev => ({
        ...prev,
        unread: Math.max(0, prev.unread - 1),
        read: prev.read + 1
      }));
      
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to update notification');
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return;

      await adminApi.put('/admin/notifications/read-all', {});

      // Update local state
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
      
      // Update stats
      setStats(prev => ({
        ...prev,
        unread: 0,
        read: prev.total
      }));
      
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to update notifications');
    }
  };

  // Delete notification
  const deleteNotification = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return;

      await adminApi.delete(`/admin/notifications/${id}`);

      // Update local state
      const removed = notifications.find(n => n._id === id);
      setNotifications(prev => prev.filter(n => n._id !== id));
      
      // Update stats
      setStats(prev => ({
        ...prev,
        total: prev.total - 1,
        unread: removed && !removed.read ? prev.unread - 1 : prev.unread,
        read: removed && removed.read ? prev.read - 1 : prev.read
      }));
      
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  // Delete all notifications
  const deleteAllNotifications = async () => {
    if (!window.confirm('Are you sure you want to delete all notifications?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return;

      await adminApi.delete('/admin/notifications');

      // Update local state
      setNotifications([]);
      
      // Update stats
      setStats({
        total: 0,
        unread: 0,
        read: 0
      });
      
      toast.success('All notifications deleted');
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      toast.error('Failed to delete notifications');
    }
  };

  // Format notification time
  const formatTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return format(date, 'MMM d, yyyy h:mm a');
    } catch (error) {
      return 'Unknown date';
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} className="text-green-500" />;
      case 'warning':
        return <AlertTriangle size={20} className="text-yellow-500" />;
      case 'error':
        return <AlertCircle size={20} className="text-red-500" />;
      case 'info':
      default:
        return <Info size={20} className="text-blue-500" />;
    }
  };

  // Refresh notifications
  const refreshNotifications = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="section-body">
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header Section with improved responsiveness */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={refreshNotifications}
            className="flex items-center px-3 py-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <RefreshCw size={16} className="mr-2" />
            Refresh
          </button>
          {stats.unread > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center px-3 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
            >
              <CheckCircle size={16} className="mr-2" />
              Mark All as Read
            </button>
          )}
          {stats.total > 0 && (
            <button
              onClick={deleteAllNotifications}
              className="flex items-center px-3 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
            >
              <Trash2 size={16} className="mr-2" />
              Delete All
            </button>
          )}
        </div>
      </div>

      {/* Stats & Filters with improved layout */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
            <div className="text-center px-3 py-2 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-xl font-semibold">{stats.total}</p>
            </div>
            <div className="text-center px-3 py-2 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-600">Unread</p>
              <p className="text-xl font-semibold text-blue-600">{stats.unread}</p>
            </div>
            <div className="text-center px-3 py-2 bg-green-50 rounded-md">
              <p className="text-sm text-green-600">Read</p>
              <p className="text-xl font-semibold text-green-600">{stats.read}</p>
            </div>
          </div>
          
          <div className="flex items-center self-start md:self-center">
            <span className="text-sm text-gray-600 mr-2">Filter:</span>
            <div className="flex p-1 bg-gray-100 rounded-md">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  filter === 'all' ? 'bg-white shadow-sm' : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  filter === 'unread' ? 'bg-white shadow-sm' : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                Unread
              </button>
              <button
                onClick={() => setFilter('read')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  filter === 'read' ? 'bg-white shadow-sm' : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                Read
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications List with improved spacing */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full mb-4"></div>
            <p className="text-gray-600">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-10 text-center">
            <Bell size={40} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No notifications found</p>
            <p className="text-sm text-gray-500 mt-1">
              {filter !== 'all' ? `Try changing the filter or` : ''} check back later
            </p>
          </div>
        ) : (
          <>
            <ul className="divide-y divide-gray-100">
              {notifications.map((notification) => {
                const isHighlighted = notification._id === highlightedId || notification.id === highlightedId;
                return (
                  <li 
                    key={notification._id} 
                    ref={isHighlighted ? highlightedRef : null}
                    className={`relative hover:bg-gray-50 transition-colors ${
                      !notification.read ? 'bg-blue-50' : ''
                    } ${isHighlighted ? 'ring-2 ring-blue-400 ring-opacity-50' : ''}`}
                  >
                    <div className="p-4 sm:px-6">
                      <div className="flex items-start pr-10">
                        <div className="flex-shrink-0 mt-1 mr-3">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <p className={`text-sm font-medium mb-1 sm:mb-0 ${!notification.read ? 'text-gray-900' : 'text-gray-800'}`}>
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 sm:ml-2 sm:flex-shrink-0">
                              {formatTime(notification.createdAt)}
                            </p>
                          </div>
                        
                          {notification.data && Object.keys(notification.data).length > 0 && (
                            <div className="mt-1 text-xs text-gray-500">
                              {notification.data.type === 'user_registration' && (
                                <div className="flex flex-wrap items-center gap-1">
                                  <span className="font-medium">{notification.data.userName}</span>
                                  <span>({notification.data.userEmail})</span>
                                  <span className="mx-1">•</span>
                                  <span className="capitalize">{notification.data.userType}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    
                      <div className="absolute top-4 right-4 flex space-x-1">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification._id)}
                            className="text-blue-600 hover:text-blue-800 p-1.5 hover:bg-blue-50 rounded-full transition-colors"
                            title="Mark as read"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification._id)}
                          className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-full transition-colors"
                          title="Delete"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* Pagination with improved mobile layout */}
            {totalPages > 1 && (
              <div className="px-4 sm:px-6 py-4 flex items-center justify-between border-t border-gray-200">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      currentPage === 1
                        ? 'text-gray-300 bg-gray-50 cursor-not-allowed'
                        : 'text-gray-700 bg-white hover:bg-gray-50'
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium rounded-md transition-colors ${
                      currentPage === totalPages
                        ? 'text-gray-300 bg-gray-50 cursor-not-allowed'
                        : 'text-gray-700 bg-white hover:bg-gray-50'
                    }`}
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing page <span className="font-medium">{currentPage}</span> of{' '}
                      <span className="font-medium">{totalPages}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium transition-colors ${
                          currentPage === 1
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">Previous</span>
                        &larr;
                      </button>
                      
                      {/* Simplified page numbers */}
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        // For simplicity, show max 5 pages with current in middle when possible
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors ${
                              currentPage === pageNum
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium transition-colors ${
                          currentPage === totalPages
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">Next</span>
                        &rarr;
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
    </div>
  );
};

export default NotificationsPage; 
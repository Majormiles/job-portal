import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bell, Settings, User, Search, LogOut, Menu, X } from 'lucide-react';
import axios from 'axios';
import adminApi from '../../../../utils/adminApi'; // Import adminApi for admin routes

// Sound notification import
import notificationSound from '../../../../assets/sound/software-interface-back.wav';

function Navbar({ toggleSidebar, isSidebarOpen }) {
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const audioRef = useRef(new Audio(notificationSound));
  const reconnectTimeoutRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // WebSocket connection setup
  useEffect(() => {
    const connectWebSocket = () => {
      // Get admin token from local storage
      const token = localStorage.getItem('adminToken');
      if (!token) return;

      // Determine WebSocket URL (ws:// or wss:// based on protocol)
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = process.env.REACT_APP_WS_HOST || window.location.hostname;
      const port = process.env.REACT_APP_WS_PORT || '5000';
      const wsUrl = `${protocol}//${host}:${port}`;

      // Create new WebSocket connection
      const newSocket = new WebSocket(wsUrl);
      
      newSocket.onopen = () => {
        console.log('Admin WebSocket connection established');
        setIsConnected(true);
        
        // Authenticate with the server
        try {
          newSocket.send(JSON.stringify({
            type: 'auth',
            userId: `admin-${adminUser?._id || 'unknown'}`,
            token: token
          }));
        } catch (error) {
          console.error('Failed to send authentication message:', error);
        }
      };
      
      newSocket.onclose = () => {
        console.log('Admin WebSocket connection closed');
        setIsConnected(false);
        
        // Schedule reconnection attempt
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, 5000); // Try to reconnect after 5 seconds
      };
      
      newSocket.onerror = (error) => {
        console.error('Admin WebSocket error:', error);
      };
      
      newSocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      };
      
      setSocket(newSocket);
    };
    
    // Clean up function
    const cleanupWebSocket = () => {
      if (socket) {
        socket.close();
      }
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
    
    // Connect WebSocket if we have an admin user
    if (adminUser) {
      connectWebSocket();
    }
    
    // Clean up when component unmounts
    return () => {
      cleanupWebSocket();
    };
  }, [adminUser]);

  // Handle incoming WebSocket messages
  const handleWebSocketMessage = (data) => {
    if (!data || !data.type) return;
    
    switch (data.type) {
      case 'notification':
        // Handle new notification
        handleNotification(data);
        break;
      case 'auth_success':
        console.log('Admin WebSocket authentication successful');
        break;
      case 'auth_error':
        console.error('Admin WebSocket authentication failed:', data.message);
        break;
      case 'ping':
        // Keep connection alive, no action needed
        break;
      default:
        console.log('Unknown WebSocket message type:', data.type);
    }
  };

  // Handle new notification
  const handleNotification = (notification) => {
    // Add notification to state
    const newNotification = {
      id: notification.id || `notification-${Date.now()}`,
      title: notification.message || 'New notification',
      time: formatNotificationTime(notification.timestamp || new Date().toISOString()),
      read: false,
      data: notification.data || {}
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
    
    // Play sound notification
    playNotificationSound();
  };
  
  // Format notification time
  const formatNotificationTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    
    const diffHours = Math.round(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    const diffDays = Math.round(diffHours / 24);
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };
  
  // Play notification sound with user interaction handling
  const playNotificationSound = () => {
    // Check if audio context is already created
    if (!window.AudioContext) {
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
    }
    
    // Only play sound if user has interacted with the page
    if (document.hasFocus()) {
      try {
        // Try playing the sound
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error('Audio playback failed:', error);
            // If autoplay policy blocks playback, we'll need user interaction
            // The notification bell will still show the unread count
          });
        }
      } catch (error) {
        console.error('Error playing notification sound:', error);
      }
    }
  };

  // Mark notification as read
  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => {
        // Handle both id and _id formats
        const matchesId = notif.id === notificationId || notif._id === notificationId;
        return matchesId ? { ...notif, read: true } : notif;
      })
    );
    
    // Update unread count
    setUnreadCount(prev => Math.max(0, prev - 1));
    
    // Send read status to server if connected
    if (socket && isConnected) {
      try {
        socket.send(JSON.stringify({
          type: 'mark_read',
          notificationId
        }));
      } catch (error) {
        console.error('Error sending read status:', error);
      }
    }
  };

  // Admin user data loading
  useEffect(() => {
    // Load admin user data from localStorage
    const storedAdminUser = localStorage.getItem('adminUser');
    if (storedAdminUser) {
      try {
        setAdminUser(JSON.parse(storedAdminUser));
      } catch (error) {
        console.error('Error parsing admin user data:', error);
      }
    } else {
      // Try to fetch admin user data from API if not in localStorage
      const fetchAdminUser = async () => {
        try {
          const token = localStorage.getItem('adminToken');
          if (token) {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/admin/profile`, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });
            if (response.data && response.data.success) {
              setAdminUser(response.data.data);
              localStorage.setItem('adminUser', JSON.stringify(response.data.data));
            }
          }
        } catch (error) {
          console.error('Error fetching admin user data:', error);
        }
      };
      fetchAdminUser();
    }
  }, []);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) return;
        
        // Use adminApi instead of direct axios
        const response = await adminApi.get('/admin/notifications');
        
        if (response.data && response.data.success) {
          // Ensure each notification has a unique id property for React key
          const notificationsWithKeys = (response.data.data || []).map(notification => ({
            ...notification,
            id: notification._id || notification.id || `notification-${Date.now()}-${Math.random()}`
          }));
          
          setNotifications(notificationsWithKeys);
          setUnreadCount(response.data.unreadCount || 0);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };
    
    if (adminUser) {
      fetchNotifications();
    }
  }, [adminUser]);

  const handleLogout = async () => {
    try {
      // Clean up WebSocket connection
      if (socket) {
        socket.close();
      }
      
      // Clear admin tokens and data
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      
      // Try to call logout endpoint (optional)
      try {
        await axios.post(`${process.env.REACT_APP_API_URL}/auth/logout`);
      } catch (error) {
        console.log('Logout API call failed, but proceeding with client-side logout');
      }
      
      // Redirect to admin login
      navigate('/admin/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm px-4 py-3 flex items-center justify-between sticky top-0 z-20">
      {/* Left side - Menu toggle and title */}
      <div className="flex items-center">
        <button 
          onClick={toggleSidebar}
          className="p-2 mr-3 rounded-md hover:bg-gray-100 focus:outline-none transition-colors duration-200"
          aria-label={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
        >
          {isSidebarOpen ? <X size={20} className="text-gray-500" /> : <Menu size={20} className="text-gray-500" />}
        </button>
        
        <div className="font-semibold text-lg text-blue-600">
          Admin Dashboard
        </div>
      </div>
      
      {/* Center - Search bar (appears on larger screens) */}
      <div className="hidden md:flex flex-1 max-w-md mx-4">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
          <input
            type="search"
            className="block w-full py-1.5 pl-10 pr-3 text-sm bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search..."
          />
        </div>
      </div>
      
      {/* Right side - Notifications and User Profile */}
      <div className="flex items-center space-x-3">
        {/* Notification bell */}
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => {
              setShowNotifications(!showNotifications);
              // When opening notifications, initialize audio context if needed
              if (!showNotifications) {
                // Try to play a silent sound to initialize audio context after user interaction
                const silentPlay = () => {
                  audioRef.current.volume = 0.01;
                  audioRef.current.play()
                    .then(() => {
                      // Reset volume after playing
                      audioRef.current.pause();
                      audioRef.current.currentTime = 0;
                      audioRef.current.volume = 1.0;
                    })
                    .catch(e => console.log('Silent audio init failed, will try on next notification:', e));
                };
                silentPlay();
              }
            }}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors duration-200 relative"
            aria-label="Notifications"
          >
            <Bell size={18} className="text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 inline-block w-4 h-4 bg-red-500 border-2 border-white rounded-full text-xs text-white flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>
          
          {/* Notification dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-30 border border-gray-200 transition-all duration-200 transform origin-top">
              <div className="px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-sm font-medium text-gray-700">Notifications</h3>
                {unreadCount > 0 && (
                  <button 
                    key="mark-all-read-button"
                    onClick={() => {
                      // Mark all as read
                      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                      setUnreadCount(0);
                      
                      // Send to server if connected
                      if (socket && isConnected) {
                        try {
                          socket.send(JSON.stringify({ type: 'mark_all_read' }));
                        } catch (error) {
                          console.error('Error marking all as read:', error);
                        }
                      }
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="max-h-60 overflow-y-auto scrollbar-extra-light">
                {notifications.length > 0 ? (
                  notifications.map(notification => (
                    <button 
                      key={notification.id || notification._id || `notification-${Math.random()}`}
                      onClick={() => {
                        // Mark as read
                        if (!notification.read) {
                          markNotificationAsRead(notification.id || notification._id);
                        }
                        
                        // Handle notification-specific actions based on type
                        const notificationType = notification.data?.type;
                        const notificationId = notification.id || notification._id;
                        
                        // Close dropdown
                        setShowNotifications(false);
                        
                        // Navigate based on notification type
                        switch(notificationType) {
                          case 'user_registration':
                            // Navigate to user details page if available
                            if (notification.data?.userId) {
                              navigate(`/admin/users/${notification.data.userId}`);
                            } else {
                              navigate('/admin/users');
                            }
                            break;
                          
                          case 'job_application':
                            // Navigate to application details
                            if (notification.data?.applicationId) {
                              navigate(`/admin/applications/${notification.data.applicationId}`);
                            } else {
                              navigate('/admin/applications');
                            }
                            break;
                            
                          case 'new_job':
                            // Navigate to job details
                            if (notification.data?.jobId) {
                              navigate(`/admin/jobs/${notification.data.jobId}`);
                            } else {
                              navigate('/admin/jobs');
                            }
                            break;
                            
                          default:
                            // For any other notification type or if type is missing,
                            // navigate to notification details or notification list
                            if (notificationId) {
                              navigate(`/admin/notifications?highlight=${notificationId}`);
                            } else {
                              navigate('/admin/notifications');
                            }
                            break;
                        }
                      }}
                      className={`block w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-0 ${
                        !notification.read ? 'bg-blue-50' : ''
                      }`}
                    >
                      <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-800'}`}>
                        {notification.title}
                      </p>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-xs text-gray-500">{notification.time}</p>
                        {!notification.read && (
                          <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-6 text-center text-gray-500">
                    <p>No new notifications</p>
                  </div>
                )}
              </div>
              <div className="px-4 py-2 border-t border-gray-200">
                <Link 
                  to="/admin/notifications" 
                  key="view-all-notifications-link"
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  View all notifications
                </Link>
              </div>
            </div>
          )}
        </div>
        
        {/* User profile */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center space-x-2 p-1 rounded-md hover:bg-gray-100 transition-colors duration-200"
            aria-label="User Menu"
          >
            <div className="hidden md:block text-right mr-2">
              <div className="text-sm font-medium text-gray-700">
                {adminUser?.name || 'Admin User'}
              </div>
              <div className="text-xs text-gray-500">
                {adminUser?.role || 'Administrator'}
              </div>
            </div>
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-sm overflow-hidden">
              {adminUser?.profilePicture ? (
                <img
                  alt={adminUser?.name || 'Admin Profile'}
                  src={adminUser.profilePicture}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null; 
                    e.target.style.display = 'none';
                    e.target.parentNode.innerHTML = adminUser?.name?.charAt(0) || 'A';
                  }}
                />
              ) : (
                <span className="text-sm font-medium">{adminUser?.name?.charAt(0) || 'A'}</span>
              )}
            </div>
          </button>
          
          {/* User dropdown menu */}
          {showDropdown && (
            <div 
              className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-30 border border-gray-200 transition-all duration-200 transform origin-top"
            >
              {/* Profile header in dropdown */}
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-sm overflow-hidden mr-3">
                    {adminUser?.profilePicture ? (
                      <img
                        alt={adminUser?.name || 'Admin Profile'}
                        src={adminUser.profilePicture}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null; 
                          e.target.style.display = 'none';
                          e.target.parentNode.innerHTML = adminUser?.name?.charAt(0) || 'A';
                        }}
                      />
                    ) : (
                      <span className="text-sm font-medium">{adminUser?.name?.charAt(0) || 'A'}</span>
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{adminUser?.name || 'Admin User'}</div>
                    <div className="text-xs text-gray-500">{adminUser?.email || 'admin@example.com'}</div>
                  </div>
                </div>
              </div>

              <Link 
                to="/admin/profile" 
                key="profile-link"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setShowDropdown(false)}
              >
                <User size={16} className="mr-2 text-gray-500" />
                Profile
              </Link>
        
              <div className="border-t border-gray-100 my-1"></div>
              <button 
                key="logout-button"
                onClick={handleLogout}
                className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut size={16} className="mr-2" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
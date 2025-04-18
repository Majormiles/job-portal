import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { format, formatDistanceToNow } from 'date-fns';

// SVG Icons
const BellIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

const XMarkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const NotificationBell = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    isConnected
  } = useNotifications();
  
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Toggle dropdown
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  
  // Handle notification click
  const handleNotificationClick = (notification) => {
    // Mark as read
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    // Handle navigation based on notification type
    switch (notification.data.type) {
      case 'job':
        window.location.href = `/jobs/${notification.data.jobId}`;
        break;
      case 'application':
        window.location.href = `/applications/${notification.data.applicationId}`;
        break;
      case 'message':
        window.location.href = `/messages/${notification.data.messageId}`;
        break;
      default:
        // Just close dropdown for other types
        setIsOpen(false);
    }
  };
  
  // Format timestamp
  const formatTimestamp = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return {
        relative: formatDistanceToNow(date, { addSuffix: true }),
        exact: format(date, 'MMM d, yyyy h:mm a')
      };
    } catch (error) {
      return {
        relative: 'some time ago',
        exact: 'unknown time'
      };
    }
  };
  
  // Get icon based on notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <span className="text-green-500">✓</span>;
      case 'error':
        return <span className="text-red-500">✗</span>;
      case 'warning':
        return <span className="text-yellow-500">⚠</span>;
      default:
        return <span className="text-blue-500">ℹ</span>;
    }
  };
  
  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Bell button */}
      <button
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
        onClick={toggleDropdown}
        aria-label="Notifications"
      >
        <BellIcon />
        
        {/* Connection indicator */}
        <span 
          className={`absolute top-1 right-1 block h-2 w-2 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-gray-400'
          }`} 
          title={isConnected ? 'Connected' : 'Disconnected'}
        />
        
        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      
      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="p-2">
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-lg font-medium">Notifications</h3>
              <div className="flex space-x-2">
                {unreadCount > 0 && (
                  <button
                    className="rounded p-1 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={markAllAsRead}
                    title="Mark all as read"
                  >
                    <CheckIcon />
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    className="rounded p-1 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={clearAllNotifications}
                    title="Clear all notifications"
                  >
                    <TrashIcon />
                  </button>
                )}
                <button
                  className="rounded p-1 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsOpen(false)}
                  title="Close"
                >
                  <XMarkIcon />
                </button>
              </div>
            </div>
            
            {/* Notification list */}
            <div className="max-h-96 overflow-y-auto py-2">
              {notifications.length === 0 ? (
                <div className="py-4 text-center text-gray-500">
                  No notifications
                </div>
              ) : (
                <ul className="space-y-1">
                  {notifications.map((notification) => {
                    const time = formatTimestamp(notification.timestamp);
                    return (
                      <li
                        key={notification.id}
                        className={`relative flex cursor-pointer rounded-md px-3 py-2 transition-colors ${
                          notification.read ? 'bg-white' : 'bg-blue-50'
                        } hover:bg-gray-100`}
                      >
                        <div 
                          className="flex-grow"
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-start">
                            <div className="mr-2 mt-0.5">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500" title={time.exact}>
                                {time.relative}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="ml-2 flex items-center">
                          {!notification.read && (
                            <button
                              className="rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-500"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              title="Mark as read"
                            >
                              <CheckIcon />
                            </button>
                          )}
                          <button
                            className="rounded-full p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            title="Delete"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell; 
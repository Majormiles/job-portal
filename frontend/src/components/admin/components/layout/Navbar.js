import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bell, Settings, User, Search, LogOut, Menu, X } from 'lucide-react';
import axios from 'axios';

function Navbar({ toggleSidebar, isSidebarOpen }) {
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

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

  const handleLogout = async () => {
    try {
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

  // Mock notifications for display
  const notifications = [
    { id: 1, title: "New user registered", time: "5 min ago" },
    { id: 2, title: "Server load at 85%", time: "1 hour ago" },
    { id: 3, title: "New order #12345", time: "3 hours ago" },
  ];

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
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors duration-200 relative"
            aria-label="Notifications"
          >
            <Bell size={18} className="text-gray-600" />
            {notifications.length > 0 && (
              <span className="absolute top-0 right-0 inline-block w-4 h-4 bg-red-500 border-2 border-white rounded-full text-xs text-white flex items-center justify-center">
                {notifications.length}
              </span>
            )}
          </button>
          
          {/* Notification dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-30 border border-gray-200 transition-all duration-200 transform origin-top">
              <div className="px-4 py-2 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-700">Notifications</h3>
              </div>
              <div className="max-h-60 overflow-y-auto scrollbar-extra-light">
                {notifications.length > 0 ? (
                  notifications.map(notification => (
                    <a 
                      key={notification.id}
                      href="#" 
                      className="block px-4 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                    >
                      <p className="text-sm font-medium text-gray-800">{notification.title}</p>
                      <p className="text-xs text-gray-500">{notification.time}</p>
                    </a>
                  ))
                ) : (
                  <div className="px-4 py-6 text-center text-gray-500">
                    <p>No new notifications</p>
                  </div>
                )}
              </div>
              <div className="px-4 py-2 border-t border-gray-200">
                <Link to="/admin/notifications" className="text-xs text-blue-600 hover:text-blue-800 font-medium">
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
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setShowDropdown(false)}
              >
                <User size={16} className="mr-2 text-gray-500" />
                Profile
              </Link>
        
              <div className="border-t border-gray-100 my-1"></div>
              <button 
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
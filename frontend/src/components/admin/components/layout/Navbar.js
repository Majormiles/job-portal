import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bell, Settings, User, Search, LogOut, Menu } from 'lucide-react';
import axios from 'axios';

function Navbar({ toggleSidebar }) {
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    // Load admin user data from localStorage
    const storedAdminUser = localStorage.getItem('adminUser');
    if (storedAdminUser) {
      try {
        setAdminUser(JSON.parse(storedAdminUser));
      } catch (error) {
        console.error('Error parsing admin user data:', error);
      }
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

  return (
    <nav className="navbar navbar-expand-lg main-navbar">
      <div className="form-inline mr-auto">
        <ul className="navbar-nav">
          <li>
            <button 
              className="nav-link sidebar-toggle"
              onClick={toggleSidebar}
            >
              <Menu size={20} />
            </button>
          </li>
        </ul>
        <div className="search-element ml-3 d-none d-md-block">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="search"
              className="block w-full py-2 pl-10 pr-3 text-sm bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="Search..."
            />
          </div>
        </div>
      </div>
      <ul className="navbar-nav navbar-right ml-auto">
        <li className="dropdown dropdown-list-toggle">
          <a href="#" data-toggle="dropdown" className="nav-link notification-toggle nav-link-lg">
            <Bell size={20} />
            <span className="badge badge-danger badge-counter">3</span>
          </a>
        </li>
        <li className="dropdown">
          <a
            href="#"
            onClick={() => setShowDropdown(!showDropdown)}
            className="nav-link dropdown-toggle nav-link-lg nav-link-user"
          >
            <div className="d-sm-none d-lg-inline-block text-primary">
              Hi, {adminUser?.name || 'Admin'}
            </div>
            <span className="rounded-circle user-img ml-2">
              {adminUser?.profilePicture ? (
                <img
                  alt="Profile Image"
                  src={adminUser.profilePicture}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-teal-500 flex items-center justify-center text-white">
                  {adminUser?.name?.charAt(0) || 'A'}
                </div>
              )}
            </span>
          </a>
          {showDropdown && (
            <div className="dropdown-menu dropdown-menu-right" onClick={() => setShowDropdown(false)}>
              <Link to="/admin/profile" className="dropdown-item has-icon">
                <User size={16} className="mr-2" />
                Profile
              </Link>
              <Link to="/admin/settings" className="dropdown-item has-icon">
                <Settings size={16} className="mr-2" />
                Settings
              </Link>
              <div className="dropdown-divider"></div>
              <button onClick={handleLogout} className="dropdown-item has-icon text-danger">
                <LogOut size={16} className="mr-2" />
                Logout
              </button>
            </div>
          )}
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;
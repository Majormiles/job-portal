import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import '../../styles/admin.css';

function MainLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminAuth = () => {
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        console.log('No admin token found, redirecting to admin login');
        navigate('/admin/login');
        return false;
      }
      return true;
    };

    // Define handleResize outside initializeLayout so it can be referenced in cleanup
    const handleResize = () => {
      const shouldShowSidebar = window.innerWidth > 991.98;
      setIsSidebarOpen(shouldShowSidebar);
      document.body.classList.toggle('sidebar-collapsed', !shouldShowSidebar);
    };

    const initializeLayout = () => {
      // Check admin authentication first
      if (!checkAdminAuth()) return;

      // Initialize Feather Icons
      if (window.feather) {
        window.feather.replace();
      }

      // Set initial sidebar state based on screen size
      window.addEventListener('resize', handleResize);
      handleResize(); // Initial check

      // Initialize jQuery plugins if jQuery is available
      if (window.jQuery) {
        window.jQuery(document).ready(function() {
          if (window.jQuery.fn.tooltip) {
            window.jQuery('[data-toggle="tooltip"]').tooltip();
          }
          if (window.jQuery.fn.popover) {
            window.jQuery('[data-toggle="popover"]').popover();
          }
          if (window.jQuery.fn.dropdown) {
            window.jQuery('.dropdown-toggle').dropdown();
          }
        });
      }

      // Initialize PerfectScrollbar if available
      if (window.PerfectScrollbar) {
        const scrollables = document.querySelectorAll('.scroll-container');
        scrollables.forEach(scrollable => {
          new window.PerfectScrollbar(scrollable);
        });
      }

      // Set loading to false after initialization
      setIsLoading(false);
    };

    initializeLayout();

    // Setup interval to periodically check admin authentication
    const authCheckInterval = setInterval(checkAdminAuth, 60000); // Check every minute

    return () => {
      clearInterval(authCheckInterval);
      window.removeEventListener('resize', handleResize);
    };
  }, [navigate]);

  const toggleSidebar = () => {
    const newState = !isSidebarOpen;
    setIsSidebarOpen(newState);
    document.body.classList.toggle('sidebar-collapsed', !newState);
  };

  // Close sidebar on mobile when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (window.innerWidth <= 991.98 && isSidebarOpen) {
        const sidebar = document.querySelector('.main-sidebar');
        const navbar = document.querySelector('.navbar');
        if (sidebar && !sidebar.contains(event.target) && !navbar.contains(event.target)) {
          setIsSidebarOpen(false);
          document.body.classList.add('sidebar-collapsed');
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSidebarOpen]);

  if (isLoading) {
    return (
      <div className="loader-wrapper">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`main-wrapper ${!isSidebarOpen ? 'sidebar-collapsed' : ''}`}>
      <div className="navbar-bg"></div>
      <Navbar toggleSidebar={toggleSidebar} />
      <div className={`main-sidebar ${isSidebarOpen ? 'show' : ''}`}>
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      </div>
      {isSidebarOpen && window.innerWidth <= 991.98 && (
        <div className="sidebar-overlay" onClick={toggleSidebar} />
      )}
      <div className="main-content">
        <section className="section">
          <Outlet />
        </section>
      </div>
    </div>
  );
}

export default MainLayout; 
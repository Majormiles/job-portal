import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import '../../css/scrollbar.css';
import '../../styles/admin.css';

function MainLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
      const isLargeScreen = window.innerWidth >= 1024; // lg breakpoint
      setIsSidebarOpen(isLargeScreen);
    };

    const initializeLayout = () => {
      // Check admin authentication first
      if (!checkAdminAuth()) return;

      // Set initial sidebar state based on screen size
      window.addEventListener('resize', handleResize);
      handleResize(); // Initial check

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
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {/* Main Content */}
      <div className="flex flex-col flex-1 w-full transition-all duration-300 ease-in-out lg:pl-0">
        {/* Top Navbar */}
        <Navbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        
        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto scrollbar-thin">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout; 
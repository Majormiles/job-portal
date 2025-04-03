import React, { useState, useEffect } from 'react';
import JobAlerts from '../components/ui/JobAlerts';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import Sidebar from '../components/ui/Sidebar';

const JobalertPage = () => {
  console.log('JobalertPage component rendering');
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [error, setError] = useState(null);
  
  // Handle window resize
  useEffect(() => {
    console.log('Setting up resize handler');
    try {
      const handleResize = () => {
        console.log('Window resized');
        setSidebarOpen(window.innerWidth > 768);
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    } catch (err) {
      console.error('Error in resize handler:', err);
      setError(err.message);
    }
  }, []);
  
  const toggleSidebar = () => {
    console.log('Toggling sidebar');
    try {
      setSidebarOpen(!sidebarOpen);
    } catch (err) {
      console.error('Error toggling sidebar:', err);
      setError(err.message);
    }
  };

  // Log component state
  useEffect(() => {
    console.log('Current state:', {
      sidebarOpen,
      error,
      windowWidth: window.innerWidth
    });
  }, [sidebarOpen, error]);

  if (error) {
    console.error('Error in JobalertPage:', error);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Page</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }
  
  try {
    console.log('Rendering main component structure');
    return (
      <div className="page-container">
        {/* <Header />
        <div className="hero"></div> */}

        <div className="dashboard-layout">
          <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
          <main className={`dashboard-content ${!sidebarOpen ? 'sidebar-closed' : ''}`}>
            <JobAlerts />
          </main>
        </div>
        
        {/* <Footer /> */}
      </div>
    );
  } catch (err) {
    console.error('Error rendering main component:', err);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error Rendering Page</h2>
          <p className="text-gray-600">{err.message}</p>
        </div>
      </div>
    );
  }
};

export default JobalertPage;
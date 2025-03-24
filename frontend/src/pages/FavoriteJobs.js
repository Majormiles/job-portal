// src/pages/JobAppliedPage.js
import React, { useState, useEffect } from 'react';
import FavoriteJobs from '../components/ui/FavoriteJobs';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import Sidebar from '../components/ui/Sidebar';
import '../components/css/AppliedJobs.css';

const FavoriteJobsPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth > 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  return (
    <div className="page-container">
      <Header />
      <div className="hero"></div>
      
      <div className="dashboard-layout">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <main className={`dashboard-content ${!sidebarOpen ? 'sidebar-closed' : ''}`}>
          <FavoriteJobs />
        </main>
      </div>
      
      {/* <Footer /> */}
    </div>
  );
};

export default FavoriteJobsPage;
// src/pages/JobAppliedPage.js
import React, { useState, useEffect } from 'react';
import JobsApplied from '../components/ui/AppliedJobs';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import Sidebar from '../components/ui/Sidebar';
import '../components/css/AppliedJobs.css';

const JobAppliedPage = () => {
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
          <JobsApplied />
        </main>
      </div>
      
      {/* <Footer /> */}
    </div>
  );
};

export default JobAppliedPage;
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import DashboardEmployee from '../components/ui/DashboardEmployee';
import DashboardEmployer from '../components/ui/DashboardEmployer';
import DashboardJobSeeker from '../components/ui/DashboardJobSeeker';
import DashboardTrainer from '../components/ui/DashboardTrainer';
import DashboardTrainee from '../components/ui/DashboardTrainee';
import Header from '../components/ui/Dashboardheader';
import Footer from '../components/ui/Footer';
import Sidebar from '../components/ui/Sidebar';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const location = useLocation();
  
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
  
  // Determine which dashboard to render based on the current path
  const renderDashboard = () => {
    const path = location.pathname;
    
    if (path === '/dashboard-employer') {
      return <DashboardEmployer />;
    } else if (path === '/dashboard-jobseeker') {
      return <DashboardJobSeeker />;
    } else if (path === '/dashboard-trainer') {
      return <DashboardTrainer />;
    } else if (path === '/dashboard-trainee') {
      return <DashboardTrainee />;
    } else {
      // Default or fallback dashboard
      return <DashboardEmployee />;
    }
  };
  
  return (
    <div className="page-container">
      <Header />
      {/* <div className="hero"></div> */}

      <div className="dashboard-layout">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <main className={`dashboard-content ${!sidebarOpen ? 'sidebar-closed' : ''}`}>
          {renderDashboard()}
        </main>
      </div>
      
      {/* <Footer /> */}
    </div>
  );
};

export default Dashboard;
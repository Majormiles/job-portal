// src/pages/JobListingsPage.js
import React from 'react';
import Dashboard from '../components/DashboardEmployee';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';

const JobListingsPage = () => {
  return (
    <div className="page-container">
      <Header />
      <div className="hero"></div>

      <div className="main-content-dashboard">
        <Sidebar />
        <Dashboard />
      </div>
    </div>
  );
};

export default JobListingsPage;
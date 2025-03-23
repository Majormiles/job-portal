// src/pages/JobListingsPage.js
import React from 'react';
import JobsApplied from '../components/AppliedJobs';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';

const JobListingsPage = () => {
  return (
    <div className="page-container">
      <Header />
      <div className="hero"></div>
      <Sidebar />
      <div className="content-section">
        <JobsApplied />
      </div>
      {/* <Footer /> */}
    </div>
  );
};

export default JobListingsPage;
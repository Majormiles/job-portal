// src/pages/JobListingsPage.js
import React from 'react';
import JobsApplied from '../components/AppliedJobs';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';
import '../components/css/AppliedJobs.css'; // Make sure to create this CSS file with the styles from above

const JobListingsPage = () => {
  return (
    <div className="page-container-appliedjobs">
      <Header />
      <div className="hero"></div>
      <Sidebar className="sidebar" />
      <div className="content-section-appliedjobs">
        <JobsApplied />
      </div>
      {/* <Footer /> */}
    </div>
  );
};

export default JobListingsPage;
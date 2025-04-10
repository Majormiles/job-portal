// src/pages/JobListingsPage.js
import React from 'react';
import JobDetails from '../components/ui/Details';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';

const JobdetailPage = () => {
  return (
    <div className="page-container">
      <Header />
      <div className="hero"></div>
      <div className="content-section">
        <JobDetails />
      </div>
      <Footer />
    </div>
  );
};

export default JobdetailPage;
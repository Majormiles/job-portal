// src/pages/JobListingsPage.js
import React from 'react';
import JobListings from '../components/ui/JobListings';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';

const JobListingsPage = () => {
  return (
    <div className="page-container">
      <Header />
      <div className="hero"></div>
      <div className="content-section">
        {/* <h1 className="page-title">Find Your Dream Job</h1> */}
        <JobListings />
      </div>
      <Footer />
    </div>
  );
};

export default JobListingsPage;
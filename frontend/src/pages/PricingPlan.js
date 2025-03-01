// src/pages/JobListingsPage.js
import React from 'react';
import Pricing from '../components/Pricing';
import Footer from '../components/Footer';

const JobListingsPage = () => {
  return (
    <div className="page-container">
      <div className="content-section">
        {/* <h1 className="page-title">Find Your Dream Job</h1> */}
        <Pricing />
      </div>
      {/* <Footer /> */}
    </div>
  );
};

export default JobListingsPage;
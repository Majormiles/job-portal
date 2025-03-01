// src/pages/JobListingsPage.js
import React from 'react';
import Pricing from '../components/Pricing';
import Header from '../components/Header';
import Footer from '../components/Footer';

const JobListingsPage = () => {
  return (
    <div className="page-container">
      <Header />
      <div className="hero"></div>
      <div className="content-section">
        {/* <h1 className="page-title">Find Your Dream Job</h1> */}
        <Pricing />
      </div>
      {/* <Footer /> */}
    </div>
  );
};

export default JobListingsPage;
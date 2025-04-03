// src/pages/JobListingsPage.js
import React from 'react';
import Pricing from '../components/ui/Pricing';
import Footer from '../components/ui/Footer';

const PricingPlan = () => {
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

export default PricingPlan;
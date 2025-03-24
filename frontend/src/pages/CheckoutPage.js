// src/pages/JobListingsPage.js
import React from 'react';
import Checkout from '../components/ui/Checkout';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';

const JobListingsPage = () => {
  return (
    <div className="page-container">
      <Header />
      <div className="hero"></div>
      <div className="content-section">
        <Checkout />
      </div>
      <Footer />
    </div>
  );
};

export default JobListingsPage;
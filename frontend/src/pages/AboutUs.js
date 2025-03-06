// src/pages/JobListingsPage.js
import React from 'react';
import AboutUs from '../components/AboutUs';
import Header from '../components/Header';
import Footer from '../components/Footer';

const JobListingsPage = () => {
  return (
    <div className="page-container">
      <Header />
      <div className="hero"></div>
      <div className="content-section">
        <AboutUs />
      </div>
      <Footer />
    </div>
  );
};

export default JobListingsPage;
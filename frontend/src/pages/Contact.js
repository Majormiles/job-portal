// src/pages/JobListingsPage.js
import React from 'react';
import Contact from '../components/Contact';
import Header from '../components/Header';
import Footer from '../components/Footer';

const JobListingsPage = () => {
  return (
    <div className="page-container">
      <Header />
      <div className="hero"></div>
      <div className="content-section">
        <Contact />
      </div>
      <Footer />
    </div>
  );
};

export default JobListingsPage;
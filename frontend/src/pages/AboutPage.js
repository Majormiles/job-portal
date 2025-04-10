// src/pages/JobListingsPage.js
import React from 'react';
import Aboutus from '../components/ui/Aboutus';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';

const AboutUs = () => {
  return (
    <div className="page-container">
      <Header />
      <div className="hero"></div>
      <div className="content-section">
        <Aboutus />
      </div>
      <Footer />
    </div>
  );
};

export default AboutUs;
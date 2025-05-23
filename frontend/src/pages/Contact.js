// src/pages/JobListingsPage.js
import React from 'react';
import Contact from '../components/ui/Contact';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';

const ContactPage = () => {
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

export default ContactPage;
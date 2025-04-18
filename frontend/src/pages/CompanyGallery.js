import React from 'react';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import CompanyGallery from '../components/ui/CompanyGallery';

const companyGallery = () => {
    return (
      <div className="page-container">
        <Header />
        <div className="hero"></div>
        <div className="content-section">
        <CompanyGallery />
        </div>
        <Footer />
      </div>
    );
  };
  
  export default companyGallery;




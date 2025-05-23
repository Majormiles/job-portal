// src/pages/HomePage.js
import React, { useEffect } from 'react';
import Companies from '../components/ui/Companies';
import JobCategories from '../components/ui/JobCategories';
import CompanySection from '../components/ui/CompanySection';
import CallToAction from '../components/ui/CallToAction';
import CompanyAbout from '../components/ui/Aboutus';
import FaqDropdown from '../components/ui/FaqDropdown';
import Footer from '../components/ui/Footer';

const HomePage = () => {
  useEffect(() => {
    // Add home-page class to body when component mounts
    document.body.classList.add('home-page');
    
    // Remove the class when component unmounts
    return () => {
      document.body.classList.remove('home-page');
    };
  }, []);

  return (
    <>
      <Companies />
      <JobCategories />
      <CompanyAbout />
      <CompanySection />
      {/* <CallToAction /> */}
      {/* <Testimonials /> */}
      {/* <FaqDropdown /> */}
      <Footer />

      {/* Removed JobListings from here */}
      {/* You can add NewsBlog back if needed */}
      {/* <NewsBlog /> */}
    </>
  );
};

export default HomePage;
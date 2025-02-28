// src/pages/HomePage.js
import React from 'react';
import Partner from '../components/Partner';
import RecentJobs from '../components/RecentJobs';
import JobCategories from '../components/JobCategories';
import CompanySection from '../components/CompanySection';
import CallToAction from '../components/CallToAction';
import Testimonials from '../components/Testimonials';
import FaqDropdown from '../components/FaqDropdown';
import Footer from '../components/Footer';

const HomePage = () => {

  
  return (
    <>
      <Partner />
      <RecentJobs />
      <JobCategories />
      <CompanySection />
      <CallToAction />
      <Testimonials />
      <FaqDropdown />
      <Footer />

      {/* Removed JobListings from here */}
      {/* You can add NewsBlog back if needed */}
      {/* <NewsBlog /> */}
    </>
  );
};

export default HomePage;
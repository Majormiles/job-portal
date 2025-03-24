// src/pages/HomePage.js
import React from 'react';
import Companies from '../components/ui/Companies';
import RecentJobs from '../components/ui/RecentJobs';
import JobCategories from '../components/ui/JobCategories';
import CompanySection from '../components/ui/CompanySection';
import CallToAction from '../components/ui/CallToAction';
import FaqDropdown from '../components/ui/FaqDropdown';
import Footer from '../components/ui/Footer';

const HomePage = () => {

  
  return (
    <>
      <Companies />
      <RecentJobs />
      <JobCategories />
      <CompanySection />
      <CallToAction />
      {/* <Testimonials /> */}
      <FaqDropdown />
      <Footer />

      {/* Removed JobListings from here */}
      {/* You can add NewsBlog back if needed */}
      {/* <NewsBlog /> */}
    </>
  );
};

export default HomePage;
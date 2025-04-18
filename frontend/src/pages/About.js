import React, { useEffect } from 'react';
import Aboutus from '../components/ui/Aboutus';
import CompanyGallery from '../components/ui/CompanyGallery';
import Footer from '../components/ui/Footer';

const About = () => {
  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    
    // Add about-page class to body
    document.body.classList.add('about-page');
    
    // Clean up
    return () => {
      document.body.classList.remove('about-page');
    };
  }, []);

  return (
    <>
      <Aboutus />
      <CompanyGallery />
      <Footer />
    </>
  );
};

export default About; 
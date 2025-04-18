import React, { useEffect, useRef } from 'react';
import '../css/CallToAction.css';
import { Link } from 'react-router-dom';
import jobsearchImage from '../../assets/images/business-woman.jpg';

const CallToAction = () => {
  const imageContainerRef = useRef(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate');
          }
        });
      }, 
      { threshold: 0.3 }
    );
    
    if (imageContainerRef.current) {
      observer.observe(imageContainerRef.current);
    }
    
    // Clean up observer on component unmount
    return () => {
      if (imageContainerRef.current) {
        observer.unobserve(imageContainerRef.current);
      }
    };
  }, []);
  
  return (
    <div className="cta-container">
      <div className="cta-content">
        <h1 className="cta-title">Build Your Path to a Brighter Tomorrow</h1>
        <p className="cta-description">
          Discover opportunities that align with your skills and aspirations.
          Take the next step in your career journey and unlock your full potential.
        </p>
        <Link to='/jobs'><button className="cta-button">Find Jobs</button></Link>
      </div>
      <div className="cta-image-container" ref={imageContainerRef}>
        <img src={jobsearchImage} alt="Company hero" className="cta-hero-image" />
      </div>
    </div>
  );
};

export default CallToAction;
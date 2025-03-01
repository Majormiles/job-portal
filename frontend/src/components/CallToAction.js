import React from 'react';
import './css/CallToAction.css';
import { Link, NavLink } from 'react-router-dom';
import jobsearchImage from '../assets/images/woman.png';
const CallToAction = () => {
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
      <div className="cta-image-container">
        {/* This div will have the background image with blur effect applied in CSS */}
        <img src={jobsearchImage} alt="Company hero" className="hero-image" />
      </div>
    </div>
  );
};

export default CallToAction;
import React from 'react';
import './css/CallToAction.css';

const CallToAction = () => {
  return (
    <div className="cta-container">
      <div className="cta-content">
        <h1 className="cta-title">Create A Better Future For Yourself</h1>
        <p className="cta-description">
          At eu lobortis pretium tincidunt amet lacus ut aenean aliquet. 
          Blandit a massa elementum id scelerisque rhoncus...
        </p>
        <button className="cta-button">Search Job</button>
      </div>
      <div className="cta-image-container">
        {/* This div will have the background image with blur effect applied in CSS */}
      </div>
    </div>
  );
};

export default CallToAction;
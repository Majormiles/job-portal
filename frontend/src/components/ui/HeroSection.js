import React from 'react';
import '../css/HeroSection.css';
import companyLogoSpotify from '../../assets/logo/Screenshot_20.png';
import companyLogoSlack from '../../assets/logo/slack.png';
import companyLogoAdobe from '../../assets/logo/adobe.png';
import companyLogoLinear from '../../assets/logo/linear.png';
import companyLogoAsana from '../../assets/logo/asana.jpeg';

const HeroSection = () => {
  return (
    <div className="hero-container">
      <div className="hero-content">
        <h1 className="hero-title">Find Your Dream Job Today!</h1>
        <p className="hero-subtitle">
          Connecting Talent with Opportunity: Your Gateway to Career Success
        </p>
        
        <div className="search-container">
          <div className="search-box">
            <input 
              type="text" 
              className="search-input" 
              placeholder="Job Title or Company" 
            />
            
            <div className="dropdown-container">
              <button className="dropdown-button">
                Select Location
                <svg className="dropdown-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path d="M7 10l5 5 5-5z" />
                </svg>
              </button>
            </div>
            
            <div className="dropdown-container">
              <button className="dropdown-button">
                Select Category
                <svg className="dropdown-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path d="M7 10l5 5 5-5z" />
                </svg>
              </button>
            </div>
            
            <button className="search-button">
              <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
              </svg>
              Search Job
            </button>
          </div>
        </div>
        
        <div className="stats-container">
          <div className="stat-item">
            <div className="stat-icon briefcase">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" />
              </svg>
            </div>
            <div className="stat-text">
              <h3 className="stat-number">25,850</h3>
              <p className="stat-label">Jobs</p>
            </div>
          </div>
          
          <div className="stat-item">
            <div className="stat-icon people">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
              </svg>
            </div>
            <div className="stat-text">
              <h3 className="stat-number">10,250</h3>
              <p className="stat-label">Candidates</p>
            </div>
          </div>
          
          <div className="stat-item">
            <div className="stat-icon building">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" />
              </svg>
            </div>
            <div className="stat-text">
              <h3 className="stat-number">18,400</h3>
              <p className="stat-label">Companies</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* <div className="partners-container">
        <div className="partner">
        <img src={companyLogoSpotify} alt="Company hero" className="hero-image" />
        </div>
        <div className="partner">
        <img src={companyLogoSlack} alt="Company hero" className="hero-image" />
        </div>
        <div className="partner">
        <img src={companyLogoAdobe} alt="Company hero" className="hero-image" />
        </div>
        <div className="partner">
        <img src={companyLogoLinear} alt="Company hero" className="hero-image" />
        </div>
        <div className="partner">
        <img src={companyLogoAsana} alt="Company hero" className="hero-image" />
        </div>
      </div> */}
    </div>
  );
};

export default HeroSection;
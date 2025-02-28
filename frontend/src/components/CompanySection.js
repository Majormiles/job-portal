import React from 'react';
import jobsearchImage from '../assets/images/jobsearch.png';
import './css/CompanySection.css'; // We'll define this CSS file separately

const CompanySection = () => {
  return (
    <div className="company-section">
      <div className="company-hero">
        <div className="hero-image-container">
        <img src={jobsearchImage} alt="Company hero" className="hero-image" />
        </div>
        <div className="hero-content">
          <h1 className="hero-title_company">Good Life Begins With A Good Company</h1>
          <p className="hero-description">
            Ultricies purus dolor viverra mi laoreet at cursus justo. Ultricies purus diam egestas 
            amet faucibus tempor blandit. Elit velit mauris aliquam est diam. Leo sagittis 
            consectetur diam morbi erat aenean. Vulputate praesent congue faucibus in 
            euismod feugiat euismod volutpat...
          </p>
          <div className="hero-buttons">
            <button className="btn btn-primary">Search Job</button>
            <a href="#" className="btn-link">Learn more</a>
          </div>
        </div>
      </div>

      <div className="company-stats-container">
        <div className="stat-item">
          <h2 className="stat-number">12k+</h2>
          <h3 className="stat-title">Clients worldwide</h3>
          <p className="stat-description">
            At eu lobortis pretium tincidunt amet lacus ut aenean aliquet. Blandit a massa elementum...
          </p>
        </div>

        <div className="stat-item">
          <h2 className="stat-number">20k+</h2>
          <h3 className="stat-title">Active resume</h3>
          <p className="stat-description">
            At eu lobortis pretium tincidunt amet lacus ut aenean aliquet. Blandit a massa elementum...
          </p>
        </div>

        <div className="stat-item">
          <h2 className="stat-number">18k+</h2>
          <h3 className="stat-title">Compnies</h3>
          <p className="stat-description">
            At eu lobortis pretium tincidunt amet lacus ut aenean aliquet. Blandit a massa elementum...
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompanySection;
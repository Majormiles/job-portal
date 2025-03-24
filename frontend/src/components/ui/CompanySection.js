import React from 'react';
import jobsearchImage from '../../assets/images/jobsearch.png';
import { Link, NavLink } from 'react-router-dom';
import '../css/CompanySection.css'; // We'll define this CSS file separately

const CompanySection = () => {
  return (
    <div className="company-section">
      <div className="company-hero">
        <div className="hero-image-container">
          <img src={jobsearchImage} alt="Company hero" className="hero-image" />
        </div>
        <div className="hero-content">
          <h2 className="hero-title_company">Good Life Begins With A Good Company</h2>
          <p className="hero-description-company">
            Success and fulfillment begin with the right workplace. A positive and supportive company culture fosters growth, innovation, and a sense of purpose.
            At our organization, we believe in providing an environment where talent thrives, ideas flourish, and individuals are empowered to reach their full potential.
          </p>
          {/* <div className="hero-buttons">
            <Link to='/jobs'><button className="btn btn-primary">Search Job</button></Link>
          </div> */}
        </div>
      </div>

      {/* <div className="company-stats-container">
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
      </div> */}


    </div>
  );
};

export default CompanySection;
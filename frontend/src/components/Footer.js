import React, { useState } from 'react';
import './css/Footer.css'; // Import the CSS file

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add newsletter subscription logic here
    console.log('Subscribing email:', email);
    setEmail('');
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          {/* Job Logo and Description */}
          <div className="footer-section">
            <div className="logo-container">
              <div className="logo">
                <span>📋</span>
              </div>
              <span className="logo-text">Job</span>
            </div>
            <p className="description">
              Connecting talent with opportunities to build a successful career.
              We provide a platform where job seekers can find their dream jobs. 
            </p>
          </div>

          {/* Company Links */}
          <div className="footer-section">
            <h3 className="section-title">Company</h3>
            <ul className="footer-links">
              <li><a href="#">About Us</a></li>
              <li><a href="#">Our Team</a></li>
              <li><a href="#">Partners</a></li>
              <li><a href="#">For Candidates</a></li>
              <li><a href="#">For Employers</a></li>
            </ul>
          </div>

          {/* Job Categories */}
          <div className="footer-section">
            <h3 className="section-title">Job Categories</h3>
            <ul className="footer-links">
              <li><a href="#">Telecomunications</a></li>
              <li><a href="#">Hotels & Tourism</a></li>
              <li><a href="#">Construction</a></li>
              <li><a href="#">Education</a></li>
              <li><a href="#">Financial Services</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="footer-section">
            <h3 className="section-title">Newsletter</h3>
            <p className="newsletter-text">
              Eu nunc pretium vitae platea. Non netus elementum vulputate.
            </p>
            <form onSubmit={handleSubmit} className="newsletter-form">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className="email-input"
                required
              />
              <button type="submit" className="subscribe-button">
                Subscribe now
              </button>
            </form>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="copyright">
            <p>© Copyright Job Portal 2024. Designed by Figma.guru</p>
          </div>
          <div className="legal-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms & Conditions</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../css/Footer.css'; // Import the CSS file

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add newsletter subscription logic here
    console.log('Subscribing email:', email);
    setEmail('');
  };
  // #222222
  return (
    <footer className="footer">
      <div className="footer-section-top">
        <div className="footer-content">
          {/* Job Logo and Description */}
          <div className="footer-section">
            <div className="logo-container">

              <Link to="/"> <div className="mb-6 sm:mb-8">
                <div className="logo">
                  <svg className="w-10 h-10 sm:w-12 sm:h-12 text-purple-700" viewBox="0 0 100 100" fill="currentColor">
                    <path d="M50 10 L90 30 L50 50 L10 30 Z" />
                    <path d="M50 50 L50 90 L10 70 L10 30 Z" />
                    <path d="M50 50 L50 90 L90 70 L90 30 Z" />
                  </svg>
                </div>
              </div>
              </Link>
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
              <li><a href="#" style={{textDecoration: 'none'}}>About Us</a></li>
              <li><a href="#" style={{textDecoration: 'none'}}>Our Team</a></li>
              <li><a href="#" style={{textDecoration: 'none'}}>Companies</a></li>
              <li><a href="#" style={{textDecoration: 'none'}}>For Job seekers</a></li>
            </ul>
          </div>

          {/* Job Categories */}
          <div className="footer-section">
            <h3 className="section-title">Job Categories</h3>
            <ul className="footer-links">
              <li><a href="#" style={{textDecoration: 'none'}}>Telecomunications</a></li>
              <li><a href="#" style={{textDecoration: 'none'}}>Hotels & Tourism</a></li>
              <li><a href="#" style={{textDecoration: 'none'}}>Construction</a></li>
              <li><a href="#" style={{textDecoration: 'none'}}>Education</a></li>
              <li><a href="#" style={{textDecoration: 'none'}}>Financial Services</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="footer-section">
            <h3 className="section-title">Newsletter</h3>
            <p className="newsletter-text">
              Stay updated with our latest news and exclusive offers. Subscribe now!
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

      </div>
      <div className="container">

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="copyright">
            <p>All right reserved &copy; Major Myles</p>
          </div>
          <div className="legal-links">
            <a href="#" style={{textDecoration: 'none'}}>Privacy Policy</a>
            <a href="#" style={{textDecoration: 'none'}}>Terms & Conditions</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
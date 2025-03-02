import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './css/Header_one.css';

const JobPortal = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [heroAnimation, setHeroAnimation] = useState(false);

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    // Start hero animation after component mount
    setTimeout(() => {
      setHeroAnimation(true);
    }, 300);

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
    // Prevent scrolling when mobile menu is open
    if (!showMobileMenu) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'visible';
    }
  };

  return (
    <div className="job-portal">
      {/* Header */}
      <header className={`main-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="header-container">
          <div className="logo-container">
            <Link to="/" className="logo-link">
              <div className="briefcase-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 6h-3V4c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM9 4h6v2H9V4zm11 15H4V8h16v11z" />
                </svg>
              </div>
              <span className="logo-text">Job Portal</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="desktop-nav">
            <ul className="nav-links">
              <li><Link to="/" className="active">Home</Link></li>
              <li><Link to="/jobs">Jobs</Link></li>
              <li><Link to="/about-us">About Us</Link></li>
              <li><Link to="/contact-us">Contact Us</Link></li>
            </ul>
          </nav>

          <div className="auth-buttons desktop-auth">
            <Link to="/login" className="login-btn">Login</Link>
            <Link to="/register" className="register-btn">Register</Link>
          </div>

          <div className="hamburger-menu" onClick={toggleMobileMenu}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
        
        {/* Mobile Side Menu */}
        <div className={`mobile-menu ${showMobileMenu ? 'show' : ''}`}>
          <div className="mobile-menu-header">
            <div className="logo-container">
              <Link to="/" className="logo-link">
                <div className="briefcase-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 6h-3V4c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM9 4h6v2H9V4zm11 15H4V8h16v11z" />
                  </svg>
                </div>
                <span>Job Portal</span>
              </Link>
            </div>
            <div className="close-menu" onClick={toggleMobileMenu}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </div>
          </div>
          
          <nav className="main-nav">
            <ul className="nav-links">
              <li><Link to="/" className="active" onClick={toggleMobileMenu}>Home</Link></li>
              <li><Link to="/jobs" onClick={toggleMobileMenu}>Jobs</Link></li>
              <li><Link to="/about-us" onClick={toggleMobileMenu}>About Us</Link></li>
              <li><Link to="/contact-us" onClick={toggleMobileMenu}>Contact Us</Link></li>
            </ul>
          </nav>

          <div className="auth-buttons mobile-auth">
            <Link to="/login" className="login-btn" onClick={toggleMobileMenu}>Login</Link>
            <Link to="/register" className="register-btn" onClick={toggleMobileMenu}>Register</Link>
          </div>
        </div>
        
        {/* Dark overlay when mobile menu is open */}
        {showMobileMenu && <div className="menu-overlay" onClick={toggleMobileMenu}></div>}
      </header>

      {/* Hero Section */}
      <section className={`hero-section ${heroAnimation ? 'animate' : ''}`}>
        <div className="hero-content">
          <h1 className="slide-in-right">Find Your Dream Job Today!</h1>
          <p className="fade-in">Connecting Talent with Opportunity: Your Gateway to Career Success</p>
          
          {/* Search Form */}
          <div className="search-container slide-up">
            <div className="search-form">
              <div className="search-input">
                <input type="text" placeholder="Job Title or Company" />
              </div>
              
              <div className="search-select">
                <select>
                  <option value="">Select Location</option>
                  <option value="new-york">New York</option>
                  <option value="london">London</option>
                  <option value="tokyo">Tokyo</option>
                  <option value="remote">Remote</option>
                </select>
                <div className="select-arrow">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7 10l5 5 5-5z"/>
                  </svg>
                </div>
              </div>
              
              <div className="search-select">
                <select>
                  <option value="">Select Category</option>
                  <option value="technology">Technology</option>
                  <option value="finance">Finance</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="education">Education</option>
                </select>
                <div className="select-arrow">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7 10l5 5 5-5z"/>
                  </svg>
                </div>
              </div>
              
              <button className="search-button">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                </svg>
                Search Job
              </button>
            </div>
          </div>
        </div>
        
        {/* Animated background elements */}
        <div className="animated-circles">
          <div className="circle circle-1"></div>
          <div className="circle circle-2"></div>
          <div className="circle circle-3"></div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-container">
          <div className="stat-item">
            <div className="stat-icon briefcase">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 6h-3V4c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM9 4h6v2H9V4zm11 15H4V8h16v11z" />
              </svg>
            </div>
            <div className="stat-content">
              <h3 className="counter" data-count="25850">0</h3>
              <p>Jobs</p>
            </div>
          </div>
          
          <div className="stat-item">
            <div className="stat-icon people">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
              </svg>
            </div>
            <div className="stat-content">
              <h3 className="counter" data-count="10250">0</h3>
              <p>Candidates</p>
            </div>
          </div>
          
          <div className="stat-item">
            <div className="stat-icon building">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" />
              </svg>
            </div>
            <div className="stat-content">
              <h3 className="counter" data-count="18400">0</h3>
              <p>Companies</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Animation & stats counter JS */}
      <script type="text/javascript" dangerouslySetInnerHTML={{
        __html: `
          // Counter animation for stats
          document.addEventListener('DOMContentLoaded', function() {
            const counterElements = document.querySelectorAll('.counter');
            
            const observer = new IntersectionObserver((entries) => {
              entries.forEach(entry => {
                if (entry.isIntersecting) {
                  const target = entry.target;
                  const count = parseInt(target.getAttribute('data-count'));
                  let current = 0;
                  const increment = count > 1000 ? Math.ceil(count / 50) : Math.ceil(count / 25);
                  const timer = setInterval(() => {
                    current += increment;
                    if (current >= count) {
                      target.textContent = count.toLocaleString();
                      clearInterval(timer);
                    } else {
                      target.textContent = current.toLocaleString();
                    }
                  }, 30);
                  observer.unobserve(target);
                }
              });
            }, { threshold: 0.25 });
            
            counterElements.forEach(counter => {
              observer.observe(counter);
            });
          });
        `
      }}></script>
    </div>
  );
};

export default JobPortal;
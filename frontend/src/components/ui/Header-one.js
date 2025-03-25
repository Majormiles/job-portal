import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../css/Header_one.css';

const defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23999999'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E";

const JobPortal = () => {
  const navigate = useNavigate();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [heroAnimation, setHeroAnimation] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Handle scroll effects and check auth state
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    // Check for token and user data
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    }

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

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    
    // Update state
    setIsLoggedIn(false);
    setUser(null);
    setDropdownOpen(false);
    
    // Close mobile menu if open
    if (showMobileMenu) {
      toggleMobileMenu();
    }
    
    // Redirect to home
    navigate('/');
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
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
            </ul>
          </nav>

          <div className="auth-buttons desktop-auth">
            {!isLoggedIn ? (
              <>
                <Link to="/login" className="login-btn">Login</Link>
                <Link to="/register" className="register-btn">Register</Link>
              </>
            ) : (
              <div className="user-profile">
                <div className="profile-btn" onClick={toggleDropdown}>
                  <img 
                    src={user?.profilePicture || defaultAvatar} 
                    alt="User" 
                    className="profile-image" 
                  />
                  <span className="username">{user?.name || 'User'}</span>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className={`chevron-icon ${dropdownOpen ? 'rotate' : ''}`}
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
                
                {dropdownOpen && (
                  <div className="dropdown-menu">
                    <Link to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        className="dropdown-icon"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      Profile
                    </Link>
                    <Link to="/dashboard_employee" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        className="dropdown-icon"
                      >
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="3" y1="9" x2="21" y2="9"></line>
                        <line x1="9" y1="21" x2="9" y2="9"></line>
                      </svg>
                      Dashboard
                    </Link>
                    <div className="dropdown-divider"></div>
                    <button className="dropdown-item" onClick={handleLogout}>
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        className="dropdown-icon"
                      >
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
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
              <li><Link to="/about" onClick={toggleMobileMenu}>About Us</Link></li>
              <li><Link to="/contact" onClick={toggleMobileMenu}>Contact Us</Link></li>
            </ul>
          </nav>

          <div className="auth-buttons mobile-auth">
            {!isLoggedIn ? (
              <>
                <Link to="/login" className="login-btn" onClick={toggleMobileMenu}>Login</Link>
                <Link to="/register" className="register-btn" onClick={toggleMobileMenu}>Register</Link>
              </>
            ) : (
              <div className="mobile-user-menu">
                <Link to="/profile" className="mobile-menu-item" onClick={toggleMobileMenu}>Profile</Link>
                <Link to="/dashboard_employee" className="mobile-menu-item" onClick={toggleMobileMenu}>Dashboard</Link>
                <button className="mobile-menu-item logout-btn" onClick={handleLogout}>Logout</button>
              </div>
            )}
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
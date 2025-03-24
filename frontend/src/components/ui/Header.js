import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import '../css/Header.css';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  // This would typically come from your authentication context or state management
  const [isLoggedIn, setIsLoggedIn] = useState(false); 

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo-container">
          <div className="briefcase-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="8" width="18" height="12" rx="2" ry="2"></rect>
              <path d="M8 8V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3"></path>
            </svg>
          </div>
          <span className="logo-text">Job Portal</span>
        </Link>

        <div className={`nav-container ${mobileMenuOpen ? 'nav-open' : ''}`}>
          <nav className="navigation">
            <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={closeMobileMenu}>Home</NavLink>
            <NavLink to="/jobs" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={closeMobileMenu}>Jobs</NavLink>
            <NavLink to="/about" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={closeMobileMenu}>About Us</NavLink>
            <NavLink to="/contact" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={closeMobileMenu}>Contact Us</NavLink>
          </nav>
          
          <div className="auth-buttons">
            {!isLoggedIn ? (
              <>
                <Link to="/login" className="login-btn" onClick={closeMobileMenu}>Login</Link>
                <Link to="/register" className="register-btn" onClick={closeMobileMenu}>Register</Link>
              </>
            ) : (
              <div className="user-profile">
                <div className="profile-btn" onClick={toggleDropdown}>
                  <img 
                    src="/path-to-your-default-image.jpg" 
                    alt="User" 
                    className="profile-image" 
                  />
                  <span className="username">John Doe</span>
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
                    <Link to="/profile" className="dropdown-item" onClick={() => {closeMobileMenu(); setDropdownOpen(false);}}>
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
                    <Link to="/dashboard" className="dropdown-item" onClick={() => {closeMobileMenu(); setDropdownOpen(false);}}>
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
                    <Link to="/logout" className="dropdown-item" onClick={() => {closeMobileMenu(); setDropdownOpen(false);}}>
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
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <button className="mobile-menu-toggle" onClick={toggleMobileMenu} aria-label="Toggle menu">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
  );
};

export default Header;
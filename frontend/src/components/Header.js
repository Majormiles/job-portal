import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import './css/Header.css';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
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
            <Link to="/login" className="login-btn" onClick={closeMobileMenu}>Login</Link>
            <Link to="/register" className="register-btn" onClick={closeMobileMenu}>Register</Link>
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
import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import NotificationBell from './NotificationBell';
import '../css/Header.css';

const defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23999999'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E";

const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, checkOnboardingStatus } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleDashboardClick = async () => {
    try {
      // Force check onboarding status before redirecting
      await checkOnboardingStatus(true);
      
      // Get the latest onboarding status
      const onboardingStatus = user?.onboardingStatus;
      const isOnboardingComplete = onboardingStatus?.isComplete;

      if (isOnboardingComplete) {
        // Determine which dashboard to redirect to based on user role
        const isEmployer = user?.role === 'employer' || 
                          (typeof user?.role === 'object' && user?.role?.name === 'employer') ||
                          user?.userType === 'employer' ||
                          localStorage.getItem('registrationData') && 
                          JSON.parse(localStorage.getItem('registrationData'))?.userType === 'employer';
        
        console.log('Redirecting to dashboard for role:', isEmployer ? 'employer' : 'job seeker');
        
        // Navigate to the appropriate dashboard
        if (isEmployer) {
          navigate('/dashboard-employer', { replace: true });
        } else {
          navigate('/dashboard-jobseeker', { replace: true });
        }
      } else {
        // If onboarding is not complete, go to first onboarding step
        navigate('/onboarding/personal-info', { replace: true });
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    }
    closeMobileMenu();
  };

  const handleLogout = () => {
    logout();
    closeMobileMenu();
    navigate('/');
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
            {/* <NavLink to="/jobs" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={closeMobileMenu}>Jobs</NavLink> */}
            <NavLink to="/gallery" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={closeMobileMenu}>About Us</NavLink>
            <NavLink to="/contact" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} onClick={closeMobileMenu}>Contact Us</NavLink>
          </nav>
          
          <div className="auth-buttons">
            {!isAuthenticated ? (
              <>
               <Link to="/login" className="login-btn" onClick={closeMobileMenu}>Login</Link>
                <Link to="/register" className="register-btn" onClick={closeMobileMenu}>Register</Link>
              </>
            ) : (
              <div className="user-profile">
                <button className="profile-btn" onClick={handleDashboardClick} title={user?.name || "Dashboard"}>
                  <span className="username">{user?.name || "Dashboard"}</span>
                </button>
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
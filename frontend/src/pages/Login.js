import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link, NavLink } from 'react-router-dom';
import '../components/css/Login.css'; // We'll create this CSS file for additional styling

// Main Auth component that handles both login and signup
const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState('success');
  const navigate = useNavigate();

  // Form states
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    jobRole: '',
    agreeToTerms: false
  });

  // Handle login form changes
  const handleLoginChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLoginForm({
      ...loginForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Handle signup form changes
  const handleSignupChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSignupForm({
      ...signupForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Handle login submission
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    // Here you would typically connect to your authentication API
    
    // Validate form
    if (!loginForm.email || !loginForm.password) {
      triggerPopup('Please fill in all required fields', 'error');
      return;
    }
    
    // Simulate login success
    console.log('Login form submitted:', loginForm);
    triggerPopup('Login successful! Redirecting...', 'success');
    
    // Redirect after a delay
    setTimeout(() => {
      navigate('/dashboard');
    }, 2000);
  };

  // Handle signup submission
  const handleSignupSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!signupForm.name || !signupForm.email || !signupForm.password || !signupForm.confirmPassword) {
      triggerPopup('Please fill in all required fields', 'error');
      return;
    }
    
    if (signupForm.password !== signupForm.confirmPassword) {
      triggerPopup('Passwords do not match', 'error');
      return;
    }
    
    if (!signupForm.agreeToTerms) {
      triggerPopup('You must agree to the terms and conditions', 'error');
      return;
    }
    
    // Simulate signup success
    console.log('Signup form submitted:', signupForm);
    triggerPopup('Account created successfully! You can now log in.', 'success');
    
    // Switch to login after successful signup
    setTimeout(() => {
      setIsLogin(true);
    }, 2000);
  };

  // Trigger popup with message
  const triggerPopup = (message, type = 'success') => {
    setPopupMessage(message);
    setPopupType(type);
    setShowPopup(true);
    
    // Auto hide popup after 4 seconds
    setTimeout(() => {
      setShowPopup(false);
    }, 4000);
  };

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="bg-gradient"></div>
        <div className="bg-pattern"></div>
      </div>
      
      <div className="auth-card">
        <Link to='/'>
        <div className="auth-header">
          <h1 className="auth-title">Job Portal</h1>
          <p className="auth-subtitle">
            {isLogin ? 'Sign in to access your account' : 'Create a new account to get started'}
          </p>
        </div>
        </Link>
        
        <div className="auth-tabs">
          <button 
            className={`auth-tab ${isLogin ? 'active' : ''}`} 
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button 
            className={`auth-tab ${!isLogin ? 'active' : ''}`} 
            onClick={() => setIsLogin(false)}
          >
            Sign Up
          </button>
        </div>
        
        <div className="auth-form-container">
          {isLogin ? (
            <form 
              className="auth-form fade-in" 
              onSubmit={handleLoginSubmit}
            >
              <div className="form-group">
                <label htmlFor="login-email">Email Address</label>
                <div className="input-with-icon">
                  <i className="icon-email"></i>
                  <input
                    id="login-email"
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={loginForm.email}
                    onChange={handleLoginChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="login-password">Password</label>
                <div className="input-with-icon">
                  <i className="icon-lock"></i>
                  <input
                    id="login-password"
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    value={loginForm.password}
                    onChange={handleLoginChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group form-options">
                <div className="remember-me">
                  <input
                    id="remember-me"
                    type="checkbox"
                    name="rememberMe"
                    checked={loginForm.rememberMe}
                    onChange={handleLoginChange}
                  />
                  <label htmlFor="remember-me">Remember me</label>
                </div>
                <a href="#" className="forgot-password">Forgot Password?</a>
              </div>
              
              <button type="submit" className="submit-button">
                <span>Login</span>
                <i className="icon-arrow-right"></i>
              </button>
              
              <div className="social-login">
                <p>Or continue with</p>
                <div className="social-buttons">
                  <button type="button" className="social-button google">
                    <i className="icon-google"></i>
                  </button>
                  <button type="button" className="social-button linkedin">
                    <i className="icon-linkedin"></i>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <form 
              className="auth-form fade-in" 
              onSubmit={handleSignupSubmit}
            >
              <div className="form-group">
                <label htmlFor="signup-name">Full Name</label>
                <div className="input-with-icon">
                  <input
                    id="signup-name"
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={signupForm.name}
                    onChange={handleSignupChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="signup-email">Email Address</label>
                <div className="input-with-icon">
                  <input
                    id="signup-email"
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={signupForm.email}
                    onChange={handleSignupChange}
                    required
                  />
                </div>
              </div>
              
       
              
              <div className="form-group">
                <label htmlFor="signup-password">Password</label>
                <div className="input-with-icon">
                  <input
                    id="signup-password"
                    type="password"
                    name="password"
                    placeholder="Create a password"
                    value={signupForm.password}
                    onChange={handleSignupChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="signup-confirm-password">Confirm Password</label>
                <div className="input-with-icon">
                  <input
                    id="signup-confirm-password"
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={signupForm.confirmPassword}
                    onChange={handleSignupChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group terms-checkbox">
                <input
                  id="agree-terms"
                  type="checkbox"
                  name="agreeToTerms"
                  checked={signupForm.agreeToTerms}
                  onChange={handleSignupChange}
                  required
                />
                <label htmlFor="agree-terms">
                  I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
                </label>
              </div>
              
              <button type="submit" className="submit-button">
                <span>Create Account</span>
                <i className="icon-arrow-right"></i>
              </button>
            </form>
          )}
        </div>
      </div>
      
      {/* Popup notification */}
      {showPopup && (
        <div className={`popup ${popupType} popup-animation`}>
          <div className="popup-icon">
            {popupType === 'success' ? (
              <i className="icon-check-circle"></i>
            ) : (
              <i className="icon-alert-circle"></i>
            )}
          </div>
          <div className="popup-content">
            <p>{popupMessage}</p>
          </div>
          <button className="popup-close" onClick={() => setShowPopup(false)}>
            <i className="icon-x"></i>
          </button>
        </div>
      )}
    </div>
  );
};

export default Auth;
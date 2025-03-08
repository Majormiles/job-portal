import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../components/css/Login.css';

const Login = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState('success');
  const navigate = useNavigate();

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const handleLoginChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLoginForm({
      ...loginForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    
    if (!loginForm.email || !loginForm.password) {
      triggerPopup('Please fill in all required fields', 'error');
      return;
    }
    
    console.log('Login form submitted:', loginForm);
    triggerPopup('Login successful! Redirecting...', 'success');
    
    setTimeout(() => {
      navigate('/dashboard');
    }, 2000);
  };

  const triggerPopup = (message, type = 'success') => {
    setPopupMessage(message);
    setPopupType(type);
    setShowPopup(true);
    
    setTimeout(() => {
      setShowPopup(false);
    }, 4000);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-left">
          <div className="auth-brand">
            <Link to="/">
              <h2>Job Portal</h2>
            </Link>
          </div>
          <div className="auth-welcome">
            <h1>Welcome Back</h1>
            <p>Sign in to access your account and continue your job search journey</p>
          </div>
          <div className="auth-image"></div>
        </div>
        
        <div className="auth-right">
          <div className="auth-form-wrapper">
            <div className="auth-header">
              <h2>Sign In</h2>
              <p>Don't have an account? <Link to="/register" className="auth-link">Create Account</Link></p>
            </div>
            
            <form className="auth-form" onSubmit={handleLoginSubmit}>
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
                <Link to="/forgot-password" className="forgot-password">Forgot Password?</Link>
              </div>
              
              <button type="submit" className="submit-button">
                Sign In
              </button>
              
              <div className="social-login">
                <div className="divider">
                  <span>OR</span>
                </div>
                <div className="social-buttons">
                  <button type="button" className="social-button google">
                    <i className="icon-google"></i>
                    <span>Continue with Google</span>
                  </button>
                  {/* <button type="button" className="social-button linkedin">
                    <i className="icon-linkedin"></i>
                    <span>Continue with LinkedIn</span>
                  </button> */}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      
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

export default Login;
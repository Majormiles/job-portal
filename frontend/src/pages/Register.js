import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../components/css/Register.css';

const Register = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState('success');
  const navigate = useNavigate();

  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });

  const handleSignupChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSignupForm({
      ...signupForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    
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
    
    console.log('Signup form submitted:', signupForm);
    triggerPopup('Account created successfully! Redirecting to login...', 'success');
    
    setTimeout(() => {
      navigate('/login');
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
            <h1>Join Our Community</h1>
            <p>Create an account to access personalized job recommendations and career opportunities</p>
          </div>
          <div className="auth-image register-image"></div>
        </div>
        
        <div className="auth-right">
          <div className="auth-form-wrapper">
            <div className="auth-header">
              <h2>Create Account</h2>
              <p>Already have an account? <Link to="/login" className="auth-link">Sign In</Link></p>
            </div>
            
            <form className="auth-form" onSubmit={handleSignupSubmit}>
              <div className="form-group">
                <label htmlFor="signup-email">Email Address</label>
                <div className="input-with-icon">
                  <i className="icon-email"></i>
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
                  <i className="icon-lock"></i>
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
                  <i className="icon-lock"></i>
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
                Create Account
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
                  <button type="button" className="social-button linkedin">
                    <i className="icon-linkedin"></i>
                    <span>Continue with LinkedIn</span>
                  </button>
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

export default Register;
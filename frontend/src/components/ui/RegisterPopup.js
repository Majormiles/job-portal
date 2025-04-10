import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import jobsearchImage from '../../assets/images/aigenerated.jpg';
import '../css/RegisterPopup.css';

const RegisterPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const popupRef = useRef(null);

  useEffect(() => {
    // Check if the popup has been shown before
    const hasPopupBeenShown = localStorage.getItem('registerPopupShown');
    
    if (!hasPopupBeenShown) {
      // Show popup after 3 seconds
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  // Handle closing the popup
  const closePopup = () => {
    setIsVisible(false);
    // Record that the popup has been shown
    localStorage.setItem('registerPopupShown', 'true');
  };

  // Handle clicks outside the popup
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        closePopup();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible]);

  // Handle ESC key press
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        closePopup();
      }
    };

    if (isVisible) {
      window.addEventListener('keydown', handleEscKey);
    }
    
    return () => {
      window.removeEventListener('keydown', handleEscKey);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="register-popup-overlay" role="dialog" aria-modal="true" aria-labelledby="popup-title">
      <div 
        className="register-popup-container" 
        ref={popupRef}
        tabIndex="-1"
      >
        <button 
          className="register-popup-close" 
          onClick={closePopup} 
          aria-label="Close popup"
        >
          <X size={24} />
        </button>
        
        <div className="register-popup-content">
          <div className="register-popup-image-container">
            <img 
              src={jobsearchImage} 
              alt="People searching for jobs" 
              className="register-popup-image" 
            />
          </div>
          
          <div className="register-popup-text">
            <h2 id="popup-title" className="register-popup-title">
              Find Your Dream Job Today
            </h2>
            
            <p className="register-popup-description">
              Create an account to save jobs, get personalized recommendations, 
              and apply with a single click. Join thousands of successful job 
              seekers who found their perfect career with us.
            </p>
            
            <Link to="/register">
              <button className="register-popup-button">
                Create Free Account
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPopup; 
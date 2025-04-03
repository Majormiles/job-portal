import React, { useEffect, useState } from 'react';
import { useGoogleOAuth } from '../contexts/GoogleOAuthContext';
import toast from 'react-hot-toast';

const GoogleOAuthButton = ({ onSuccess, buttonId = 'google-login-button', buttonText = 'Sign in with Google' }) => {
  const { isInitialized, error, isLoading, setSuccessHandler } = useGoogleOAuth();
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  useEffect(() => {
    // Set the success handler when the component mounts
    if (onSuccess) {
      setSuccessHandler(onSuccess);
    }

    // Clean up the success handler when the component unmounts
    return () => {
      setSuccessHandler(null);
    };
  }, [onSuccess, setSuccessHandler]);

  useEffect(() => {
    if (isInitialized && window.google) {
      try {
        window.google.accounts.id.renderButton(
          document.getElementById(buttonId),
          { theme: 'outline', size: 'large', width: '100%' }
        );
      } catch (error) {
        console.error('Error rendering Google button:', error);
        if (retryCount < maxRetries) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 1000);
        } else {
          toast.error('Failed to load Google sign-in button. Please try refreshing the page.');
        }
      }
    }
  }, [isInitialized, buttonId, retryCount]);

  useEffect(() => {
    if (error) {
      console.error('Google OAuth error:', error);
      toast.error('Failed to initialize Google sign-in. Please try again later.');
    }
  }, [error]);

  return (
    <div className="w-full">
      {isLoading ? (
        <div className="w-full py-2.5 sm:py-3 px-4 text-sm sm:text-base text-gray-600 rounded-md font-medium text-center">
          Loading Google sign-in...
        </div>
      ) : (
        <div id={buttonId} className="w-full"></div>
      )}
    </div>
  );
};

export default GoogleOAuthButton; 
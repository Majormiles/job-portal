import React, { useEffect } from 'react';
import verifyGoogleOAuth from '../utils/verifyGoogleOAuth';

const GoogleOAuthTest = () => {
  useEffect(() => {
    verifyGoogleOAuth().then(result => {
      if (!result.isValid) {
        console.warn('Google OAuth Configuration Issues:', result.results);
      }
    });
  }, []);

  return null; // Don't render anything
};

export default GoogleOAuthTest; 
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';

const GoogleOAuthContext = createContext();

export const GoogleOAuthProvider = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const initializationAttempts = useRef(0);
  const maxInitializationAttempts = 3;
  const successHandlerRef = useRef(null);

  const setSuccessHandler = (handler) => {
    successHandlerRef.current = handler;
  };

  useEffect(() => {
    const loadGoogleScript = () => {
      return new Promise((resolve, reject) => {
        // Check if script is already loaded
        if (window.google && window.google.accounts) {
          console.log('Google script already loaded');
          resolve();
          return;
        }

        // Check if script is already being loaded
        const existingScript = document.querySelector('script[src*="accounts.google.com/gsi/client"]');
        if (existingScript) {
          existingScript.onload = () => {
            console.log('Existing Google script loaded successfully');
            resolve();
          };
          existingScript.onerror = (err) => {
            console.error('Error loading existing Google script:', err);
            reject(new Error('Failed to load Google script'));
          };
          return;
        }

        // Create script element
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;

        // Add event listeners
        script.onload = () => {
          console.log('Google script loaded successfully');
          resolve();
        };

        script.onerror = (err) => {
          console.error('Error loading Google script:', err);
          reject(new Error('Failed to load Google script'));
        };

        // Append script to document
        document.body.appendChild(script);
      });
    };

    const initializeGoogleOAuth = async () => {
      try {
        // Load Google script
        await loadGoogleScript();

        const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
        if (!clientId) {
          throw new Error('Google Client ID not configured');
        }

        console.log('Initializing Google OAuth with client ID:', clientId);

        // Initialize Google OAuth
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            console.log('Google OAuth callback received');
            if (response.credential && successHandlerRef.current) {
              console.log('Credential received, calling success handler');
              successHandlerRef.current(response);
            } else {
              console.error('No credential received or no success handler set');
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
          ux_mode: 'popup',
          context: 'signin',
          scope: 'openid email profile',
          itp_support: true
        });

        // Set initialized state
        setIsInitialized(true);
        setError(null);
        console.log('Google OAuth initialized successfully');
      } catch (err) {
        console.error('Google OAuth initialization error:', err);
        setError(err.message);
        
        // Retry initialization if attempts remain
        if (initializationAttempts.current < maxInitializationAttempts) {
          initializationAttempts.current++;
          console.log(`Retrying initialization (attempt ${initializationAttempts.current}/${maxInitializationAttempts})`);
          setTimeout(initializeGoogleOAuth, 3000);
        } else {
          setError('Failed to initialize Google OAuth after multiple attempts');
          setIsLoading(false);
        }
      } finally {
        setIsLoading(false);
      }
    };

    // Add a delay before initializing
    const timer = setTimeout(initializeGoogleOAuth, 2000);
    return () => {
      clearTimeout(timer);
      if (window.google) {
        window.google.accounts.id.cancel();
      }
    };
  }, []);

  return (
    <GoogleOAuthContext.Provider value={{ isInitialized, error, isLoading, setSuccessHandler }}>
      {children}
    </GoogleOAuthContext.Provider>
  );
};

export const useGoogleOAuth = () => {
  const context = useContext(GoogleOAuthContext);
  if (!context) {
    throw new Error('useGoogleOAuth must be used within a GoogleOAuthProvider');
  }
  return context;
}; 
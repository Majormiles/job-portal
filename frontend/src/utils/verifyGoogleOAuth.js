import axios from 'axios';

const waitForElement = (selector, timeout = 15000) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const checkElement = () => {
      const element = document.querySelector(selector);
      if (element) {
        // Check if the element is visible and has the correct styles
        const style = window.getComputedStyle(element);
        const isVisible = style.display !== 'none' && 
                         style.visibility !== 'hidden' && 
                         style.opacity !== '0' &&
                         element.offsetWidth > 0 &&
                         element.offsetHeight > 0;
        
        if (isVisible) {
          resolve(element);
          return;
        }
      }
      
      if (Date.now() - startTime >= timeout) {
        reject(new Error(`Timeout waiting for element: ${selector}`));
        return;
      }
      
      requestAnimationFrame(checkElement);
    };
    
    checkElement();
  });
};

const verifyGoogleOAuth = async () => {
  const results = {
    frontend: {
      clientId: false,
      origin: false,
      script: false,
      button: false,
      environment: false
    },
    backend: {
      clientId: false,
      endpoint: false,
      environment: false
    },
    google: {
      configuration: false
    }
  };

  try {
    // 1. Check Frontend Configuration
    console.log('\n=== Frontend Configuration ===');
    
    // Check Environment Variables
    const envVars = {
      REACT_APP_GOOGLE_CLIENT_ID: process.env.REACT_APP_GOOGLE_CLIENT_ID,
      REACT_APP_API_URL: process.env.REACT_APP_API_URL
    };
    console.log('Environment Variables:', envVars);
    results.frontend.environment = !!envVars.REACT_APP_GOOGLE_CLIENT_ID && !!envVars.REACT_APP_API_URL;

    // Check Client ID
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    console.log('Client ID:', clientId ? 'Present' : 'Missing');
    results.frontend.clientId = !!clientId;

    // Check Origin
    const origin = window.location.origin;
    console.log('Current Origin:', origin);
    results.frontend.origin = origin === 'http://localhost:3000' || origin === 'http://127.0.0.1:3000';

    // Check Google Script
    const googleScript = document.querySelector('script[src*="accounts.google.com/gsi/client"]');
    console.log('Google Script:', googleScript ? 'Loaded' : 'Not Found');
    results.frontend.script = !!googleScript;

    // Wait for button to be rendered and initialized
    try {
      // First wait for the container
      const buttonContainer = await waitForElement('[data-google-oauth-button="true"]');
      console.log('Google Button Container: Found');
      
      // Then wait for the button to be rendered
      await new Promise(resolve => setTimeout(resolve, 5000)); // Increased delay
      
      // Check if the button is visible and properly rendered
      const button = document.querySelector('[data-google-oauth-button="true"]');
      if (button) {
        const isRendered = button.getAttribute('data-button-rendered') === 'true';
        const style = window.getComputedStyle(button);
        const isVisible = style.display !== 'none' && 
                         style.visibility !== 'hidden' && 
                         style.opacity !== '0' &&
                         button.offsetWidth > 0 &&
                         button.offsetHeight > 0;
        
        if (isRendered && isVisible) {
          console.log('Google Button: Found and Initialized');
          results.frontend.button = true;
        } else {
          console.log('Google Button: Found but not fully rendered or visible');
          results.frontend.button = false;
        }
      } else {
        console.log('Google Button: Not Found');
        results.frontend.button = false;
      }
    } catch (error) {
      console.log('Google Button: Not Found or Not Initialized');
      results.frontend.button = false;
    }

    // 2. Check Backend Configuration
    console.log('\n=== Backend Configuration ===');
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/auth/config`);
      console.log('Backend Config:', response.data);
      results.backend.clientId = response.data.googleClientId === clientId;
      results.backend.endpoint = true;
      results.backend.environment = true;
    } catch (error) {
      console.error('Backend Check Error:', error.message);
      if (error.response) {
        console.error('Response Data:', error.response.data);
        console.error('Response Status:', error.response.status);
      }
    }

    // 3. Check Google OAuth Configuration
    console.log('\n=== Google OAuth Configuration ===');
    try {
      // Check Google OAuth configuration
      const googleResponse = await axios.get(
        'https://accounts.google.com/.well-known/openid-configuration'
      );
      console.log('Google OAuth Config:', googleResponse.data);
      results.google.configuration = true;
    } catch (error) {
      console.error('Google OAuth Check Error:', error.message);
      if (error.response) {
        console.error('Response Data:', error.response.data);
        console.error('Response Status:', error.response.status);
      }
    }

    // Print Summary
    console.log('\n=== Configuration Summary ===');
    console.log('Frontend:', results.frontend);
    console.log('Backend:', results.backend);
    console.log('Google:', results.google);

    // Determine if configuration is valid
    const isValid = Object.values(results).every(section => 
      Object.values(section).every(value => value === true)
    );

    if (!isValid) {
      console.log('\n=== Issues Found ===');
      if (!results.frontend.environment) console.log('- Frontend environment variables are missing');
      if (!results.frontend.clientId) console.log('- Frontend Client ID is missing');
      if (!results.frontend.origin) console.log('- Origin is not properly configured');
      if (!results.frontend.script) console.log('- Google OAuth script is not loaded');
      if (!results.frontend.button) console.log('- Google button is not found or not initialized');
      if (!results.backend.environment) console.log('- Backend environment variables are missing');
      if (!results.backend.clientId) console.log('- Backend Client ID mismatch');
      if (!results.backend.endpoint) console.log('- Backend endpoint is not accessible');
      if (!results.google.configuration) console.log('- Google OAuth configuration is not accessible');
    }

    return {
      isValid,
      results,
      details: {
        clientId,
        origin,
        apiUrl: process.env.REACT_APP_API_URL
      }
    };
  } catch (error) {
    console.error('Verification Error:', error);
    return {
      isValid: false,
      error: error.message,
      results: {
        frontend: { error: true },
        backend: { error: true },
        google: { error: true }
      }
    };
  }
};

// Run verification if script is loaded in browser
if (typeof window !== 'undefined') {
  // Wait for DOM to be ready and React to mount
  const runVerification = () => {
    // Give React more time to mount and render
    setTimeout(() => {
      verifyGoogleOAuth().then(result => {
        if (!result.isValid) {
          console.warn('Google OAuth Configuration Issues:', result.results);
          // Log specific issues
          if (!result.results.frontend.button) {
            console.log('Button initialization failed. Checking container...');
            const container = document.querySelector('[data-google-oauth-button="true"]');
            if (container) {
              console.log('Container found:', {
                rendered: container.getAttribute('data-button-rendered'),
                style: window.getComputedStyle(container)
              });
            } else {
              console.log('Container not found in DOM');
              // Try to find the button again after a delay
              setTimeout(() => {
                const retryContainer = document.querySelector('[data-google-oauth-button="true"]');
                if (retryContainer) {
                  console.log('Container found on retry:', {
                    rendered: retryContainer.getAttribute('data-button-rendered'),
                    style: window.getComputedStyle(retryContainer)
                  });
                } else {
                  console.log('Container still not found after retry');
                }
              }, 15000); // Increased retry delay
            }
          }
        }
      }).catch(error => {
        console.error('Verification failed:', error);
      });
    }, 20000); // Increased timeout to 20 seconds
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runVerification);
  } else {
    runVerification();
  }
}

export default verifyGoogleOAuth; 
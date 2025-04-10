let scriptPromise = null;
let scriptElement = null;

export const loadGoogleScript = () => {
  if (scriptPromise) {
    return scriptPromise;
  }

  scriptPromise = new Promise((resolve, reject) => {
    if (window.google && window.google.accounts) {
      console.log('Google script already loaded');
      resolve();
      return;
    }

    scriptElement = document.createElement('script');
    scriptElement.src = 'https://accounts.google.com/gsi/client';
    scriptElement.async = true;
    scriptElement.defer = true;
    scriptElement.onload = () => {
      console.log('Google script loaded successfully');
      resolve();
    };
    scriptElement.onerror = (error) => {
      console.error('Error loading Google script:', error);
      reject(error);
    };
    document.body.appendChild(scriptElement);
  });

  return scriptPromise;
};

export const cleanupGoogleScript = () => {
  // Just clean up our references
  scriptElement = null;
  scriptPromise = null;
  
  // Clean up any Google OAuth state
  if (window.google && window.google.accounts) {
    try {
      window.google.accounts.id.cancel();
    } catch (error) {
      console.warn('Failed to cancel Google OAuth:', error);
    }
  }
}; 
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import OnboardingLayout from './OnboardingLayout';

// ScrollToTop component to handle scrolling on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
};

const Complete = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userData, setUserData] = useState(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState(null);
  const [redirectSeconds, setRedirectSeconds] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { api, user, checkOnboardingStatus, setUser, updateOnboardingStatus } = useAuth();
  const mountedRef = useRef(true);
  const timerRef = useRef(null);
  const completeRef = useRef(false);

  // Default avatar URL - using a reliable external source
  const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.name || 'User') + '&background=random';

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Start the automatic redirect countdown
  useEffect(() => {
    if (!loading && !submitting && !error && !redirectSeconds) {
      // Start the auto-completion process after a short delay
      const timeout = setTimeout(() => {
        if (mountedRef.current && !completeRef.current) {
          completeRef.current = true;
          completeOnboarding();
        }
      }, 1000);
      
      return () => clearTimeout(timeout);
    }
  }, [loading, submitting, error, redirectSeconds]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Check if api is defined before attempting to use it
        if (!api) {
          console.warn('API object is not available yet. Will retry when it becomes available.');
          // Set a delay and then set loading to false so the component doesn't hang
          setTimeout(() => {
            if (mountedRef.current) {
              setLoading(false);
            }
          }, 1000);
          return;
        }
        
        const response = await api.get('/users/onboarding-status');
        console.log('API Response:', response.data);
        if (response.data.success) {
          setUserData(response.data.data);
          // Set initial image URL
          const profilePic = response.data.data?.personalInfo?.data?.profilePicture;
          console.log('Profile Picture Data:', profilePic);
          
          if (profilePic) {
            let fullUrl;
            if (profilePic.startsWith('http')) {
              fullUrl = profilePic;
            } else if (profilePic.startsWith('/')) {
              fullUrl = `${api.defaults.baseURL}${profilePic}`;
            } else {
              fullUrl = `${api.defaults.baseURL}/${profilePic}`;
            }
            console.log('Full Image URL:', fullUrl);
            setImageUrl(fullUrl);
          } else {
            console.log('No profile picture found, using default avatar');
            setImageUrl(DEFAULT_AVATAR);
          }

          // Check if we need to auto-create the skills section
          if (!response.data.data.skills || !response.data.data.skills.completed) {
            console.log('Skills section not found or not completed. Attempting to auto-create it...');
            try {
              // Create a basic skills section to complete the onboarding
              await autoCreateSkillsSection();
            } catch (error) {
              console.error('Error auto-creating skills section:', error);
              setError('Failed to prepare your profile. Please try again.');
            }
          } else {
            console.log('Skills section already completed');
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load your profile data. Please refresh the page.');
        toast.error('Failed to load user data');
        setImageUrl(DEFAULT_AVATAR);
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };

    // Only call fetchUserData if the api object is available
    if (api) {
      fetchUserData();
    } else {
      console.warn('API object is not available. Will try to initialize UI with default values.');
      setImageUrl(DEFAULT_AVATAR);
      setLoading(false);
      setError('Connection to server unavailable. Please refresh the page.');
    }
  }, [api, user?.name, DEFAULT_AVATAR]);

  // Try auto-creating the skills section
  const autoCreateSkillsSection = async () => {
    try {
      console.log('Attempting to auto-create skills section...');
      // Create a basic skills data structure
      const skillsData = {
        technical: ['Resume Uploaded'],
        soft: ['Communication'],
        languages: [],
        certifications: []
      };
      
      // Use the auth context to update the skills section
      const result = await updateOnboardingStatus('skills', skillsData);
      console.log('Successfully auto-created skills section:', result);
      return result;
    } catch (error) {
      console.error('Failed to auto-create skills section:', error);
      throw error;
    }
  };

  const completeOnboarding = async () => {
    try {
      setSubmitting(true);
      setError(null);
      
      // Check if api is defined before attempting to use it
      if (!api) {
        throw new Error('API connection is not available. Please refresh the page and try again.');
      }
      
      console.log('Starting onboarding completion process...');
      
      // First, ensure skills section exists
      try {
        console.log('Verifying skills section...');
        const onboardingStatus = await api.get('/users/onboarding-status');
        if (!onboardingStatus.data.success) {
          throw new Error('Failed to fetch onboarding status');
        }
        
        const data = onboardingStatus.data.data;
        console.log('Current onboarding data:', data);
        
        if (!data.skills || !data.skills.completed) {
          console.log('Skills section missing or incomplete, creating it...');
          await autoCreateSkillsSection();
          console.log('Skills section created successfully');
        }
      } catch (error) {
        console.error('Error verifying skills section:', error);
        // Continue anyway, backend will auto-complete sections
      }
      
      // Now try to complete the onboarding
      console.log('Sending complete request to server...');
      try {
        const completeResponse = await api.post('/users/onboarding/complete');
        console.log('Complete response:', completeResponse.data);

        if (!completeResponse.data.success) {
          throw new Error('Failed to complete onboarding');
        }

        // Update user context with new onboarding status
        await checkOnboardingStatus();
        
        // Start the redirect countdown
        setRedirectSeconds(5);
        startRedirectCountdown();
        
        toast.success('Onboarding completed successfully! Redirecting to dashboard...');
      } catch (error) {
        console.error('Error from complete API call:', error);
        
        // Try with the section route as a fallback
        try {
          console.log('Trying alternative endpoint...');
          const alternativeResponse = await api.post('/users/onboarding/complete', {});
          console.log('Alternative endpoint response:', alternativeResponse.data);
          
          // If successful, continue with countdown
          if (alternativeResponse.data.success) {
            await checkOnboardingStatus();
            setRedirectSeconds(5);
            startRedirectCountdown();
            toast.success('Onboarding completed successfully! Redirecting to dashboard...');
            return;
          }
        } catch (fallbackError) {
          console.error('Alternative endpoint also failed:', fallbackError);
          // Continue to main error handling
        }
        
        throw error; // Rethrow the original error for the main catch block
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
      setError(error.message || 'Failed to complete onboarding. Please try again.');
      toast.error('Could not complete onboarding: ' + (error.message || 'Unknown error'));
    } finally {
      if (mountedRef.current) {
        setSubmitting(false);
      }
    }
  };

  const startRedirectCountdown = () => {
    let secondsLeft = 5;
    setRedirectSeconds(secondsLeft);
    
    timerRef.current = setInterval(() => {
      secondsLeft -= 1;
      if (mountedRef.current) {
        setRedirectSeconds(secondsLeft);
      }
      
      if (secondsLeft <= 0) {
        clearInterval(timerRef.current);
        
        // Determine which dashboard to redirect to based on user role
        const isEmployer = user?.role === 'employer' || 
                          (typeof user?.role === 'object' && user?.role?.name === 'employer') ||
                          user?.userType === 'employer' ||
                          localStorage.getItem('registrationData') && 
                          JSON.parse(localStorage.getItem('registrationData'))?.userType === 'employer';
        
        // Log the redirection decision
        console.log('User role determined as:', isEmployer ? 'employer' : 'job seeker');
        console.log('Redirecting to appropriate dashboard');
        
        // Redirect to appropriate dashboard
        if (isEmployer) {
          navigate('/dashboard-employer');
        } else {
          navigate('/dashboard-jobseeker');
        }
      }
    }, 1000);
  };

  const handleManualComplete = () => {
    if (!submitting && !redirectSeconds) {
      completeOnboarding();
    }
  };

  const handleImageLoad = () => {
    console.log('Image loaded successfully');
    setImageLoading(false);
  };

  const handleImageError = (e) => {
    console.log('Image failed to load, falling back to default avatar');
    console.log('Failed URL:', e.target.src);
    e.target.onerror = null; // Prevent infinite loop
    setImageUrl(DEFAULT_AVATAR);
    setImageLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-gray-600"></div>
      </div>
    );
  }

  return (
    <>
      <ScrollToTop />
      <OnboardingLayout>
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Congratulations!</h2>
            <p className="mt-2 text-gray-600">
              You've completed setting up your profile. You're all set to explore job opportunities.
            </p>
            
            {error ? (
              <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">
                <p className="font-medium">Error: {error}</p>
                <button 
                  onClick={handleManualComplete}
                  className="mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 rounded-md transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : redirectSeconds !== null ? (
              <div className="mt-4 p-4 bg-indigo-50 text-indigo-700 rounded-md flex flex-col items-center">
                <div className="text-lg font-medium mb-1">
                  Redirecting to dashboard in {redirectSeconds} seconds...
                </div>
                <div className="w-full bg-indigo-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-full transition-all duration-1000 ease-linear"
                    style={{ width: `${(redirectSeconds / 5) * 100}%` }}
                  ></div>
                </div>
              </div>
            ) : submitting ? (
              <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded-md">
                <div className="flex items-center justify-center">
                  <svg className="animate-spin mr-2 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Finalizing your profile...</span>
                </div>
              </div>
            ) : null}
          </div>

          {/* Profile Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-100">
                {imageLoading && <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
                </div>}
                <img
                  src={imageUrl || DEFAULT_AVATAR}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  style={{ opacity: imageLoading ? 0 : 1 }}
                />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">{user?.name}</h3>
                <p className="text-gray-600">{user?.email}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Completed Sections:</h4>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Personal Information</span>
                </div>
                <div className="flex items-center text-sm">
                  <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Skills</span>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleManualComplete}
                disabled={submitting || redirectSeconds !== null}
                className="inline-flex items-center justify-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors duration-200"
              >
                {submitting ? 'Processing...' : 'Try Again'}
              </button>
            </div>
          )}
        </div>
      </OnboardingLayout>
    </>
  );
};

export default Complete;
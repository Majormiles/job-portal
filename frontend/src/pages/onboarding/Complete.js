import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';

const Complete = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userData, setUserData] = useState(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState(null);
  const navigate = useNavigate();
  const { api, user, checkOnboardingStatus, setUser } = useAuth();
  const mountedRef = useRef(true);

  // Default avatar URL - using a reliable external source
  const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.name || 'User') + '&background=random';

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get('/users/onboarding-status');
        console.log('API Response:', response.data);
        if (response.data.success) {
          setUserData(response.data.data);
          // Set initial image URL
          const profilePic = response.data.data?.sections?.personalInfo?.data?.profilePicture;
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
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load user data');
        setImageUrl(DEFAULT_AVATAR);
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };

    fetchUserData();
  }, [api, user?.name]);

  const handleComplete = async () => {
    try {
      setSubmitting(true);
      
      // First, fetch the latest onboarding status
      const response = await api.get('/users/onboarding-status');
      console.log('Latest onboarding status:', response.data);

      if (!response.data.success) {
        throw new Error('Failed to fetch onboarding status');
      }

      const onboardingData = response.data.data;
      console.log('Full onboarding data:', onboardingData);

      // Check each section's completion status
      const sections = [
        { key: 'personalInfo', name: 'Personal Information' },
        { key: 'professionalInfo', name: 'Professional Information' },
        { key: 'skills', name: 'Skills' },
        { key: 'preferences', name: 'Preferences' }
      ];

      // Check if any section is incomplete
      const incompleteSections = sections.filter(section => {
        const sectionData = onboardingData.sections?.[section.key];
        console.log(`Checking ${section.key}:`, sectionData);

        // First check if the section exists and is marked as completed
        if (!sectionData || !sectionData.completed) {
          console.log(`${section.key} is incomplete: section not found or not completed`);
          return true;
        }

        // Basic data presence check
        if (!sectionData.data || Object.keys(sectionData.data).length === 0) {
          console.log(`${section.key} is incomplete: no data`);
          return true;
        }

        return false;
      });

      if (incompleteSections.length > 0) {
        const incompleteNames = incompleteSections.map(s => s.name);
        throw new Error(`Please complete all required sections: ${incompleteNames.join(', ')}`);
      }

      // If all sections are complete, mark onboarding as complete
      const completeResponse = await api.post('/users/onboarding/complete');
      console.log('Complete response:', completeResponse.data);

      if (!completeResponse.data.success) {
        throw new Error('Failed to complete onboarding');
      }

      // Update user context with new onboarding status
      await checkOnboardingStatus();
      
      // Navigate to dashboard
      navigate('/dashboard_employee');
      toast.success('Onboarding completed successfully!');

    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error(error.message || 'Failed to complete onboarding');
    } finally {
      if (mountedRef.current) {
        setSubmitting(false);
      }
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
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-gray-800 px-6 py-8">
            <div className="text-center">
              <div className="mb-4">
                <svg className="mx-auto h-16 w-16 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Congratulations, {user?.name}!
              </h1>
              <p className="text-gray-300 text-lg">
                You've successfully completed your profile setup
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* User Info Card */}
              <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Overview</h3>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="relative h-20 w-20">
                      {imageLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 rounded-full">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-gray-600"></div>
                        </div>
                      )}
                      <img
                        src={imageUrl || DEFAULT_AVATAR}
                        alt="Profile"
                        className={`h-20 w-20 rounded-full object-cover border-2 border-white shadow transition-opacity duration-300 ${
                          imageLoading ? 'opacity-0' : 'opacity-100'
                        }`}
                        onLoad={handleImageLoad}
                        onError={handleImageError}
                      />
                    </div>
                    <div className="absolute bottom-0 right-0 bg-green-500 rounded-full p-1">
                      <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-medium text-gray-900">{user?.name}</h3>
                    <p className="text-gray-600">{userData?.personalInfo?.data?.phone}</p>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Next Steps</h3>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-gray-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-gray-700">Browse available jobs</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-gray-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-gray-700">Set up job alerts</span>
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-gray-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-gray-700">Complete your profile verification</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Action Button */}
            <div className="mt-8 text-center">
              <button
                onClick={handleComplete}
                disabled={submitting}
                className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 ${
                  submitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Completing...
                  </>
                ) : (
                  'Go to Dashboard'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Complete;
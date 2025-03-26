import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingLayout from './OnboardingLayout';
import { useAuth } from '../../context/AuthContext';

function Complete() {
  const navigate = useNavigate();
  const { updateOnboardingStatus, user, api } = useAuth();
  const [onboardingData, setOnboardingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOnboardingData = async () => {
      try {
        const response = await api.get('/users/onboarding');
        console.log('Fetched onboarding data:', response.data);
        
        if (response.data.success) {
          // Set the data directly from the response
          setOnboardingData(response.data.data);
        } else {
          setError('Failed to fetch onboarding data');
        }
      } catch (err) {
        console.error('Error fetching onboarding data:', err);
        if (err.message === 'No authentication token found' || err.response?.status === 401) {
          navigate('/login', { 
            state: { 
              from: '/onboarding/complete',
              message: 'Please log in to view your profile.'
            },
            replace: true
          });
        } else {
          setError('Failed to fetch onboarding data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOnboardingData();
  }, [navigate, api]);

  const handleEdit = (section) => {
    switch (section) {
      case 'personalInfo':
        navigate('/onboarding/personal-info');
        break;
      case 'professionalInfo':
        navigate('/onboarding/professional-info');
        break;
      case 'skills':
        navigate('/onboarding/skills');
        break;
      case 'preferences':
        navigate('/onboarding/preferences');
        break;
      default:
        break;
    }
  };

  const handleComplete = async () => {
    try {
      // First, mark the onboarding as complete
      const response = await api.put('/users/onboarding/complete', {
        completed: true,
        data: onboardingData
      });

      if (response.data.success) {
        // Update the user's onboarding status in the context
        await updateOnboardingStatus({ completed: true }, 'complete');
        navigate('/dashboard_employee');
      } else {
        setError('Failed to complete onboarding');
      }
    } catch (err) {
      console.error('Error completing onboarding:', err);
      setError('Failed to complete onboarding');
    }
  };

  if (loading) {
    return (
      <OnboardingLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </OnboardingLayout>
    );
  }

  if (error) {
    return (
      <OnboardingLayout>
        <div className="max-w-2xl mx-auto">
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        </div>
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Congratulations! 🎉</h2>
          <p className="text-lg text-gray-600">
            You've successfully completed your profile setup. Here's a summary of your information:
          </p>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900">Personal Information</h3>
            <button
              onClick={() => handleEdit('personalInfo')}
              className="text-blue-600 hover:text-blue-800"
            >
              Edit
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">
                {onboardingData?.personalInfo?.data?.firstName} {onboardingData?.personalInfo?.data?.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{onboardingData?.personalInfo?.data?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium">{onboardingData?.personalInfo?.data?.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Address</p>
              <p className="font-medium">
                {onboardingData?.personalInfo?.data?.address?.street}, {onboardingData?.personalInfo?.data?.address?.city}, {onboardingData?.personalInfo?.data?.address?.state} {onboardingData?.personalInfo?.data?.address?.zipCode}
              </p>
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900">Professional Information</h3>
            <button
              onClick={() => handleEdit('professionalInfo')}
              className="text-blue-600 hover:text-blue-800"
            >
              Edit
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Current Title</p>
              <p className="font-medium">{onboardingData?.professionalInfo?.data?.currentTitle}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Years of Experience</p>
              <p className="font-medium">{onboardingData?.professionalInfo?.data?.yearsOfExperience} years</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Desired Title</p>
              <p className="font-medium">{onboardingData?.professionalInfo?.data?.desiredTitle}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Employment Type</p>
              <p className="font-medium">{onboardingData?.professionalInfo?.data?.employmentType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Work Authorization</p>
              <p className="font-medium">{onboardingData?.professionalInfo?.data?.workAuthorization}</p>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900">Skills & Qualifications</h3>
            <button
              onClick={() => handleEdit('skills')}
              className="text-blue-600 hover:text-blue-800"
            >
              Edit
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-2">Technical Skills</p>
              <div className="flex flex-wrap gap-2">
                {onboardingData?.skills?.data?.technical?.map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">Soft Skills</p>
              <div className="flex flex-wrap gap-2">
                {onboardingData?.skills?.data?.soft?.map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">Languages</p>
              <div className="flex flex-wrap gap-2">
                {onboardingData?.skills?.data?.languages?.map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">Certifications</p>
              <div className="flex flex-wrap gap-2">
                {onboardingData?.skills?.data?.certifications?.map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900">Job Preferences</h3>
            <button
              onClick={() => handleEdit('preferences')}
              className="text-blue-600 hover:text-blue-800"
            >
              Edit
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-2">Work Arrangement</p>
              <div className="flex flex-wrap gap-2">
                {onboardingData?.preferences?.data?.jobPreferences?.remoteWork && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Remote Work</span>
                )}
                {onboardingData?.preferences?.data?.jobPreferences?.hybridWork && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Hybrid Work</span>
                )}
                {onboardingData?.preferences?.data?.jobPreferences?.onsiteWork && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">On-site Work</span>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">Work Schedule</p>
              <div className="flex flex-wrap gap-2">
                {onboardingData?.preferences?.data?.jobPreferences?.flexibleHours && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Flexible Hours</span>
                )}
                {onboardingData?.preferences?.data?.jobPreferences?.fixedHours && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Fixed Hours</span>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">Industry Preferences</p>
              <div className="flex flex-wrap gap-2">
                {onboardingData?.preferences?.data?.industryPreferences?.map((industry, index) => (
                  <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                    {industry}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">Work Culture</p>
              <div className="flex flex-wrap gap-2">
                {onboardingData?.preferences?.data?.workCulture?.map((culture, index) => (
                  <span key={index} className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                    {culture}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">Desired Benefits</p>
              <div className="flex flex-wrap gap-2">
                {onboardingData?.preferences?.data?.benefits?.map((benefit, index) => (
                  <span key={index} className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                    {benefit}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Availability</p>
              <div className="mt-2 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Start Date</p>
                  <p className="font-medium">{onboardingData?.preferences?.data?.availability?.startDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Hours per Week</p>
                  <p className="font-medium">{onboardingData?.preferences?.data?.availability?.hoursPerWeek}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Complete Button */}
        <div className="flex justify-center">
          <button
            onClick={handleComplete}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Complete Profile
          </button>
        </div>
      </div>
    </OnboardingLayout>
  );
}

export default Complete; 
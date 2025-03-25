import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingLayout from './OnboardingLayout';
import { useAuth } from '../../context/AuthContext';

function Complete() {
  const navigate = useNavigate();
  const { updateOnboardingStatus, user } = useAuth();
  const [onboardingData, setOnboardingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOnboardingData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/users/onboarding', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await response.json();
        if (data.success) {
          setOnboardingData(data.data);
        } else {
          setError('Failed to fetch onboarding data');
        }
      } catch (err) {
        console.error('Error fetching onboarding data:', err);
        setError('Failed to fetch onboarding data');
      } finally {
        setLoading(false);
      }
    };

    fetchOnboardingData();
  }, []);

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
      const response = await updateOnboardingStatus('complete', {
        completed: true,
        data: onboardingData
      });

      if (response.success) {
        navigate('/login');
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
              <p className="font-medium">{onboardingData?.personalInfo?.firstName} {onboardingData?.personalInfo?.lastName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{onboardingData?.personalInfo?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium">{onboardingData?.personalInfo?.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Address</p>
              <p className="font-medium">
                {onboardingData?.personalInfo?.address?.street}, {onboardingData?.personalInfo?.address?.city}, {onboardingData?.personalInfo?.address?.state} {onboardingData?.personalInfo?.address?.zipCode}
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
              <p className="font-medium">{onboardingData?.professionalInfo?.currentTitle}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Years of Experience</p>
              <p className="font-medium">{onboardingData?.professionalInfo?.yearsOfExperience} years</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Desired Title</p>
              <p className="font-medium">{onboardingData?.professionalInfo?.desiredTitle}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Employment Type</p>
              <p className="font-medium">{onboardingData?.professionalInfo?.employmentType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Work Authorization</p>
              <p className="font-medium">{onboardingData?.professionalInfo?.workAuthorization}</p>
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
                {onboardingData?.skills?.technical?.map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">Soft Skills</p>
              <div className="flex flex-wrap gap-2">
                {onboardingData?.skills?.soft?.map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">Languages</p>
              <div className="flex flex-wrap gap-2">
                {onboardingData?.skills?.languages?.map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">Certifications</p>
              <div className="flex flex-wrap gap-2">
                {onboardingData?.skills?.certifications?.map((skill, index) => (
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
                {onboardingData?.preferences?.jobPreferences?.remoteWork && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Remote Work</span>
                )}
                {onboardingData?.preferences?.jobPreferences?.hybridWork && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Hybrid Work</span>
                )}
                {onboardingData?.preferences?.jobPreferences?.onsiteWork && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">On-site Work</span>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">Industry Preferences</p>
              <div className="flex flex-wrap gap-2">
                {onboardingData?.preferences?.industryPreferences?.map((industry, index) => (
                  <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    {industry}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">Work Culture</p>
              <div className="flex flex-wrap gap-2">
                {onboardingData?.preferences?.workCulture?.map((culture, index) => (
                  <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                    {culture}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-2">Desired Benefits</p>
              <div className="flex flex-wrap gap-2">
                {onboardingData?.preferences?.benefits?.map((benefit, index) => (
                  <span key={index} className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                    {benefit}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500">Availability</p>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <p className="text-sm text-gray-500">Start Date</p>
                  <p className="font-medium">{onboardingData?.preferences?.availability?.startDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Hours per Week</p>
                  <p className="font-medium">{onboardingData?.preferences?.availability?.hoursPerWeek}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={handleComplete}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Complete Onboarding
          </button>
        </div>
      </div>
    </OnboardingLayout>
  );
}

export default Complete; 
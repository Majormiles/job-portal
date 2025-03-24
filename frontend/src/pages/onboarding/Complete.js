import React from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingLayout from './OnboardingLayout';
import { CheckCircle } from 'react-feather';

function Complete() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/dashboard');
  };

  return (
    <OnboardingLayout>
      <div className="max-w-2xl mx-auto text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>
        
        <h2 className="text-2xl font-bold mb-4">Profile Setup Complete!</h2>
        <p className="text-gray-600 mb-8">
          Thank you for completing your profile. We've gathered all the information we need to help you find the perfect job match.
        </p>

        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">What's Next?</h3>
          <ul className="text-left space-y-3">
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
              <span>Your profile will be reviewed by our matching algorithm</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
              <span>You'll receive personalized job recommendations</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
              <span>Employers can now view your profile and contact you</span>
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleGetStarted}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => navigate('/onboarding/preferences')}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Review Profile
          </button>
        </div>
      </div>
    </OnboardingLayout>
  );
}

export default Complete; 
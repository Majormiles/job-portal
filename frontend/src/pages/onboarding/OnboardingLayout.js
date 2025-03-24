import React from 'react';
import { useLocation } from 'react-router-dom';

function OnboardingLayout({ children }) {
  const location = useLocation();
  const steps = [
    { path: '/onboarding/personal-info', label: 'Personal Info' },
    { path: '/onboarding/professional-info', label: 'Professional Info' },
    { path: '/onboarding/skills', label: 'Skills' },
    { path: '/onboarding/preferences', label: 'Preferences' },
    { path: '/onboarding/complete', label: 'Complete' }
  ];

  const currentStep = steps.findIndex(step => step.path === location.pathname);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {steps.map((step, index) => (
              <div key={step.path} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  index <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-24 h-1 mx-2 ${
                    index < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            {steps.map(step => (
              <span key={step.path}>{step.label}</span>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

export default OnboardingLayout; 
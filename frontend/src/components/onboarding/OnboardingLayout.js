import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const OnboardingLayout = ({ children }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const steps = [
    { path: 'personal-info', label: 'Personal Info', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { path: 'professional-info', label: 'Professional Info', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    { path: 'skills', label: 'Skills', icon: 'M9.663 17h4.673M12 3v1m0 16v1m9-9h-1M4 12H3m3.364-5.636l-.707-.707M17.343 6.343l.707-.707m-9.9 9.9l-.707.707M17.343 17.657l.707.707' },
    { path: 'preferences', label: 'Preferences', icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4' },
    { path: 'complete', label: 'Complete', icon: 'M5 13l4 4L19 7' }
  ];

  const currentStep = steps.findIndex(step => 
    window.location.pathname.includes(step.path)
  );

  const handleBack = () => {
    if (currentStep > 0) {
      navigate(`/onboarding/${steps[currentStep - 1].path}`);
    }
  };

  const getProgressPercentage = () => {
    return (currentStep / (steps.length - 1)) * 100;
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header with Logo and Progress */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="text-xl font-semibold text-gray-800">Profile Setup</div>
              <div className="ml-6 text-sm text-gray-500 hidden md:block">
                Step {currentStep + 1} of {steps.length}
              </div>
            </div>
            <div className="text-sm font-medium text-gray-500">
              {user?.email}
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            {/* Linear progress indicator */}
            <div className="mb-4 w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
            
            {/* Steps indicators */}
            <div className="relative flex justify-between">
              {steps.map((step, index) => (
                <div
                  key={step.path}
                  className="flex flex-col items-center"
                >
                  {/* Step connector line */}
                  {index > 0 && (
                    <div 
                      className={`absolute h-0.5 top-4 -z-10 transition-colors duration-300 ${
                        index <= currentStep ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                      style={{ 
                        left: `${(index - 1) * (100 / (steps.length - 1))}%`, 
                        right: `${100 - (index * (100 / (steps.length - 1)))}%` 
                      }}
                    ></div>
                  )}
                  
                  {/* Step circle */}
                  <div
                    className={`relative z-10 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300 ${
                      index < currentStep
                        ? 'bg-blue-600 text-white'
                        : index === currentStep
                        ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                        : 'bg-white border-2 border-gray-300 text-gray-500'
                    }`}
                  >
                    {index < currentStep ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  
                  {/* Step label with icon */}
                  <div className="mt-2 flex flex-col items-center">
                    <span className={`text-xs font-medium sm:text-sm ${
                      index <= currentStep ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {step.label}
                    </span>
                    
                    {/* Step icon on mobile */}
                    <svg 
                      className={`w-4 h-4 mt-1 md:hidden ${
                        index <= currentStep ? 'text-blue-600' : 'text-gray-400'
                      }`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={step.icon} />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-md rounded-lg p-4 sm:p-6 lg:p-8 border border-gray-100">
          {/* Back Button */}
          {currentStep > 0 && (
            <button
              onClick={handleBack}
              className="mb-6 text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium transition duration-150 ease-in-out"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to {steps[currentStep - 1].label}
            </button>
          )}

          {/* Section Title */}
          <div className="mb-6 border-b border-gray-100 pb-4">
            <h2 className="text-xl font-semibold text-gray-800">{steps[currentStep]?.label}</h2>
            <p className="mt-1 text-sm text-gray-500">
              {currentStep === 0 && "Let's get to know you better"}
              {currentStep === 1 && "Tell us about your work experience"}
              {currentStep === 2 && "What are you good at?"}
              {currentStep === 3 && "Customize your experience"}
              {currentStep === 4 && "You're all set!"}
            </p>
          </div>

          {/* Page Content */}
          <div className="w-full">
            {children}
          </div>
          
          {/* Step navigation help */}
          {currentStep < steps.length - 1 && (
            <div className="mt-8 pt-4 border-t border-gray-100 text-sm text-gray-500 text-center">
              Fill out this section and click "Continue" to proceed to the next step
            </div>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Need help? <a href="#" className="text-blue-600 hover:text-blue-800">Contact support</a>
            </div>
            <div className="text-sm text-gray-500">
              {currentStep + 1} of {steps.length} completed
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default OnboardingLayout;
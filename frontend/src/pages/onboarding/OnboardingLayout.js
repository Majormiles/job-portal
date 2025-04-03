import React from 'react';
import { useLocation } from 'react-router-dom';

function OnboardingLayout({ children }) {
  const location = useLocation();
  const steps = [
    { path: '/onboarding/personal-info', label: 'Personal Info', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ) },
    { path: '/onboarding/professional-info', label: 'Professional Info', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ) },
    { path: '/onboarding/skills', label: 'Skills', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ) },
    { path: '/onboarding/preferences', label: 'Preferences', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
    ) },
    { path: '/onboarding/complete', label: 'Complete', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ) }
  ];

  const currentStep = steps.findIndex(step => step.path === location.pathname);
  
  // Calculate overall progress percentage
  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with logo placeholder */}
      <header className="bg-white shadow-sm py-4">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-8 w-32 bg-gray-200 rounded"></div> {/* Logo placeholder */}
        </div>
      </header>
      
      <main className="py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-medium text-gray-900">Complete Your Profile</h2>
              <span className="text-sm font-medium text-gray-500">
                Step {currentStep + 1} of {steps.length}
              </span>
            </div>
            
            {/* Overall progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
              <div 
                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            
            {/* Step indicators */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-between">
                {steps.map((step, index) => (
                  <div key={step.path} className="flex flex-col items-center">
                    <div 
                      className={`flex h-10 w-10 items-center justify-center rounded-full
                        ${index < currentStep 
                          ? 'bg-indigo-600 text-white' 
                          : index === currentStep 
                            ? 'bg-white border-2 border-indigo-600 text-indigo-600' 
                            : 'bg-white border-2 border-gray-300 text-gray-500'}`}
                    >
                      {index < currentStep ? (
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : step.icon}
                    </div>
                    <span className={`mt-2 text-xs sm:text-sm font-medium 
                      ${index <= currentStep ? 'text-indigo-600' : 'text-gray-500'}`}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Content container */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              {children}
            </div>
          </div>
          
          {/* Helper text */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Need help? <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">Contact support</a></p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default OnboardingLayout;
import React from 'react';
import { useLocation } from 'react-router-dom';

function OnboardingLayout({ children }) {
  const location = useLocation();
  const steps = [
    { path: '/onboarding/personal-info', label: 'Personal Info', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ) },
    { path: '/onboarding/skills', label: 'Skills', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ) },
    { path: '/onboarding/complete', label: 'Complete', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row">
            {/* Left sidebar with progress indicators */}
            <div className="w-full md:w-64 mb-8 md:mb-0 md:mr-8">
              <div className="mb-6">
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
              </div>
              
              {/* Vertical step indicators */}
              <div className="relative pl-10">
                {/* Vertical connector line */}
                <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-300" aria-hidden="true"></div>
                
                <ul className="relative space-y-10">
                  {steps.map((step, index) => (
                    <li key={step.path} className="relative flex items-center">
                      <div 
                        className={`absolute left-0 flex h-10 w-10 items-center justify-center rounded-full
                          ${index < currentStep 
                            ? 'bg-indigo-600 text-white' 
                            : index === currentStep 
                              ? 'bg-white border-2 border-indigo-600 text-indigo-600' 
                              : 'bg-white border-2 border-gray-300 text-gray-500'}`}
                      >
                        {index < currentStep ? (
                          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : step.icon}
                      </div>
                      <span className={`ml-16 text-sm font-medium whitespace-nowrap
                        ${index <= currentStep ? 'text-indigo-600' : 'text-gray-500'}`}>
                        {step.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Right side content */}
            <div className="flex-1">
              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:p-6">
                  {children}
                </div>
              </div>
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
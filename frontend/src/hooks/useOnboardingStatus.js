import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';

export const useOnboardingStatus = () => {
  const [loading, setLoading] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const navigate = useNavigate();
  const { user, checkOnboardingStatus, isAuthenticated } = useAuth();
  const shouldCheckRef = useRef(true);

  useEffect(() => {
    const checkStatus = async () => {
      // Don't check if not authenticated or if we've already checked
      if (!isAuthenticated || !shouldCheckRef.current) {
        setLoading(false);
        return;
      }
      
      try {
        const status = await checkOnboardingStatus(true);
        
        // Get the onboarding status
        const isOnboardingComplete = status?.isComplete;
        
        setIsComplete(isOnboardingComplete);
        setLoading(false);
        
        // Prevent further checks until needed
        shouldCheckRef.current = false;
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        // Only show error toast if it's not a "No auth token" error
        if (error.message !== 'No auth token found') {
          toast.error('Failed to check onboarding status');
        }
        setLoading(false);
      }
    };

    checkStatus();

    // Cleanup function
    return () => {
      shouldCheckRef.current = false;
    };
  }, [checkOnboardingStatus, isAuthenticated]);

  const redirectIfIncomplete = () => {
    if (!loading && !isComplete && isAuthenticated) {
      navigate('/onboarding/personal-info', { replace: true });
    }
  };

  const redirectIfComplete = () => {
    if (!loading && isComplete && isAuthenticated) {
      // Determine which dashboard to redirect to based on user role
      const isEmployer = user?.role === 'employer' || 
                        (typeof user?.role === 'object' && user?.role?.name === 'employer') ||
                        user?.userType === 'employer' ||
                        localStorage.getItem('registrationData') && 
                        JSON.parse(localStorage.getItem('registrationData'))?.userType === 'employer';
      
      console.log('useOnboardingStatus redirecting to dashboard for role:', isEmployer ? 'employer' : 'job seeker');
      
      // Navigate to the appropriate dashboard
      if (isEmployer) {
        navigate('/dashboard-employer', { replace: true });
      } else {
        navigate('/dashboard-jobseeker', { replace: true });
      }
    }
  };

  const completeOnboarding = async () => {
    try {
      // Logic to complete onboarding
      // ...

      // Determine which dashboard to redirect to based on user role
      const isEmployer = user?.role === 'employer' || 
                        (typeof user?.role === 'object' && user?.role?.name === 'employer') ||
                        user?.userType === 'employer' ||
                        localStorage.getItem('registrationData') && 
                        JSON.parse(localStorage.getItem('registrationData'))?.userType === 'employer';
      
      console.log('Onboarding hook redirecting to dashboard for role:', isEmployer ? 'employer' : 'job seeker');
      
      // Navigate to the appropriate dashboard
      if (isEmployer) {
        navigate('/dashboard-employer', { replace: true });
      } else {
        navigate('/dashboard-jobseeker', { replace: true });
      }
    } catch (error) {
      // Error handling
      // ...
    }
  };

  return {
    loading,
    isComplete,
    redirectIfIncomplete,
    redirectIfComplete,
    completeOnboarding
  };
}; 
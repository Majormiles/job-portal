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
      navigate('/dashboard_employee', { replace: true });
    }
  };

  return {
    loading,
    isComplete,
    redirectIfIncomplete,
    redirectIfComplete
  };
}; 
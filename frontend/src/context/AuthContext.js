import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null,
    userType: null,
    onboardingStatus: {
      isComplete: false,
      personalInfo: false,
      education: false,
      experience: false,
      skills: false,
      preferences: false
    },
    currentOnboardingStep: null
  });

  const [loading, setLoading] = useState(true);

  // Check token expiration and refresh if needed
  const checkTokenExpiration = async (token) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/verify-token', { token });
      return response.data.valid;
    } catch (error) {
      return false;
    }
  };

  // Refresh token
  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      const response = await axios.post('http://localhost:5000/api/auth/refresh-token', {
        refreshToken
      });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      return response.data.token;
    } catch (error) {
      logout();
      return null;
    }
  };

  // Check auth status on mount and token changes
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user') || sessionStorage.getItem('user');

        if (token && userData) {
          // Check if token is valid
          const isValid = await checkTokenExpiration(token);
          
          if (!isValid) {
            // Try to refresh token
            const newToken = await refreshToken();
            if (!newToken) {
              throw new Error('Token refresh failed');
            }
          }

          const parsedUser = JSON.parse(userData);
          
          // Check onboarding status
          try {
            const onboardingResponse = await axios.get('http://localhost:5000/api/users/onboarding-status', {
              headers: { 'Authorization': `Bearer ${token}` }
            });

            const onboardingStatus = onboardingResponse.data.data;
            
            // Determine current onboarding step
            let currentStep = null;
            if (!onboardingStatus.isComplete) {
              if (!onboardingStatus.personalInfo) currentStep = 'personal-info';
              else if (!onboardingStatus.education) currentStep = 'education';
              else if (!onboardingStatus.experience) currentStep = 'experience';
              else if (!onboardingStatus.skills) currentStep = 'skills';
              else if (!onboardingStatus.preferences) currentStep = 'preferences';
            }

            setAuthState({
              isAuthenticated: true,
              user: parsedUser,
              userType: parsedUser.role || 'job_seeker',
              onboardingStatus,
              currentOnboardingStep: currentStep
            });
          } catch (error) {
            console.error('Error checking onboarding status:', error);
            // If onboarding status check fails, set default state
            setAuthState({
              isAuthenticated: true,
              user: parsedUser,
              userType: parsedUser.role || 'job_seeker',
              onboardingStatus: {
                isComplete: false,
                personalInfo: false,
                education: false,
                experience: false,
                skills: false,
                preferences: false
              },
              currentOnboardingStep: 'personal-info'
            });
          }
        } else {
          // Clear any partial state if no valid auth data
          setAuthState({
            isAuthenticated: false,
            user: null,
            userType: null,
            onboardingStatus: {
              isComplete: false,
              personalInfo: false,
              education: false,
              experience: false,
              skills: false,
              preferences: false
            },
            currentOnboardingStep: null
          });
        }
      } catch (error) {
        console.error('Auth status check failed:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();

    // Set up an interval to check token expiration every 5 minutes
    const interval = setInterval(checkAuthStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const login = async (email, password, rememberMe = false) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });

      const { token, refreshToken, user } = response.data;
      
      // Store auth data
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      if (rememberMe) {
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        sessionStorage.setItem('user', JSON.stringify(user));
      }

      // Set initial auth state
      setAuthState({
        isAuthenticated: true,
        user,
        userType: user.role || 'job_seeker',
        onboardingStatus: {
          isComplete: false,
          personalInfo: false,
          education: false,
          experience: false,
          skills: false,
          preferences: false
        },
        currentOnboardingStep: 'personal-info'
      });

      // Check onboarding status after setting auth state
      try {
        const onboardingResponse = await axios.get('http://localhost:5000/api/users/onboarding-status', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        const onboardingStatus = onboardingResponse.data.data;
        
        // Determine current onboarding step
        let currentStep = null;
        if (!onboardingStatus.isComplete) {
          if (!onboardingStatus.personalInfo) currentStep = 'personal-info';
          else if (!onboardingStatus.education) currentStep = 'education';
          else if (!onboardingStatus.experience) currentStep = 'experience';
          else if (!onboardingStatus.skills) currentStep = 'skills';
          else if (!onboardingStatus.preferences) currentStep = 'preferences';
        }

        setAuthState(prev => ({
          ...prev,
          onboardingStatus,
          currentOnboardingStep: currentStep
        }));

        return { success: true, onboardingStatus };
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        // If onboarding status check fails, assume onboarding is not complete
        return { 
          success: true, 
          onboardingStatus: {
            isComplete: false,
            personalInfo: false,
            education: false,
            experience: false,
            skills: false,
            preferences: false
          }
        };
      }
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', userData);
      const { token, refreshToken, user } = response.data;

      // Store auth data
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      setAuthState({
        isAuthenticated: true,
        user,
        userType: user.role || 'job_seeker',
        onboardingStatus: {
          isComplete: false,
          personalInfo: false,
          education: false,
          experience: false,
          skills: false,
          preferences: false
        },
        currentOnboardingStep: 'personal-info'
      });

      return { success: true };
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    // Clear all auth data
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');

    // Reset auth state
    setAuthState({
      isAuthenticated: false,
      user: null,
      userType: null,
      onboardingStatus: {
        isComplete: false,
        personalInfo: false,
        education: false,
        experience: false,
        skills: false,
        preferences: false
      },
      currentOnboardingStep: null
    });
  };

  const updateOnboardingStatus = async (step, data) => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      // If no token in localStorage, try to get from sessionStorage
      if (!token) {
        const sessionToken = sessionStorage.getItem('token');
        if (sessionToken) {
          localStorage.setItem('token', sessionToken);
        } else {
          throw new Error('No authentication token found');
        }
      }

      // Verify token is valid
      const isValid = await checkTokenExpiration(token);
      if (!isValid) {
        const newToken = await refreshToken();
        if (!newToken) {
          throw new Error('Token refresh failed');
        }
      }

      // Get the current token (either original or refreshed)
      const currentToken = localStorage.getItem('token') || sessionStorage.getItem('token');

      const response = await axios.put(
        `http://localhost:5000/api/users/onboarding/${step}`,
        data,
        {
          headers: { 
            'Authorization': `Bearer ${currentToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const updatedStatus = response.data.data;
      
      // Determine current onboarding step
      let currentStep = null;
      if (!updatedStatus.isComplete) {
        if (!updatedStatus.personalInfo) currentStep = 'personal-info';
        else if (!updatedStatus.education) currentStep = 'education';
        else if (!updatedStatus.experience) currentStep = 'experience';
        else if (!updatedStatus.skills) currentStep = 'skills';
        else if (!updatedStatus.preferences) currentStep = 'preferences';
      }

      setAuthState(prev => ({
        ...prev,
        onboardingStatus: updatedStatus,
        currentOnboardingStep: currentStep
      }));

      return { success: true, onboardingStatus: updatedStatus };
    } catch (error) {
      console.error('Error updating onboarding status:', error);
      if (error.response?.status === 401) {
        // Token expired or invalid, try to refresh
        const newToken = await refreshToken();
        if (newToken) {
          // Retry the request with new token
          return updateOnboardingStatus(step, data);
        }
      }
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      ...authState,
      loading,
      login,
      register,
      logout,
      updateOnboardingStatus
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 
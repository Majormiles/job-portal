import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Debug logging function
const debugLog = (message, data = null) => {
  console.log(`[AuthContext] ${message}`, data ? data : '');
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Create axios instance with interceptors
  const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    timeout: 10000, // 10 second timeout
    withCredentials: false // Disable credentials for now
  });

  // Add request interceptor
  api.interceptors.request.use(
    (config) => {
      debugLog('Making request to:', config.url);
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        debugLog('Authorization header set:', 'Bearer [REDACTED]');
      } else {
        debugLog('No token found in localStorage');
      }
      return config;
    },
    (error) => {
      debugLog('Request interceptor error:', error);
      return Promise.reject(error);
    }
  );

  // Add response interceptor
  api.interceptors.response.use(
    (response) => {
      debugLog('Response received:', response.status);
      return response;
    },
    async (error) => {
      debugLog('Response interceptor error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        config: error.config
      });
      
      if (error.response?.status === 401) {
        debugLog('Token expired or invalid, attempting refresh');
        try {
          const refreshToken = localStorage.getItem('refreshToken');
          if (!refreshToken) {
            debugLog('No refresh token found, logging out');
            await logout();
            return Promise.reject(error);
          }

          const response = await api.post('/auth/refresh-token', { refreshToken });
          debugLog('Token refresh response:', response.data);
          
          if (response.data.success) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('refreshToken', response.data.refreshToken);
            debugLog('Tokens refreshed successfully');
            return api(error.config);
          }
        } catch (refreshError) {
          debugLog('Token refresh failed:', refreshError);
          await logout();
        }
      }
      return Promise.reject(error);
    }
  );

  const initializeAuth = async () => {
    debugLog('Initializing authentication');
    try {
      const token = localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refreshToken');
      const storedUser = sessionStorage.getItem('user');

      debugLog('Stored auth data:', { 
        hasToken: !!token, 
        hasRefreshToken: !!refreshToken, 
        hasUser: !!storedUser 
      });

      if (token && storedUser) {
        debugLog('Found stored auth data, verifying token');
        try {
          const response = await api.post('/auth/verify-token', { token });
          debugLog('Token verification response:', response.data);

          if (response.data.valid) {
            setUser(JSON.parse(storedUser));
            debugLog('Token verified, user authenticated');
          } else {
            debugLog('Token invalid, clearing auth data');
            await logout();
          }
        } catch (error) {
          debugLog('Token verification failed:', error);
          await logout();
        }
      } else {
        debugLog('No stored auth data found');
        await logout();
      }
    } catch (error) {
      debugLog('Auth initialization error:', error);
      await logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    debugLog('AuthProvider mounted, initializing auth');
    initializeAuth();
  }, []);

  const login = async (email, password, rememberMe = false) => {
    debugLog('Login attempt:', { email, rememberMe });
    setLoading(true);
    setError(null);
    
    try {
      debugLog('Making login request to:', api.defaults.baseURL + '/auth/login');
      const loginData = {
        email: email.trim(),
        password: password
      };
      debugLog('Login request data:', { ...loginData, password: '[REDACTED]' });
      
      const response = await api.post('/auth/login', loginData);
      debugLog('Login response:', response.data);

      if (response.data.success) {
        const { token, refreshToken, user, onboardingStatus } = response.data;
        
        // Store tokens in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);
        debugLog('Tokens stored in localStorage:', { 
          hasToken: !!token, 
          hasRefreshToken: !!refreshToken 
        });

        // Store user data in sessionStorage
        const userData = {
          ...user,
          onboardingStatus: onboardingStatus || {
            isComplete: false,
            personalInfo: false,
            education: false,
            experience: false,
            skills: false,
            preferences: false
          }
        };
        sessionStorage.setItem('user', JSON.stringify(userData));
        debugLog('User data stored in sessionStorage:', { 
          hasUser: !!userData,
          onboardingStatus: userData.onboardingStatus 
        });

        setUser(userData);
        setError(null);
        debugLog('Login successful, user state updated');
        
        return { 
          success: true, 
          onboardingStatus: userData.onboardingStatus 
        };
      } else {
        debugLog('Login failed:', response.data.message);
        setError(response.data.message);
        return { success: false };
      }
    } catch (error) {
      // Log the full error response
      debugLog('Login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data ? JSON.parse(error.config.data) : null
        }
      });
      
      let errorMessage = 'Login failed';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.errors) {
        // Handle validation errors
        errorMessage = Object.values(error.response.data.errors).join(', ');
      } else if (error.response) {
        errorMessage = `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = 'No response from server. Please check if the server is running.';
      } else {
        errorMessage = error.message || 'Error setting up the request. Please try again.';
      }
      
      debugLog('Setting error message:', errorMessage);
      setError(errorMessage);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    debugLog('Logout initiated');
    try {
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      debugLog('localStorage cleared');

      // Clear sessionStorage
      sessionStorage.removeItem('user');
      debugLog('sessionStorage cleared');

      // Reset state
      setUser(null);
      setError(null);
      debugLog('User state reset');
    } catch (error) {
      debugLog('Logout error:', error);
    }
  };

  const updateOnboardingStatus = async (data, step) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Map frontend step names to backend section names
      const sectionMap = {
        'personal': 'personalInfo',
        'professional': 'professionalInfo',
        'skills': 'skills',
        'preferences': 'preferences',
        'complete': 'complete' // Add complete step
      };

      const section = sectionMap[step];
      if (!section) {
        throw new Error(`Invalid onboarding step: ${step}`);
      }

      // Create FormData if there are files
      let formData;
      if (data instanceof FormData) {
        formData = data;
      } else {
        formData = new FormData();
        formData.append('data', JSON.stringify(data));
      }
      formData.append('completed', 'true');

      console.log('Updating onboarding section:', section, 'with data:', data);

      const response = await api.put(
        `/users/onboarding/${section}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      console.log('Onboarding update response:', response.data);

      if (response.data.success) {
        // Update local state with the new onboarding data
        setUser(prev => ({
          ...prev,
          onboardingStatus: {
            ...prev.onboardingStatus,
            [section]: {
              completed: true,
              data: data
            }
          }
        }));
      }

      return response.data;
    } catch (error) {
      console.error('Error updating onboarding status:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    api,
    updateOnboardingStatus
  };

  return (
    <AuthContext.Provider value={value}>
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
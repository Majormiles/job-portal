import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [onboardingStatus, setOnboardingStatus] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Create axios instance with default config
  const api = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json'
    },
    withCredentials: true // Enable sending cookies
  });

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          // Set token in headers
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          
          // Fetch user data
          const userResponse = await api.get('/users/me');
          const userData = userResponse.data.data;

          setToken(storedToken);
          setUser(userData);
          setIsAuthenticated(true);
        } catch (error) {
          // Clear invalid token
          console.error('Error initializing auth:', error);
          localStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
          setToken(null);
          setUser(null);
          setIsAuthenticated(false);
          setOnboardingStatus(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Add token to requests if it exists
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setIsAuthenticated(true);
    } else {
      delete api.defaults.headers.common['Authorization'];
      setIsAuthenticated(false);
      setUser(null);
      setOnboardingStatus(null);
    }
  }, [token]);

  const checkOnboardingStatus = async (forceRefresh = false) => {
    try {
      if (!token) {
        throw new Error('No auth token found');
      }

      // If we already have a status and don't need to force refresh, return it
      if (!forceRefresh && onboardingStatus) {
        return onboardingStatus;
      }

      // Use the main api instance
      const response = await api.get('/users/onboarding-status');

      if (response.data.success) {
        const status = response.data.data;
        
        // Only update state if the status has changed
        if (JSON.stringify(status) !== JSON.stringify(onboardingStatus)) {
          // Update the status in state
          setOnboardingStatus(status);
          
          // Update user's onboarding status
          setUser(prev => ({
            ...prev,
            onboardingComplete: status.isComplete,
            onboardingStatus: status
          }));
        }
        
        return status;
      } else {
        throw new Error(response.data.message || 'Failed to get onboarding status');
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      // If we get a 401 or no token, clear auth state but DON'T redirect
      if (error.response?.status === 401 || error.message === 'No auth token found') {
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        setOnboardingStatus(null);
      }
      throw error;
    }
  };

  const login = async (credentials) => {
    try {
      let response;
      
      if (credentials.tokenId) {
        // Google OAuth login
        console.log('Attempting Google OAuth login');
        response = await api.post('/auth/google', {
          tokenId: credentials.tokenId
        });
      } else {
        // Regular login
        response = await api.post('/auth/login', credentials);
      }

      if (response.data.success) {
        const { token, user } = response.data;
        
        // Check if email is verified for regular login
        if (!credentials.tokenId && !user.isVerified) {
          throw new Error('Please verify your email before logging in');
        }

        localStorage.setItem('token', token);
        setUser(user);
        setToken(token);
        setIsAuthenticated(true);
        return response.data;
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Clear any existing tokens
      localStorage.removeItem('token');
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
      setOnboardingStatus(null);
      
      // Format error message based on the type of error
      let errorMessage = 'Authentication failed';
      
      if (error.response) {
        // Server responded with error
        errorMessage = error.response.data.message || 'Server error occurred';
      } else if (error.request) {
        // Request was made but no response
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        // Something else happened
        errorMessage = error.message || 'An unexpected error occurred';
      }
      
      throw new Error(errorMessage);
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);

      if (response.data.success) {
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        setUser(user);
        setToken(token);
        setIsAuthenticated(true);
        return response.data;
      }
    } catch (error) {
      console.error('Register error:', error);
      
      // Clear any existing tokens
      localStorage.removeItem('token');
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
      
      // Format error message based on the type of error
      let errorMessage = 'Registration failed';
      let errors = {};
      
      if (error.response) {
        // Server responded with error
        const { message, errors: serverErrors } = error.response.data;
        errorMessage = message || 'Server error occurred';
        errors = serverErrors || {};
      } else if (error.request) {
        // Request was made but no response
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        // Something else happened
        errorMessage = error.message || 'An unexpected error occurred';
      }
      
      throw new Error(errorMessage, { errors });
    }
  };

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('token');
    
    // Clear state
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setOnboardingStatus(null);
    
    // Clear headers
    delete api.defaults.headers.common['Authorization'];
  };

  const updateOnboardingStatus = async (section, data) => {
    console.log('=== AUTH CONTEXT DEBUG ===');
    console.log('Updating onboarding status for section:', section);
    console.log('Data to update:', data);

    if (!section || typeof section !== 'string') {
      throw new Error('Section parameter must be a string');
    }

    try {
      const response = await api.put(`/users/onboarding/${section}`, data);
      console.log('Update response:', response.data);

      if (response.data.success) {
        const status = response.data.data;
        setOnboardingStatus(status);
        
        // Update user's onboarding status
        setUser(prev => ({
          ...prev,
          onboardingComplete: status.isComplete,
          onboardingStatus: status
        }));
        
        return status;
      } else {
        throw new Error(response.data.message || 'Failed to update onboarding status');
      }
    } catch (error) {
      console.error('Error updating onboarding status:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        token,
        login,
        register,
        logout,
        checkOnboardingStatus,
        updateOnboardingStatus
      }}
    >
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
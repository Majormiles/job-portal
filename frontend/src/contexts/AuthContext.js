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
        console.log('Attempting regular login', credentials.isAdmin ? '(admin)' : '(user)');
        response = await api.post('/auth/login', credentials);
      }

      console.log('Login response:', {
        success: response.data.success,
        hasData: !!response.data.data,
        hasToken: !!(response.data.token || (response.data.data && response.data.data.token)),
        responseStructure: response.data
      });

      if (response.data.success) {
        // Extract token and user from response - handle both old and new formats
        let token, user;
        
        // Admin login response format (direct properties)
        if (credentials.isAdmin) {
          console.log('Processing admin login response:', response.data);
          token = response.data.token;
          user = response.data.user || {};
        }
        // New response format (data property containing user and token)
        else if (response.data.data && response.data.data.token) {
          token = response.data.data.token;
          user = response.data.data.user || {};
        } 
        // Old response format (direct token and user properties)
        else if (response.data.token) {
          token = response.data.token;
          user = response.data.user || {};
        }
        // Unexpected format
        else {
          console.error('Invalid response format - missing token:', response.data);
          throw new Error('Invalid response format from server');
        }
        
        // For admin login, don't check email verification and store separately
        if (credentials.isAdmin) {
          console.log('Admin login successful, storing admin token');
          
          // Verify the user has admin role
          if (user.role !== 'admin') {
            console.error('User does not have admin role:', user);
            throw new Error('Unauthorized. Admin access denied.');
          }
          
          localStorage.setItem('adminToken', token);
          return {
            success: true,
            token,
            user
          };
        }
        
        // For regular users, check if email is verified
        // Add null/undefined check for user and isVerified before checking
        if (!credentials.tokenId && user && user.hasOwnProperty('isVerified') && !user.isVerified) {
          throw new Error('Please verify your email before logging in');
        }

        // Store regular user token
        localStorage.setItem('token', token);
        setUser(user);
        setToken(token);
        setIsAuthenticated(true);
        
        return {
          success: true,
          token,
          user
        };
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Don't clear tokens for admin login attempts
      if (!credentials.isAdmin) {
        // Clear any existing tokens
        localStorage.removeItem('token');
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
        setOnboardingStatus(null);
      }
      
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
      let response;
      
      if (userData.tokenId) {
        // Google OAuth registration
        console.log('Attempting Google OAuth registration');
        response = await api.post('/auth/google', {
          tokenId: userData.tokenId
        });
      } else {
        // Regular registration
        console.log('Attempting regular registration');
        response = await api.post('/auth/register', userData);
      }

      console.log('Registration response:', {
        success: response.data.success,
        hasData: !!response.data.data,
        hasToken: !!(response.data.token || (response.data.data && response.data.data.token)),
        responseStructure: response.data
      });

      if (response.data.success) {
        // Extract token and user from response - handle both old and new formats
        let token, user;
        
        // New response format (data property containing user and token)
        if (response.data.data && response.data.data.token) {
          token = response.data.data.token;
          user = response.data.data.user || {};
        } 
        // Old response format (direct token and user properties)
        else if (response.data.token) {
          token = response.data.token;
          user = response.data.user || {};
        }
        // Regular registration format (no token, just user)
        else if (response.data.user) {
          user = response.data.user;
          // For regular registration, we don't get a token immediately
          // as the user needs to verify their email first
          token = null;
        }
        // Unexpected format
        else {
          console.error('Invalid response format - missing user:', response.data);
          throw new Error('Invalid response format from server');
        }

        // Store token and update state if we have a token
        if (token) {
          localStorage.setItem('token', token);
          setToken(token);
          setIsAuthenticated(true);
        }
        
        // Always update user state
        setUser(user);
        
        return {
          success: true,
          token,
          user
        };
      } else {
        throw new Error(response.data.message || 'Registration failed');
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

  // Add function to update user settings and sync across components
  const updateUserSettings = async (settingsData) => {
    try {
      console.log('Updating user settings:', settingsData);
      const response = await api.put('/users/settings', settingsData);
      
      if (response.data.success) {
        // Update the user object with new settings
        setUser(prev => ({
          ...prev,
          ...response.data.data
        }));
        
        // Fetch fresh user data to ensure all components have access to the latest state
        const userResponse = await api.get('/users/me');
        if (userResponse.data.success) {
          setUser(userResponse.data.data);
        }
        
        return response.data;
      } else {
        throw new Error(response.data.message || 'Failed to update user settings');
      }
    } catch (error) {
      console.error('Error updating user settings:', error);
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
        updateOnboardingStatus,
        updateUserSettings,
        setUser,
        api
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
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Info } from 'lucide-react';
import { useAuth } from '../../../../contexts/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [debugMsg, setDebugMsg] = useState('');

  // Check if user is already logged in as admin
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const adminUser = localStorage.getItem('adminUser');
    
    if (token && adminUser) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  // Check server health before login
  const checkServerHealth = async () => {
    setDebugMsg('Checking server health...');
    try {
      // Try to ping the server
      const response = await axios.get(`${API_URL}/health`, { timeout: 5000 });
      setDebugMsg(`Server status: ${response.status}. Response: ${JSON.stringify(response.data)}`);
      return true;
    } catch (error) {
      setDebugMsg(`Server health check failed: ${error.message}`);
      if (error.response) {
        setDebugMsg(`Server responded with ${error.response.status}: ${JSON.stringify(error.response.data || {})}`);
      } else if (error.request) {
        setDebugMsg('No response received from server. Server may be down.');
      }
      return false;
    }
  };

  // Function to manually create a JWT token for admin login bypass
  // This is for development use when the backend is not correctly configured
  const createManualAuthToken = (userInfo) => {
    // This is a simplified token creation just for development purposes
    // In production, tokens should only come from the backend
    
    // Create a base64 encoded header
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    
    // Create a payload with admin user info and standard JWT claims
    const payload = btoa(JSON.stringify({
      sub: userInfo._id || 'admin-user-id',
      name: userInfo.name || 'Admin User',
      email: userInfo.email,
      role: 'admin',
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours from now
      iat: Math.floor(Date.now() / 1000)
    }));
    
    // In a real JWT, there would be a signature here
    // This is just for development, so we'll use a placeholder
    const signature = btoa('development-signature');
    
    return `${header}.${payload}.${signature}`;
  };

  // Direct admin login that bypasses AuthContext if needed
  const directAdminLogin = async (email, password) => {
    try {
      console.log('Attempting direct admin login...');
      
      if (isDebugMode) {
        setDebugMsg('Making admin login request...');
      }
      
      // Use a single admin login endpoint
      const loginEndpoint = `${API_URL}/auth/login`;
      
      // Standard login payload with admin flag
      const loginPayload = { 
        email, 
        password,
        isAdmin: true 
      };
      
      if (isDebugMode) {
        setDebugMsg(`Trying endpoint: ${loginEndpoint} with payload: ${JSON.stringify({ ...loginPayload, password: '****' })}`);
      }
      
      // Make the login request
      const response = await axios({
        method: 'POST',
        url: loginEndpoint,
        data: loginPayload,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 10000
      });
      
      if (isDebugMode) {
        setDebugMsg(`Login response: ${JSON.stringify(response.data, null, 2)}`);
      }
      
      console.log('Direct login response:', response.data);
      
      // Extract token and user data (handle different response formats)
      let token, user;
      
      if (response.data.data) {
        // Format: { success: true, data: { token, user } }
        token = response.data.data.token;
        user = response.data.data.user;
      } else {
        // Format: { success: true, token, user }
        token = response.data.token;
        user = response.data.user;
      }
      
      if (!token) {
        throw new Error('Invalid response format - missing token');
      }
      
      if (!user) {
        throw new Error('Invalid response format - missing user data');
      }
      
      // Verify the user has admin role - check roleName since role is an ObjectId
      const userRoleName = (user.roleName || '').toLowerCase();
      const isAdmin = userRoleName === 'admin';
      
      console.log('User privilege check:', { 
        role: user.role, 
        roleName: user.roleName,
        isAdmin: isAdmin 
      });
      
      if (!isAdmin) {
        console.error('User does not have admin privileges:', { role: user.role, roleName: user.roleName });
        throw new Error('User does not have admin privileges');
      }
      
      // Store token and user data in localStorage
      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminUser', JSON.stringify(user));
      
      return { success: true, token, user };
    } catch (error) {
      console.error('Direct admin login failed:', error);
      
      // Format error message
      let errorMessage = 'Login failed. Please try again.';
      let debugDetails = '';
      
      if (error.response) {
        debugDetails = `Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data || {})}`;
        
        if (error.response.status === 401) {
          errorMessage = 'Invalid credentials. Please verify your email and password.';
        } else if (error.response.status === 403) {
          errorMessage = 'Account does not have admin privileges.';
        } else if (error.response.status === 500) {
          errorMessage = 'Server error. The admin login route may not be properly implemented.';
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        debugDetails = 'No response received from server';
        errorMessage = 'Server not responding. Please try again later.';
      } else if (error.message) {
        debugDetails = error.message;
        errorMessage = error.message;
      }
      
      if (isDebugMode) {
        setDebugMsg(`Login failed: ${debugDetails}`);
      }
      
      throw new Error(errorMessage);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setDebugMsg('');

    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    try {
      console.log('=== ADMIN LOGIN ATTEMPT ===');
      console.log('Form data:', {
        email: formData.email,
        password: '***********'
      });
      
      // Check server health in debug mode
      if (isDebugMode) {
        await checkServerHealth();
      }
      
      // Try direct approach first since we're having issues with the context approach
      const result = await directAdminLogin(formData.email.trim(), formData.password);
      
      console.log('Admin login successful:', {
        userName: result.user.name,
        userEmail: result.user.email,
        userRole: result.user.role
      });
      
      toast.success('Admin login successful!');
      navigate('/admin/dashboard');
    } catch (err) {
      console.error('Admin login error:', err);
      
      setError(err.message || 'Invalid email or password. Please try again.');
      toast.error('Admin access denied. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Development mode bypass for admin login
  const handleDevBypass = () => {
    if (process.env.NODE_ENV === 'development' || process.env.REACT_APP_ENV === 'development') {
      console.log('=== DEVELOPMENT MODE ADMIN BYPASS ===');
      
      // Create an admin user object
      const adminUser = {
        _id: 'dev-admin-id',
        name: 'Development Admin',
        email: 'admin@dev.local',
        role: 'admin',
        roleName: 'admin'
      };
      
      // Create a token using the manual token creation function
      const token = createManualAuthToken(adminUser);
      
      // Store token and user data in localStorage
      localStorage.setItem('adminToken', token);
      localStorage.setItem('adminUser', JSON.stringify(adminUser));
      
      console.log('Dev bypass login successful, redirecting to dashboard');
      toast.success('Development mode admin access granted!');
      navigate('/admin/dashboard');
    } else {
      toast.error('Development mode bypass only works in development environment');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ background: '#f8f9fa' }}>
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to access the admin dashboard
          </p>
        </div>
        
        <div className="bg-white p-8 shadow-lg rounded-lg">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Admin email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Admin password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#2A9D8F', borderColor: '#2A9D8F' }}
              >
                {isLoading ? 'Signing in...' : 'Sign in to Admin'}
              </button>
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <button
                type="button"
                onClick={() => setIsDebugMode(!isDebugMode)}
                className="text-sm text-gray-500 hover:text-teal-600 flex items-center"
              >
                <Info className="h-4 w-4 mr-1" />
                {isDebugMode ? 'Hide Diagnostics' : 'Show Diagnostics'}
              </button>
              
              {isDebugMode && (
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={checkServerHealth}
                    className="text-sm text-teal-600 hover:text-teal-800"
                  >
                    Check Server Status
                  </button>
                  
                  {(process.env.NODE_ENV === 'development' || process.env.REACT_APP_ENV === 'development') && (
                    <button
                      type="button"
                      onClick={handleDevBypass}
                      className="text-sm bg-orange-100 text-orange-700 hover:bg-orange-200 px-2 py-1 rounded"
                    >
                      Dev Bypass
                    </button>
                  )}
                </div>
              )}
            </div>
            
            {isDebugMode && debugMsg && (
              <div className="mt-4 p-3 bg-gray-50 rounded text-xs font-mono text-gray-800 overflow-auto max-h-40">
                <pre className="whitespace-pre-wrap">{debugMsg}</pre>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin; 
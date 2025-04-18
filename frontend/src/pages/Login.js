import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Get the redirect path from location state, default to home
  const from = location.state?.from || '/';

  const [showVerificationNotice, setShowVerificationNotice] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');

  useEffect(() => {
    // Check if coming from registration with verification notice
    if (location.state?.verificationRequired) {
      setShowVerificationNotice(true);
      setVerificationEmail(location.state.email || '');
    }
  }, [location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Create login data with trimmed values
      const loginData = {
        email: formData.email.trim()
      };
      
      // Call login with the email-only loginData object
      const response = await login(loginData);
      console.log('Login successful:', response);
      toast.success('Login successful!');
      
      // Check if user needs to complete onboarding
      if (response.user && !response.user.onboardingComplete) {
        navigate('/onboarding/personal-info');
      } else {
        // Determine which dashboard to redirect to based on user role
        const isEmployer = response.user?.role === 'employer' || 
                        (typeof response.user?.role === 'object' && response.user?.role?.name === 'employer') ||
                        response.user?.userType === 'employer' ||
                        localStorage.getItem('registrationData') && 
                        JSON.parse(localStorage.getItem('registrationData'))?.userType === 'employer';
        
        console.log('Login redirecting to dashboard for role:', isEmployer ? 'employer' : 'job seeker');
        
        // Navigate to the appropriate dashboard
        if (isEmployer) {
          navigate('/dashboard-employer');
        } else {
          navigate('/dashboard-jobseeker');
        }
      }
    } catch (err) {
      // More robust error handling
      console.error('Login error:', err);
      let errorMessage = 'Invalid email. Please try again.';
      
      if (err.message) {
        // Check for specific error messages we want to display directly
        if (err.message.includes('verify your email')) {
          errorMessage = err.message;
        } else if (err.message.includes('Authentication failed')) {
          errorMessage = 'Authentication failed. Please check your email.';
        } else if (err.message.includes('Server error')) {
          errorMessage = 'Server error. Please try again later.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!verificationEmail) {
      toast.error('Email address is required.');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.post(`${API_URL}/auth/resend-verification`, { 
        email: verificationEmail 
      });
      
      if (response.data && response.data.success) {
        toast.success('Verification email sent! Please check your inbox.');
      } else {
        toast.error(response.data?.message || 'Failed to send verification email.');
      }
    } catch (error) {
      console.error('Error resending verification:', error);
      toast.error('Failed to send verification email. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg p-8">
        <div className="flex justify-center mb-6">
          <Link to="/" className="inline-block">
            <div className="w-12 h-12 bg-blue-500 rounded-md flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </Link>
        </div>
        
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">
          Welcome Back!
        </h2>
        
        <p className="text-center text-gray-600 mb-6">
          Enter your email to sign in to your account
        </p>
        
        <div className="mb-6 p-3 bg-blue-100 border border-blue-300 text-blue-700 rounded text-sm">
          We've simplified login! Just enter your email address to continue.
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        {/* Email Verification Notice */}
        {showVerificationNotice && (
          <div className="mb-6 p-4 bg-blue-50 text-blue-700 rounded-lg">
            <h3 className="font-medium">Email Verification Required</h3>
            <p className="text-sm mt-1">
              {location.state?.message || 'Please verify your email before logging in.'}
            </p>
            <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-2">
              <button
                type="button"
                onClick={handleResendVerification}
                className="text-sm text-blue-700 hover:text-blue-900 font-medium underline"
              >
                Resend verification email
              </button>
              <span className="hidden sm:inline text-gray-400">•</span>
              <Link
                to="/verify-email"
                className="text-sm text-blue-700 hover:text-blue-900 font-medium underline"
              >
                Enter verification code manually
              </Link>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="email"
              id="email"
              name="email"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <p className="text-sm text-gray-600 text-center">
            Enter your email to sign in securely to your account.
          </p>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-3 rounded-md font-medium hover:bg-blue-600 transition duration-300"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          
          <p className="text-center text-sm text-gray-600 mt-4">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-800 font-medium">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
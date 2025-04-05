import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import registerImage1 from '../assets/images/login.png';
import registerImage2 from '../assets/images/happybusiness-woman2.jpg';
import registerImage3 from '../assets/images/pexels.jpg';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import GoogleOAuthButton from '../components/GoogleOAuthButton';

// ScrollToTop component to handle scrolling on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, login } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // New state for image rotation
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [nextImageIndex, setNextImageIndex] = useState(1);
  const images = [registerImage1, registerImage2, registerImage3];

  useEffect(() => {
    // Set up interval to change image every 5 seconds
    const imageInterval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
      setNextImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 4000);

    // Clean up interval on component unmount
    return () => clearInterval(imageInterval);
  }, []);

  const handleGoogleLogin = async (response) => {
    try {
      setLoading(true);
      setError('');

      console.log('Google registration response received');
      
      if (!response.credential) {
        throw new Error('No credential received from Google');
      }

      // Log the response for debugging
      console.log('Google response:', {
        credential: response.credential.substring(0, 20) + '...',
        select_by: response.select_by,
        g_csrf_token: response.g_csrf_token
      });

      // Show a loading toast during registration
      const loadingToastId = toast.loading('Creating your account...');

      try {
        const result = await login({ tokenId: response.credential });
        
        toast.dismiss(loadingToastId);
        
        if (!result || !result.user) {
          throw new Error('Invalid registration response');
        }

        // Redirect to onboarding
        navigate('/onboarding/personal-info', { replace: true });
        toast.success('Registration successful! Please complete your profile.');
      } catch (apiError) {
        toast.dismiss(loadingToastId);
        console.error('API error during Google registration:', apiError);
        
        // Handle specific backend errors
        if (apiError.response) {
          const { status, data } = apiError.response;
          
          if (status === 401) {
            setError('Authentication failed. Please try again with a different Google account.');
            toast.error('Authentication failed. Please try again.');
          } else if (status === 409) {
            setError('An account with this email already exists. Please log in instead.');
            toast.error('Account already exists. Please log in.');
          } else if (status === 500) {
            // Get the detailed error message from the response if available
            const errorMsg = data.message || 'Server error';
            const detailedError = data.error || '';
            
            console.error('Server error details:', {
              message: errorMsg,
              error: detailedError,
              details: data.details || {}
            });
            
            setError(`Server error: ${errorMsg}${detailedError ? ': ' + detailedError : ''}`);
            
            // Show a more user-friendly error message in the toast
            toast.error('We encountered an issue creating your account. Please try again later or use email registration instead.');
          } else if (status === 400) {
            // For validation errors
            const errorMsg = data.error || data.message || 'Validation error';
            setError(`Error: ${errorMsg}`);
            toast.error(errorMsg);
          } else {
            setError(data.message || 'Failed to register with Google');
            toast.error(data.message || 'Registration failed. Please try again.');
          }
        } else {
          // Network or other client-side errors
          setError('Network error. Please check your connection and try again.');
          toast.error('Network error. Please try again.');
        }
      }
    } catch (error) {
      console.error('Google registration error:', error);
      const errorMessage = error.message || 'Failed to register with Google';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Validation function
  const validateForm = (data) => {
    const errors = {};

    // Name validation
    if (!data.name.trim()) {
      errors.name = 'Full name is required';
    }

    // Email validation
    if (!data.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!data.password) {
      errors.password = 'Password is required';
    } else if (data.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }

    // Confirm password validation
    if (!data.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (data.password !== data.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate form data
      const validationErrors = validateForm(formData);
      if (Object.keys(validationErrors).length > 0) {
        setError(validationErrors);
        setLoading(false);
        return;
      }

      // Create user data object with only the required fields
      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      };

      const response = await register(userData);
      
      if (!response || !response.user) {
        throw new Error('Invalid registration response');
      }

      // Show success message with email verification instructions
      toast.success('Registration successful! Please check your email to verify your account.');
      
      // Navigate to email verification page
      navigate('/verify-email', { 
        state: { 
          email: formData.email,
          message: 'Please check your email to verify your account before proceeding.'
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle validation errors
      if (error.errors) {
        const errorMessages = Object.values(error.errors).filter(Boolean);
        setError(errorMessages.join(', '));
        toast.error(errorMessages.join(', '));
      } else {
        // Handle other errors
        const errorMessage = error.message || 'Failed to register';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-[#fff] flex-col md:flex-row min-h-screen">
      <ScrollToTop />
      {/* Left Section - Registration Form */}
      <div className="w-full md:w-2/3 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-sm sm:max-w-md">
          {/* Logo */}
          <Link to="/">
            <div className="mb-6 sm:mb-8">
              <svg className="w-10 h-10 sm:w-12 sm:h-12 text-purple-700" viewBox="0 0 100 100" fill="currentColor">
                <path d="M50 10 L90 30 L50 50 L10 30 Z" />
                <path d="M50 50 L50 90 L10 70 L10 30 Z" />
                <path d="M50 50 L50 90 L90 70 L90 30 Z" />
              </svg>
            </div>
          </Link>

          {/* Welcome Text */}
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Create Account</h1>
          <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">Register to get unlimited access to data & information.</p>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {typeof error === 'object' ? (
                <ul className="list-disc list-inside">
                  {Object.values(error).map((err, index) => (
                    <li key={index}>{err}</li>
                  ))}
                </ul>
              ) : (
                error
              )}
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="w-full px-3 py-2 sm:py-2.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full px-3 py-2 sm:py-2.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  className="w-full px-3 py-2 sm:py-2.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 pr-10"
                  placeholder="Create password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7A9.97 9.97 0 014.02 8.971m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  className="w-full px-3 py-2 sm:py-2.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 pr-10"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7A9.97 9.97 0 014.02 8.971m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 sm:py-3 px-4 text-sm sm:text-base text-white rounded-md font-medium focus:outline-none"
              style={{ background: 'linear-gradient(135deg, #3a9b8e 0%, #2c8276 100%)' }}
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or, Register with</span>
              </div>
            </div>

            <div className="mt-6">
              <GoogleOAuthButton
                onSuccess={handleGoogleLogin}
                buttonId="google-register-button"
                buttonText="Sign up with Google"
              />
            </div>
          </div>

          <p className="mt-6 sm:mt-8 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-purple-600 hover:text-purple-500">
              Login here
            </Link>
          </p>
        </div>
      </div>

      {/* Right Section - Image */}
      <div className="hidden md:block w-2/3 relative overflow-hidden pl-2">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-teal-700 opacity-90"></div>
        <div className="relative h-full">
          <div className="relative w-full h-full">
            {images.map((image, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-transform duration-30000 ease-in-out ${index === currentImageIndex
                    ? 'translate-x-0'
                    : index === nextImageIndex
                      ? 'translate-x-full'
                      : '-translate-x-full'
                  }`}
              >
                <img
                  src={image}
                  alt={`Registration illustration ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Text Overlay */}
        <div className="absolute z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-white px-4 max-w-md">
          <h2 className="text-3xl font-bold mb-4">Discover Your Perfect Career Path</h2>
          <p className="text-lg opacity-80">
            Unlock opportunities, connect with top employers, and take the next step in your professional journey.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
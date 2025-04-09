import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import loginImage1 from '../assets/images/login.png';
import loginImage2 from '../assets/images/happybusiness-woman2.jpg';
import loginImage3 from '../assets/images/pexels.jpg'; 
import loginImage4 from '../assets/images/happybusiness-woman.jpg';
import loginImage5 from '../assets/images/business-woman3.jpg';
import loginImage6 from '../assets/images/pexels.jpg'; 
import { toast } from 'react-toastify';
import axios from 'axios';
import GoogleOAuthButton from '../components/GoogleOAuthButton';

// ScrollToTop component to handle scrolling on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
};

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFormExpanded, setIsFormExpanded] = useState(false);

  // New state for image rotation with fade effect
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [nextImageIndex, setNextImageIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const images = [loginImage1, loginImage2, loginImage3, loginImage4, loginImage5];

  // Get the redirect path from location state, default to home
  const from = location.state?.from || '/';

  const handleGoogleLogin = async (response) => {
    try {
      setLoading(true);
      setError('');

      console.log('Google login response received');
      
      if (!response.credential) {
        throw new Error('No credential received from Google');
      }

      // Log the response for debugging
      console.log('Google response:', {
        credential: response.credential.substring(0, 20) + '...',
        select_by: response.select_by,
        g_csrf_token: response.g_csrf_token
      });

      const result = await login({ tokenId: response.credential });
      
      if (!result || !result.user) {
        throw new Error('Invalid login response');
      }

      // Check if user needs to complete onboarding
      if (!result.user.onboardingComplete) {
        navigate('/onboarding/personal-info', { replace: true });
      } else {
        // If onboarding is complete, redirect to the original destination or dashboard
        const redirectTo = from === '/' ? '/dashboard_employee' : from;
        navigate(redirectTo, { replace: true });
      }

      toast.success('Login successful!');
    } catch (error) {
      console.error('Google login error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to login with Google';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Set up interval to change image every 5 seconds
    const imageInterval = setInterval(() => {
      setIsTransitioning(true);

      // After a short delay, update the indices
      setTimeout(() => {
        setCurrentImageIndex((prevIndex) =>
          (prevIndex + 1) % images.length
        );
        setNextImageIndex((prevIndex) =>
          (prevIndex + 1) % images.length
        );
        setIsTransitioning(false);
      }, 500); // Half of the transition duration
    }, 5000);

    // Clean up interval on component unmount
    return () => clearInterval(imageInterval);
  }, []);

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
        email: formData.email.trim(),
        password: formData.password
      };
      
      // Call login with the complete loginData object
      const response = await login(loginData);
      console.log('Login successful:', response);
      toast.success('Login successful!');
      
      // Check if user needs to complete onboarding
      if (response.user && !response.user.onboardingComplete) {
        navigate('/onboarding/personal-info');
      } else {
        navigate('/dashboard_employee');
      }
    } catch (err) {
      // More robust error handling
      console.error('Login error:', err);
      let errorMessage = 'Invalid email or password. Please try again.';
      
      if (err.message) {
        // Check for specific error messages we want to display directly
        if (err.message.includes('verify your email')) {
          errorMessage = err.message;
        } else if (err.message.includes('Authentication failed')) {
          errorMessage = 'Authentication failed. Please check your credentials.';
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

  const toggleForm = () => {
    setIsFormExpanded(!isFormExpanded);
  };

  return (
    <div className="flex bg-[#fff] flex-col md:flex-row min-h-screen">
      <ScrollToTop />
      {/* Left Section - Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-y-auto">
        <div className="w-full max-w-sm sm:max-w-md">
          {/* Logo */}
          <Link to="/"> <div className="mb-6 sm:mb-8">
            <svg className="w-10 h-10 sm:w-12 sm:h-12 text-purple-700" viewBox="0 0 100 100" fill="currentColor">
              <path d="M50 10 L90 30 L50 50 L10 30 Z" />
              <path d="M50 50 L50 90 L10 70 L10 30 Z" />
              <path d="M50 50 L50 90 L90 70 L90 30 Z" />
            </svg>
          </div>
          </Link>
          {/* Welcome Text */}
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome back!</h1>
          <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">Enter to get unlimited access to data & information.</p>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Google OAuth Button */}
          <div className="mb-6">
            <GoogleOAuthButton
              onSuccess={handleGoogleLogin}
              buttonId="google-login-button"
              buttonText="Sign in with Google"
            />
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center">
              <button
                onClick={toggleForm}
                className="px-4 py-2 bg-white text-sm text-gray-500 hover:text-gray-700 focus:outline-none transition-all duration-300"
              >
                <span className="flex items-center">
                  {isFormExpanded ? 'Hide Login Form' : 'Continue with Email'}
                  <svg
                    className={`ml-2 h-4 w-4 transform transition-transform duration-300 ${
                      isFormExpanded ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </span>
              </button>
            </div>
          </div>

          {/* Collapsible Login Form */}
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              isFormExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full px-3 py-2 sm:py-2.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter your mail address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="password" className="block text-sm font-medium">
                    Password <span className="text-red-500">*</span>
                  </label>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    className="w-full px-3 py-2 sm:py-2.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 pr-10"
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={loading}
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

              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-purple-600 border-gray-300 rounded"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
                <Link to="/forgot-password" className="text-sm text-purple-600 hover:text-purple-800">
                  Forgot your password?
                </Link>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 sm:py-3 px-4 text-sm sm:text-base text-white rounded-md font-medium focus:outline-none"
                style={{ background: 'linear-gradient(135deg, #3a9b8e 0%, #2c8276 100%)' }}
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          </div>

          {/* Sign up link */}
          <p className="mt-4 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-purple-600 hover:text-purple-800">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Right Section - Image Slider */}
      <div className="hidden md:block md:w-1/2 fixed right-0 h-full overflow-hidden">
        <div className="absolute inset-0">
          {images.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-800 ${
                index === currentImageIndex
                  ? 'opacity-100'
                  : index === nextImageIndex
                  ? 'opacity-0'
                  : 'opacity-0'
              }`}
            >
              <img
                src={image}
                alt={`Login background ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
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

export default LoginPage;
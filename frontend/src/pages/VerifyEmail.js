import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import emailImage from '../assets/images/verify_email.jpg';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  
  const [verificationStatus, setVerificationStatus] = useState({
    isLoading: true,
    success: false,
    message: '',
    error: ''
  });

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setVerificationStatus({
          isLoading: false,
          success: false,
          message: '',
          error: 'Verification token is missing. Please check your email link.'
        });
        return;
      }

      try {
        console.log('Verifying email with token:', token);
        // Track if verification request has been sent
        const alreadyAttempted = localStorage.getItem(`verification_${token}`);
        
        // If we've already attempted verification with this token and got success, don't make another request
        if (alreadyAttempted === 'success') {
          setVerificationStatus({
            isLoading: false,
            success: true,
            message: 'Your email has been verified successfully.',
            error: ''
          });
          toast.success('Email verified successfully!');
          return;
        }
        
        const response = await axios.get(`${API_URL}/auth/verify-email`, {
          params: { token }
        });
        
        if (response.data.success) {
          // Store that we've successfully verified this token
          localStorage.setItem(`verification_${token}`, 'success');
          
          setVerificationStatus({
            isLoading: false,
            success: true,
            message: response.data.message || 'Email verified successfully!',
            error: ''
          });
          toast.success('Email verified successfully!');
        } else {
          setVerificationStatus({
            isLoading: false,
            success: false,
            message: '',
            error: response.data.message || 'Email verification failed.'
          });
          toast.error('Email verification failed.');
        }
      } catch (error) {
        console.error('Error verifying email:', error);
        
        let errorMessage = 'Email verification failed. Please try again.';
        if (error.response) {
          // Check if this is a reused token error
          if (error.response.status === 404 && localStorage.getItem(`verification_${token}`) === 'success') {
            // If we previously had a successful verification with this token, 
            // but now it's not found, show success anyway
            setVerificationStatus({
              isLoading: false,
              success: true,
              message: 'Your email has been verified successfully.',
              error: ''
            });
            toast.success('Email verified successfully!');
            return;
          }
        
          if (error.response.status === 404) {
            errorMessage = 'Invalid or expired verification token.';
          } else if (error.response.status === 409) {
            errorMessage = 'This email is already verified.';
            setVerificationStatus({
              isLoading: false,
              success: true,
              message: 'Your email is already verified. You can now log in.',
              error: ''
            });
            return;
          } else if (error.response.data?.message) {
            errorMessage = error.response.data.message;
          }
        }
        
        setVerificationStatus({
          isLoading: false,
          success: false,
          message: '',
          error: errorMessage
        });
        toast.error(errorMessage);
      }
    };

    verifyEmail();
  }, [token]);

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  const handleResendVerification = async () => {
    try {
      // Extract email from the failed verification if possible
      const email = searchParams.get('email');
      
      if (!email) {
        toast.error('Email address is required for resending verification.');
        return;
      }
      
      setVerificationStatus(prev => ({ ...prev, isLoading: true }));
      
      const response = await axios.post(`${API_URL}/auth/resend-verification`, { email });
      
      if (response.data.success) {
        toast.success('Verification email has been resent. Please check your inbox.');
        setVerificationStatus(prev => ({
          ...prev,
          isLoading: false,
          message: 'Verification email has been resent. Please check your inbox.'
        }));
      } else {
        toast.error(response.data.message || 'Failed to resend verification email.');
        setVerificationStatus(prev => ({
          ...prev,
          isLoading: false,
          error: response.data.message || 'Failed to resend verification email.'
        }));
      }
    } catch (error) {
      console.error('Error resending verification:', error);
      toast.error('Failed to resend verification email.');
      setVerificationStatus(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to resend verification email.'
      }));
    }
  };

  if (verificationStatus.isLoading) {
    return (
      <div className="flex flex-col md:flex-row h-screen">
        {/* Left side - Image */}
        <div className="hidden md:block md:w-1/2 bg-white relative">
          <img 
            src={emailImage} 
            alt="Email verification" 
            className="absolute inset-0 h-full w-full object-cover"
            style={{ maxHeight: '100vh' }}
          />
        </div>
        
        {/* Right side - Content */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-6 bg-gray-50">
          <div className="max-w-md w-full">
            {/* Small image for mobile only */}
            <div className="md:hidden flex justify-center mb-6">
              <img 
                src={emailImage} 
                alt="Email verification" 
                className="h-64 object-contain"
              />
            </div>
            
            <div className="text-center bg-white p-8 rounded-lg">
              <div className="animate-spin mx-auto h-12 w-12 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#2A9D8F" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="#2A9D8F" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Verifying your email...
              </h2>
              <p className="mt-3 text-gray-600">
                Please wait while we verify your email address.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (verificationStatus.success) {
    return (
      <div className="flex flex-col md:flex-row h-screen">
        {/* Left side - Image */}
        <div className="hidden md:block md:w-1/2 bg-white relative">
          <img 
            src={emailImage} 
            alt="Email verification" 
            className="absolute inset-0 h-full w-full object-cover"
            style={{ maxHeight: '100vh' }}
          />
        </div>
        
        {/* Right side - Content */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-6 bg-gray-50">
          <div className="max-w-md w-full">
            {/* Small image for mobile only */}
            <div className="md:hidden flex justify-center mb-6">
              <img 
                src={emailImage} 
                alt="Email verification" 
                className="h-64 object-contain"
              />
            </div>
            
            <div className="text-center bg-white p-8 rounded-lg">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Email Verified Successfully!
              </h2>
              <p className="mt-3 text-gray-600">
                {verificationStatus.message}
              </p>
              <div className="mt-6">
                <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full animate-pulse" style={{ width: '100%' }}></div>
                </div>
              </div>
              <div className="mt-6">
                <button
                  onClick={handleLoginRedirect}
                  className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                  style={{ backgroundColor: '#2A9D8F' }}
                >
                  Login to Your Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* Left side - Image */}
      <div className="hidden md:block md:w-1/2 bg-white relative">
        <img 
          src={emailImage} 
          alt="Email verification" 
          className="absolute inset-0 h-full w-full object-cover"
          style={{ maxHeight: '100vh' }}
        />
      </div>
      
      {/* Right side - Content */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 bg-gray-50">
        <div className="max-w-md w-full">
          {/* Small image for mobile only */}
          <div className="md:hidden flex justify-center mb-6">
            <img 
              src={emailImage} 
              alt="Email verification" 
              className="h-64 object-contain"
            />
          </div>
          
          <div className="text-center bg-white p-8 rounded-lg">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Verification Failed
            </h2>
            <p className="mt-3 text-gray-600">
              {verificationStatus.error}
            </p>
            
            <div className="mt-6 space-y-3">
              <button
                onClick={handleResendVerification}
                className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Resend Verification Email
              </button>
              
              <button
                onClick={handleLoginRedirect}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Return to Login
              </button>
              
              <div className="mt-4 p-3 bg-gray-100 rounded-lg text-xs text-left">
                <p className="font-semibold mb-1">Debug Information:</p>
                <p>Token: {token ? `${token.substring(0, 15)}...` : 'None'}</p>
                <p>Email: {searchParams.get('email') || 'None'}</p>
                <p>API URL: {API_URL}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
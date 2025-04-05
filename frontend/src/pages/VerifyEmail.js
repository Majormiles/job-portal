import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setError('No verification token found. Please check your email for the verification link.');
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/auth/verify-email?token=${encodeURIComponent(token)}`);
        
        if (response.data.success) {
          setIsVerified(true);
          toast.success('Email verified successfully!');
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        }
      } catch (error) {
        console.error('Verification error:', error);
        if (error.response) {
          switch (error.response.status) {
            case 400:
              setError('Invalid verification token. Please request a new verification email.');
              break;
            case 404:
              setError('Verification token not found or expired. Please request a new verification email.');
              break;
            case 409:
              setError('Email is already verified. You can proceed to login.');
              setTimeout(() => {
                navigate('/login');
              }, 3000);
              break;
            default:
              setError('An error occurred during verification. Please try again later.');
          }
        } else {
          setError('Failed to connect to the server. Please try again later.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  const handleResendVerification = async () => {
    try {
      const email = localStorage.getItem('pendingVerificationEmail');
      if (!email) {
        toast.error('No email found. Please register again.');
        navigate('/register');
        return;
      }

      await axios.post(`${process.env.REACT_APP_API_URL}/auth/resend-verification`, { email });
      toast.success('Verification email sent successfully!');
    } catch (error) {
      console.error('Resend verification error:', error);
      toast.error('Failed to resend verification email. Please try again later.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center bg-gray-50 py-6 px-4" style={{ minHeight: 'calc(100vh - 80px)' }}>
        <div className="max-w-md w-full">
          <div className="text-center bg-white p-8 rounded-lg shadow-md">
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
    );
  }

  if (isVerified) {
    return (
      <div className="flex items-center justify-center bg-gray-50 py-6 px-4" style={{ minHeight: 'calc(100vh - 80px)' }}>
        <div className="max-w-md w-full">
          <div className="text-center bg-white p-8 rounded-lg shadow-md">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Email Verified Successfully!
            </h2>
            <p className="mt-3 text-gray-600">
              Redirecting you to the login page...
            </p>
            <div className="mt-6">
              <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full animate-pulse" style={{ width: '100%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center bg-gray-50 py-6 px-4" style={{ minHeight: 'calc(100vh - 80px)' }}>
      <div className="max-w-md w-full">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          {error ? (
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          ) : (
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
              <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          <h2 className="text-2xl font-bold text-gray-900">
            Email Verification
          </h2>
          <p className="mt-3 text-gray-600">
            {error || 'Please check your email to verify your account before proceeding.'}
          </p>
          <div className="mt-6">
            <button
              onClick={handleResendVerification}
              className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              style={{ backgroundColor: '#2A9D8F' }}
            >
              Resend verification email
            </button>
          </div>
          <div className="mt-4">
            <button
              onClick={() => navigate('/login')}
              className="text-sm text-teal-600 hover:text-teal-500"
              style={{ color: '#2A9D8F' }}
            >
              Return to login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
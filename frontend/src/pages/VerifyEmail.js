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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Verifying your email...
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Please wait while we verify your email address.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Email Verified Successfully!
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Redirecting you to the login page...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Email Verification
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {error || 'Please check your email to verify your account before proceeding.'}
          </p>
          <div className="mt-4">
            <button
              onClick={handleResendVerification}
              className="text-indigo-600 hover:text-indigo-500"
            >
              Resend verification email
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail; 
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import PaymentModal from '../components/payment/PaymentModal';
import { toast } from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const PaymentPage = () => {
  const { user, isAuthenticated, loading, updateUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null);

  useEffect(() => {
    // Check if user is authenticated and email is verified
    if (!loading) {
      if (!isAuthenticated) {
        // Redirect to login if not authenticated
        navigate('/login', { state: { from: location.pathname } });
        return;
      }

      if (user) {
        // Check if user has already paid
        checkPaymentStatus();
      }
    }
  }, [loading, isAuthenticated, user, navigate, location]);

  const checkPaymentStatus = async () => {
    try {
      setPageLoading(true);
      const response = await axios.get(`${API_URL}/payment/status/${user.email}`);
      
      if (response.data.success) {
        setPaymentStatus(response.data.data);
        
        // If payment is complete, update user context and redirect to onboarding
        if (response.data.data.isPaid) {
          // Update user payment status in context
          updateUser({
            ...user,
            payment: response.data.data
          });
          
          toast.success('Payment verification complete!');
          navigate('/onboarding/personal-info');
        }
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      toast.error('Failed to verify payment status');
    } finally {
      setPageLoading(false);
    }
  };

  const handlePayNowClick = () => {
    setShowPaymentModal(true);
  };

  // If loading or not authenticated, show loading spinner
  if (loading || pageLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-blue-600 p-6 text-white">
          <h1 className="text-2xl font-bold">Complete Your Registration</h1>
          <p className="text-blue-100 mt-1">One-time payment to access the platform</p>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center mb-4">
              <div className="rounded-full bg-green-500 h-8 w-8 flex items-center justify-center text-white font-bold mr-3">
                ✓
              </div>
              <div>
                <h3 className="font-semibold">Email Verification</h3>
                <p className="text-sm text-gray-600">Your email has been successfully verified</p>
              </div>
            </div>

            <div className="flex items-center">
              <div className={`rounded-full h-8 w-8 flex items-center justify-center text-white font-bold mr-3 ${
                paymentStatus?.isPaid ? 'bg-green-500' : 'bg-gray-300'
              }`}>
                {paymentStatus?.isPaid ? '✓' : '2'}
              </div>
              <div>
                <h3 className="font-semibold">Payment</h3>
                <p className="text-sm text-gray-600">
                  {paymentStatus?.isPaid 
                    ? 'Payment completed' 
                    : 'Complete payment to access the platform'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg mb-6">
            <h3 className="font-semibold mb-2">Account Information</h3>
            <div className="flex justify-between mb-1">
              <span className="text-gray-600">Name:</span>
              <span>{user?.name}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-gray-600">Email:</span>
              <span>{user?.email}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-gray-600">Account Type:</span>
              <span className="capitalize">{user?.roleName || 'User'}</span>
            </div>
          </div>
          
          {!paymentStatus?.isPaid && (
            <div className="text-center">
              <button
                onClick={handlePayNowClick}
                disabled={isProcessing}
                className={`w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors ${
                  isProcessing ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </div>
                ) : (
                  'Pay Now to Continue'
                )}
              </button>
              
              <p className="mt-4 text-sm text-gray-600">
                After payment, you'll be redirected to complete your profile setup.
              </p>
            </div>
          )}
        </div>
      </div>

      {showPaymentModal && (
        <PaymentModal 
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </div>
  );
};

export default PaymentPage; 
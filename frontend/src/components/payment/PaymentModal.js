import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const PAYSTACK_PUBLIC_KEY = process.env.REACT_APP_PAYSTACK_PUBLIC_KEY || 'pk_test_d9f61985375cd7230009ca227e1177bfd0a8d2a5';

const PaymentModal = ({ isOpen, onClose }) => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      fetchPaymentAmount();
      checkPaymentStatus();
    }
  }, [isOpen, user]);

  const fetchPaymentAmount = async () => {
    try {
      setLoading(true);
      const roleName = user.roleName || 'jobSeeker';
      const response = await axios.get(`${API_URL}/payment/amount/${roleName}`);
      
      if (response.data.success) {
        setPaymentAmount(response.data.data.amount);
      } else {
        setError('Could not retrieve payment amount');
      }
    } catch (error) {
      console.error('Error fetching payment amount:', error);
      setError('Failed to get payment information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/payment/status/${user.email}`);
      
      if (response.data.success && response.data.data.isPaid) {
        // User has already paid, redirect to onboarding
        toast.success('Payment already completed!');
        
        // Update user payment status in context
        updateUser({
          ...user,
          payment: response.data.data
        });
        
        // Close modal and redirect
        onClose();
        navigate('/onboarding/personal-info');
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
    }
  };

  const initializePayment = async () => {
    try {
      setProcessing(true);
      
      // Generate reference
      const reference = `REF-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
      
      // Initialize payment on backend
      const response = await axios.post(`${API_URL}/payment/initialize`, {
        email: user.email,
        roleName: user.roleName || 'jobSeeker',
        reference
      });

      if (response.data.success) {
        // Start Paystack payment
        const paymentData = response.data.data.data;
        
        console.log('Using Paystack with PUBLIC key:', PAYSTACK_PUBLIC_KEY);
        
        // Use the Paystack JS SDK to open the payment modal
        if (window.PaystackPop) {
          const handler = window.PaystackPop.setup({
            key: PAYSTACK_PUBLIC_KEY,
            email: user.email,
            amount: paymentAmount * 100, // in kobo
            currency: 'GHS',
            ref: paymentData.reference,
            callback: function(response) {
              verifyPayment(response.reference);
            },
            onClose: function() {
              setProcessing(false);
              toast.error('Payment window closed. Please try again to continue.');
            }
          });
          
          handler.openIframe();
        } else {
          setError('Payment gateway not available. Please ensure you have an internet connection.');
          setProcessing(false);
        }
      } else {
        throw new Error(response.data.message || 'Payment initialization failed');
      }
    } catch (error) {
      console.error('Payment initialization error:', error);
      setError(error.response?.data?.message || 'Failed to initialize payment. Please try again.');
      setProcessing(false);
    }
  };

  const verifyPayment = async (reference) => {
    try {
      console.log('Verifying payment with reference:', reference);
      const response = await axios.get(`${API_URL}/payment/verify/${reference}`);
      
      console.log('Payment verification response:', response.data);
      
      if (response.data.success && response.data.data.status === 'success') {
        toast.success('Payment successful!');
        
        // Update user payment status in context
        updateUser({
          ...user,
          payment: {
            isPaid: true,
            reference: response.data.data.reference,
            amount: response.data.data.amount,
            currency: response.data.data.currency,
            date: new Date()
          }
        });
        
        // Close modal and redirect to onboarding
        onClose();
        navigate('/onboarding/personal-info');
      } else {
        console.error('Payment verification failed:', response.data);
        setError('Payment verification failed. Please try again or contact support.');
      }
    } catch (error) {
      console.error('Payment verification error:', error.response?.data || error.message);
      setError('Failed to verify payment. Please contact support if amount was deducted.');
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-md mx-4">
        <h2 className="text-2xl font-semibold mb-4">Complete Registration Payment</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
            <button onClick={() => setError(null)} className="float-right">&times;</button>
          </div>
        )}
        
        <div className="mb-6">
          <p className="mb-2">To complete your registration, please make a one-time payment:</p>
          
          <div className="bg-gray-100 p-4 rounded-lg mb-4">
            <div className="flex justify-between mb-2">
              <span>Registration Fee:</span>
              <span className="font-bold">{paymentAmount ? `GHS ${paymentAmount.toFixed(2)}` : 'Loading...'}</span>
            </div>
            
            <div className="flex justify-between">
              <span>Account Type:</span>
              <span className="font-bold capitalize">{user?.roleName || 'User'}</span>
            </div>
          </div>
          
          <div className="text-sm text-gray-600 mb-4">
            <p>Your payment information is securely processed by Paystack.</p>
            <p>This is a one-time payment to access the platform.</p>
          </div>
        </div>
        
        <div className="flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors"
            disabled={processing}
          >
            Cancel
          </button>
          
          <button
            onClick={initializePayment}
            className={`px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center ${
              processing ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            disabled={loading || processing || !paymentAmount}
          >
            {processing ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              `Pay GHS ${paymentAmount ? paymentAmount.toFixed(2) : '...'}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal; 
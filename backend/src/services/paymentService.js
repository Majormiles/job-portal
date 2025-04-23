import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';
import User from '../models/user.model.js';
import AppError from '../utils/appError.js';

dotenv.config();

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_API_SECRET;
const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_API_KEY;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

// Payment amounts in Ghana cedis
const PAYMENT_AMOUNTS = {
  jobSeeker: 50,
  employer: 100,
  trainer: 100,
  trainee: 50
};

// Initialize a payment transaction
export const initializeTransaction = async (email, roleName, reference = null) => {
  try {
    // Validate role and determine amount
    if (!PAYMENT_AMOUNTS[roleName]) {
      throw new AppError(`Invalid role specified: ${roleName}`, 400);
    }

    const amount = PAYMENT_AMOUNTS[roleName] * 100; // Convert to kobo (smallest currency unit)
    
    // Generate reference if not provided
    if (!reference) {
      reference = `REF-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
    }

    console.log('Initializing payment with Paystack using SECRET key:', 
      PAYSTACK_SECRET_KEY ? 'Key is set' : 'Key is NOT set');

    const response = await axios.post(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      {
        email,
        amount,
        currency: 'GHS',
        reference,
        callback_url: `${process.env.FRONTEND_URL}/payment/callback`,
        metadata: {
          roleName,
          custom_fields: [
            {
              display_name: 'Role',
              variable_name: 'role',
              value: roleName
            }
          ]
        }
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Payment initialization error:', error.response?.data || error.message);
    throw new AppError(
      error.response?.data?.message || 'Failed to initialize payment',
      error.response?.status || 500
    );
  }
};

// Verify a payment transaction
export const verifyTransaction = async (reference) => {
  try {
    const response = await axios.get(
      `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('Payment verification error:', error.response?.data || error.message);
    throw new AppError(
      error.response?.data?.message || 'Failed to verify payment',
      error.response?.status || 500
    );
  }
};

// Update user payment status
export const updateUserPaymentStatus = async (email, reference, status, transactionData) => {
  try {
    const user = await User.findOne({ email });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Update payment information in user record
    user.payment = {
      isPaid: status === 'success',
      reference,
      amount: transactionData.amount / 100, // Convert from kobo back to cedis
      currency: 'GHS',
      date: new Date(),
      gateway: 'paystack',
      metadata: transactionData
    };

    await user.save();
    return user;
  } catch (error) {
    console.error('Error updating user payment status:', error);
    throw error;
  }
};

// Validate webhook signature
export const validateWebhookSignature = (signature, rawBody) => {
  try {
    const hash = crypto
      .createHmac('sha512', PAYSTACK_SECRET_KEY)
      .update(rawBody)
      .digest('hex');
    
    return hash === signature;
  } catch (error) {
    console.error('Webhook signature validation error:', error);
    return false;
  }
};

// Get payment amount by role
export const getPaymentAmountByRole = (roleName) => {
  if (!PAYMENT_AMOUNTS[roleName]) {
    throw new AppError(`Invalid role specified: ${roleName}`, 400);
  }
  
  return PAYMENT_AMOUNTS[roleName];
};

// Log payment transaction for audit
export const logPaymentTransaction = async (transactionData) => {
  try {
    // You might want to create a separate model for transaction logs
    // This is a simplified version storing the data in the user model
    const user = await User.findOne({ email: transactionData.customer.email });
    
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    if (!user.paymentHistory) {
      user.paymentHistory = [];
    }
    
    user.paymentHistory.push({
      reference: transactionData.reference,
      amount: transactionData.amount / 100,
      status: transactionData.status,
      date: new Date(transactionData.paid_at || Date.now()),
      gateway: 'paystack',
      metadata: transactionData
    });
    
    await user.save();
    return true;
  } catch (error) {
    console.error('Error logging payment transaction:', error);
    // We don't want to throw here as this is a secondary operation
    return false;
  }
};

// Generate receipt after successful payment
export const generateReceipt = async (user, transactionData) => {
  try {
    if (!user || !transactionData) {
      console.error('Missing user or transaction data for receipt generation');
      return null;
    }

    // Create receipt data
    const receiptData = {
      userId: user._id,
      userName: user.name,
      email: user.email,
      phoneNumber: user.phone || 'Not provided',
      accountType: user.roleName ? user.roleName.charAt(0).toUpperCase() + user.roleName.slice(1) : 'User',
      userRole: user.roleName || 'jobSeeker',
      amount: transactionData.amount / 100, // Convert from kobo to cedis
      transactionId: transactionData.id,
      referenceNumber: transactionData.reference,
      paymentMethod: transactionData.channel || 'Card Payment',
      date: new Date(transactionData.paid_at || Date.now()).toISOString(),
      location: user.location || 'Ghana'
    };

    // In a real implementation, you might want to save this receipt to a database
    // For now, we'll just add it to the user's payment data
    
    if (!user.receipts) {
      user.receipts = [];
    }
    
    user.receipts.push(receiptData);
    await user.save();
    
    console.log(`Receipt generated for user ${user.email} with reference ${transactionData.reference}`);
    
    return receiptData;
  } catch (error) {
    console.error('Error generating receipt:', error);
    // Don't throw error, just return null as this is a secondary operation
    return null;
  }
}; 
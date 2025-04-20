import * as paymentService from '../services/paymentService.js';
import User from '../models/user.model.js';
import AppError from '../utils/appError.js';
import asyncHandler from '../utils/asyncHandler.js';

// @desc    Initialize payment for user
// @route   POST /api/payment/initialize
// @access  Public
export const initializePayment = asyncHandler(async (req, res, next) => {
  const { email, roleName, reference } = req.body;

  console.log('Payment initialization request:', { email, roleName, reference });

  if (!email || !roleName) {
    return next(new AppError('Email and role are required', 400));
  }

  try {
    // Find user to verify they exist and haven't paid already
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('User not found for payment:', email);
      return next(new AppError('User not found. Please register first.', 404));
    }

    // Check if user has already paid
    if (user.payment && user.payment.isPaid) {
      console.log('User has already paid:', email);
      return res.status(200).json({
        success: true,
        message: 'User has already paid',
        data: {
          isPaid: true,
          amount: user.payment.amount,
          currency: user.payment.currency,
          date: user.payment.date
        }
      });
    }

    // Initialize transaction
    const paymentData = await paymentService.initializeTransaction(email, roleName, reference);
    console.log('Payment initialized successfully:', paymentData.message);

    res.status(200).json({
      success: true,
      message: 'Payment initialized successfully',
      data: paymentData
    });
  } catch (error) {
    console.error('Error initializing payment:', error);
    return next(
      new AppError(error.message || 'Failed to initialize payment', error.statusCode || 500)
    );
  }
});

// @desc    Verify payment
// @route   GET /api/payment/verify/:reference
// @access  Public
export const verifyPayment = asyncHandler(async (req, res, next) => {
  const { reference } = req.params;

  console.log('Payment verification request for reference:', reference);

  if (!reference) {
    return next(new AppError('Reference is required', 400));
  }

  try {
    // Verify transaction
    const verificationData = await paymentService.verifyTransaction(reference);
    console.log('Payment verification result:', {
      status: verificationData.data.status,
      reference: verificationData.data.reference
    });

    // If payment was successful, update user payment status
    if (verificationData.data.status === 'success') {
      const email = verificationData.data.customer.email;
      const updatedUser = await paymentService.updateUserPaymentStatus(
        email,
        reference,
        'success',
        verificationData.data
      );
      console.log('User payment status updated:', {
        email,
        isPaid: updatedUser.payment.isPaid
      });
      
      // Log transaction for audit
      await paymentService.logPaymentTransaction(verificationData.data);
    }

    res.status(200).json({
      success: true,
      message: 'Payment verification successful',
      data: {
        reference: verificationData.data.reference,
        status: verificationData.data.status,
        amount: verificationData.data.amount / 100, // Convert from kobo to cedis
        currency: verificationData.data.currency,
        email: verificationData.data.customer.email
      }
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return next(
      new AppError(error.message || 'Failed to verify payment', error.statusCode || 500)
    );
  }
});

// @desc    Check payment status
// @route   GET /api/payment/status/:email
// @access  Public
export const checkPaymentStatus = asyncHandler(async (req, res, next) => {
  const { email } = req.params;

  if (!email) {
    return next(new AppError('Email is required', 400));
  }

  try {
    const user = await User.findOne({ email });
    
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      success: true,
      data: {
        isPaid: user.payment?.isPaid || false,
        reference: user.payment?.reference || null,
        amount: user.payment?.amount || null,
        currency: user.payment?.currency || 'GHS',
        date: user.payment?.date || null
      }
    });
  } catch (error) {
    console.error('Error checking payment status:', error);
    return next(
      new AppError(error.message || 'Failed to check payment status', 500)
    );
  }
});

// @desc    Get payment amount by role
// @route   GET /api/payment/amount/:roleName
// @access  Public
export const getPaymentAmount = asyncHandler(async (req, res, next) => {
  const { roleName } = req.params;

  if (!roleName) {
    return next(new AppError('Role name is required', 400));
  }

  try {
    const amount = paymentService.getPaymentAmountByRole(roleName);
    
    res.status(200).json({
      success: true,
      data: {
        amount,
        currency: 'GHS',
        roleName
      }
    });
  } catch (error) {
    console.error('Error getting payment amount:', error);
    return next(
      new AppError(error.message || 'Failed to get payment amount', error.statusCode || 500)
    );
  }
});

// @desc    Handle Paystack webhook
// @route   POST /api/payment/webhook
// @access  Public
export const handleWebhook = asyncHandler(async (req, res, next) => {
  try {
    // Validate webhook signature
    const signature = req.headers['x-paystack-signature'];
    
    if (!signature) {
      console.error('Missing Paystack signature');
      return res.sendStatus(400);
    }

    // Get raw request body as string
    const rawBody = JSON.stringify(req.body);
    const isValid = paymentService.validateWebhookSignature(signature, rawBody);
    
    if (!isValid) {
      console.error('Invalid webhook signature');
      return res.sendStatus(401);
    }

    // Process based on event type
    const event = req.body;
    switch (event.event) {
      case 'charge.success':
        const data = event.data;
        const email = data.customer.email;
        
        // Update user payment status
        await paymentService.updateUserPaymentStatus(
          email,
          data.reference,
          'success',
          data
        );
        
        // Log transaction for audit
        await paymentService.logPaymentTransaction(data);
        break;
        
      // Handle other events as needed
      default:
        console.log(`Unhandled webhook event: ${event.event}`);
    }

    // Always respond with 200 to Paystack
    res.sendStatus(200);
  } catch (error) {
    console.error('Webhook processing error:', error);
    // Still return 200 to avoid Paystack retrying
    res.sendStatus(200);
  }
});

// @desc    Update user payment status directly
// @route   POST /api/payment/update-status
// @access  Public
export const updatePaymentStatus = asyncHandler(async (req, res, next) => {
  const { email, reference, amount, currency } = req.body;

  console.log('Manual payment status update request:', { email, reference, amount, currency });

  if (!email || !reference || !amount) {
    return next(new AppError('Email, reference, and amount are required', 400));
  }

  try {
    // Find user
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('User not found for payment status update:', email);
      return next(new AppError('User not found', 404));
    }

    // Update payment information
    user.payment = {
      isPaid: true,
      reference,
      amount: parseFloat(amount),
      currency: currency || 'GHS',
      date: new Date(),
      gateway: 'paystack'
    };

    await user.save();
    console.log('User payment status manually updated:', {
      email,
      isPaid: user.payment.isPaid,
      amount: user.payment.amount
    });

    res.status(200).json({
      success: true,
      message: 'Payment status updated successfully',
      data: {
        payment: user.payment
      }
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    return next(
      new AppError(error.message || 'Failed to update payment status', 500)
    );
  }
}); 
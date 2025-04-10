import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { sendEmail, getVerificationEmailTemplate } from '../utils/emailService.js';
import { OAuth2Client } from 'google-auth-library';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/appError.js';
import { ErrorResponse } from '../utils/errorHandler.js';
import crypto from 'crypto';
import Onboarding from '../models/onboarding.model.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Generate email verification token
const generateEmailVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Send verification email
const sendVerificationEmail = async (user) => {
  try {
    console.log('Sending verification email to:', user.email);
    
    // Use the existing verification token if it exists
    if (!user.verificationToken) {
      console.log('Generating new verification token for user:', user.email);
      user.verificationToken = crypto.randomBytes(32).toString('hex');
      user.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
      await user.save();
    }

    // Construct verification URL with the token as a query parameter
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${encodeURIComponent(user.verificationToken)}`;
    console.log('Verification URL:', verificationUrl);

    const emailTemplate = getVerificationEmailTemplate(verificationUrl);
    
    try {
      console.log('Attempting to send email with template');
      await sendEmail({
        to: user.email,
        subject: 'Verify Your Email',
        html: emailTemplate
      });
      console.log('Verification email sent successfully to:', user.email);
      return true;
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      console.error('Email error details:', {
        message: emailError.message,
        stack: emailError.stack,
        code: emailError.code,
        command: emailError.command
      });
      
      // Check if the error is related to OAuth2
      if (emailError.message.includes('OAuth2') || emailError.message.includes('invalid_grant')) {
        throw new Error('Email service configuration error. Please check OAuth2 credentials.');
      }
      
      throw emailError;
    }
  } catch (error) {
    console.error('Error in sendVerificationEmail:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      command: error.command
    });
    throw error;
  }
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    console.log('Starting registration process for:', email);
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists:', email);
      return next(new AppError('User already exists', 400));
    }

    // Create user with verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    console.log('Creating new user with verification token');
    
    const user = await User.create({
      name,
      email,
      password,
      isVerified: false,
      verificationToken,
      verificationTokenExpires: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    });

    console.log('User created successfully:', user._id);

    // Send verification email
    console.log('Attempting to send verification email');
    try {
      await sendVerificationEmail(user);
      console.log('Verification email sent successfully');
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      console.error('Email error details:', {
        message: emailError.message,
        stack: emailError.stack,
        code: emailError.code,
        command: emailError.command
      });
      
      // If email sending fails, delete the user and return error
      await User.deleteOne({ _id: user._id });
      
      // Check if the error is related to OAuth2
      if (emailError.message.includes('OAuth2') || emailError.message.includes('invalid_grant')) {
        return next(new AppError('Email service configuration error. Please check OAuth2 credentials.', 500));
      }
      
      return next(new AppError('Failed to send verification email. Please try again later.', 500));
    }

    // Remove sensitive information from response
    user.password = undefined;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      command: error.command
    });
    return next(new AppError('Error during registration. Please try again later.', 500));
  }
});

// @desc    Verify email
// @route   GET /api/auth/verify-email
// @access  Public
const verifyEmail = asyncHandler(async (req, res, next) => {
  const { token } = req.query;

  try {
    console.log('Verifying email with token:', token);
    
    if (!token) {
      console.log('No verification token provided');
      return res.status(400).json({
        success: false,
        message: 'Verification token is required'
      });
    }

    // Find user by verification token
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      console.log('Invalid or expired verification token');
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired verification token. Please request a new verification email.'
      });
    }

    if (user.isVerified) {
      console.log('Email already verified for user:', user.email);
      return res.status(409).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Update user verification status
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    console.log('Email verified successfully for user:', user.email);
    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      user: {
        email: user.email,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error verifying email',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Public
const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Generate new verification token
    user.verificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    await user.save();

    const emailSent = await sendVerificationEmail(user);

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email'
      });
    }

    res.json({
      success: true,
      message: 'Verification email sent successfully',
      user: {
        id: user._id,
        email: user.email,
        verificationToken: user.verificationToken
      }
    });
  } catch (error) {
    console.error('Error resending verification email:', error);
    res.status(500).json({
      success: false,
      message: 'Error resending verification email',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Google OAuth login
// @route   POST /api/auth/google
// @access  Public
const googleLogin = async (req, res) => {
  try {
    const { tokenId } = req.body;
    
    console.log('Google OAuth login attempt with tokenId:', tokenId ? 'Present (length: ' + tokenId.length + ')' : 'Missing');

    if (!tokenId) {
      return res.status(400).json({
        success: false,
        message: 'No token ID provided'
      });
    }

    try {
      // Verify Google token
      console.log('Verifying token with Google...');
      console.log('Using client ID:', process.env.GOOGLE_CLIENT_ID);
      
      const ticket = await client.verifyIdToken({
        idToken: tokenId,
        audience: process.env.GOOGLE_CLIENT_ID
      });

      const payload = ticket.getPayload();
      console.log('Token verified successfully. Payload received with email:', payload.email);
      
      const { email_verified, email, name, picture, sub: googleId } = payload;

      // Check if user exists
      console.log('Checking if user exists with email:', email);
      let user = await User.findOne({ email });

      if (!user) {
        // Create new user if doesn't exist
        console.log('User not found, creating new user with email:', email);
        try {
          // Validate required fields for new user
          if (!name) {
            throw new Error('Name is required but not provided by Google');
          }
          if (!email) {
            throw new Error('Email is required but not provided by Google');
          }
          if (!googleId) {
            throw new Error('Google ID is required but not provided');
          }

          // Create a new user with bare minimum required fields
          const newUser = {
            name,
            email,
            googleId,
            isVerified: email_verified || true, // Default to true if not provided
            profilePicture: picture || undefined
          };
          
          console.log('Creating new user with data:', { 
            name, 
            email, 
            googleId: googleId ? 'Present' : 'Missing',
            isVerified: email_verified || true,
            profilePicture: picture ? 'Present' : 'Missing'
          });

          user = await User.create(newUser);
          console.log('New user created successfully with ID:', user._id);
        } catch (createError) {
          console.error('Error creating new user:', createError);
          console.error('Error details:', createError.stack);
          
          if (createError.name === 'ValidationError') {
            // Handle mongoose validation errors
            const validationErrors = Object.values(createError.errors)
              .map(err => err.message)
              .join(', ');
              
            return res.status(400).json({
              success: false,
              message: 'Validation failed when creating new user',
              error: validationErrors,
              details: createError.errors
            });
          }
          
          return res.status(500).json({
            success: false,
            message: 'Failed to create new user',
            error: createError.message,
            details: createError.stack
          });
        }
      } else {
        console.log('User found with ID:', user._id);
        if (!user.googleId) {
          // Link Google account to existing user
          console.log('Linking Google account to existing user');
          user.googleId = googleId;
          await user.save();
        }
      }

      // Generate token
      console.log('Generating JWT token for user:', user._id);
      const token = generateToken(user._id);
      
      // Remove password from response
      user.password = undefined;

      // Set token in cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
      });

      console.log('Google OAuth login successful for user:', user.email);
      return res.status(200).json({
        success: true,
        token,
        user
      });
    } catch (verificationError) {
      console.error('Error verifying Google token:', verificationError);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired Google token',
        error: verificationError.message
      });
    }
  } catch (error) {
    console.error('Uncaught error in Google login:', error);
    
    // Check for specific MongoDB/Mongoose errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.message,
        details: error.errors
      });
    }
    
    if (error.name === 'MongoServerError' && error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists',
        error: 'Duplicate key error'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Error with Google login',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password, isAdmin } = req.body;
    console.log('Login attempt:', { email, isAdmin: isAdmin ? 'yes' : 'no' });

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password'
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log(`User not found with email: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    console.log(`User found with email: ${email}, role: ${user.role}, isVerified: ${user.isVerified}`);

    // For admin login, check if user has admin role first
    if (isAdmin) {
      console.log(`Admin login attempt for user: ${email}, role: ${user.role}`);
      if (user.role !== 'admin') {
        console.log(`Admin access denied for user: ${email} (role: ${user.role})`);
        return res.status(401).json({
          success: false,
          message: 'Unauthorized. Admin access denied.'
        });
      }
    }

    // Check if password matches
    let isMatch = false;
    try {
      // Special handling for admin logins to make sure password check works
      if (isAdmin) {
        console.log('Admin login attempt, performing direct password verification');
        
        // For admin login, use bcrypt directly to compare password
        if (user.password) {
          isMatch = await bcrypt.compare(password, user.password);
          console.log(`Admin password check result: ${isMatch ? 'PASSED' : 'FAILED'}`);
        } else {
          console.error('Admin user has no password field');
          return res.status(500).json({
            success: false,
            message: 'Admin user has invalid configuration'
          });
        }
      } 
      // Regular user login flow
      else if (typeof user.comparePassword === 'function') {
        isMatch = await user.comparePassword(password);
      } else if (typeof user.matchPassword === 'function') {
        isMatch = await user.matchPassword(password);
      } else {
        console.error(`No password comparison method available for user: ${email}`);
        return res.status(500).json({
          success: false,
          message: 'Server configuration error'
        });
      }
    } catch (passwordError) {
      console.error('Error comparing passwords:', passwordError);
      return res.status(500).json({
        success: false,
        message: 'Error during authentication'
      });
    }

    if (!isMatch) {
      console.log(`Password does not match for user: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    console.log(`Password matches for user: ${email}`);

    // Check if email is verified (skip for admin users)
    if (!user.isVerified && !isAdmin) {
      console.log(`Unverified email for user: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Please verify your email before logging in'
      });
    }

    // Get onboarding status (not needed for admin users)
    let onboarding = null;
    if (!isAdmin) {
      onboarding = await Onboarding.findOne({ user: user._id });
    }
    
    // Generate token
    const token = generateToken(user._id);

    // Create a safe user object without password
    const safeUserObj = user.toObject();
    delete safeUserObj.password;

    // Add onboarding status to user object if needed
    if (onboarding) {
      safeUserObj.onboarding = onboarding;
    }

    console.log(`Login successful for user: ${email}, role: ${user.role}, isAdmin: ${isAdmin}`);

    // Set token in cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    // For admin login, use a simpler response format
    if (isAdmin) {
      return res.status(200).json({
        success: true,
        token,
        user: safeUserObj
      });
    }

    // Regular user response
    res.status(200).json({
      success: true,
      data: {
        token,
        user: safeUserObj
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while logging in',
      error: error.message
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('company', 'name industry size');

    // Get onboarding status
    const onboarding = await Onboarding.findOne({ user: user._id });
    
    // Add onboarding status to user object
    const userResponse = user.toObject();
    userResponse.onboardingComplete = onboarding?.isComplete || false;
    userResponse.onboardingCompletedAt = onboarding?.completedAt || null;

    res.json({
      success: true,
      data: userResponse
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with that email'
      });
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: 'Password reset functionality will be implemented with OAuth2',
      resetToken // Only for development, remove in production
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error processing forgot password request',
      error: error.message
    });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:resettoken
// @access  Public
const resetPassword = async (req, res) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid token'
      });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    // Generate token and send response
    const token = generateToken(user._id);
    
    res.json({
      success: true,
      token
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error resetting password',
      error: error.message
    });
  }
};

// @desc    Update password
// @route   PUT /api/auth/update-password
// @access  Private
const updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.comparePassword(req.body.currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = req.body.newPassword;
    await user.save();

    // Generate token and send response
    const token = generateToken(user._id);
    
    res.json({
      success: true,
      token
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating password',
      error: error.message
    });
  }
};

// @desc    Logout user
// @route   GET /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error logging out',
      error: error.message
    });
  }
};

// @desc    Get OAuth configuration
// @route   GET /api/auth/config
// @access  Public
const getOAuthConfig = async (req, res) => {
  try {
    res.json({
      success: true,
      googleClientId: process.env.GOOGLE_CLIENT_ID,
      frontendUrl: process.env.FRONTEND_URL,
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    console.error('Error getting OAuth config:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting OAuth configuration',
      error: error.message
    });
  }
};

// Export all functions
export {
  register,
  verifyEmail,
  resendVerification,
  googleLogin,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  updatePassword,
  logout,
  getOAuthConfig
}; 
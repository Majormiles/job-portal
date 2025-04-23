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
import Role from '../models/role.model.js';
import Location from '../models/location.model.js';
import notificationService from '../services/notificationService.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT Token
const generateToken = (id, role = 'user') => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
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
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${encodeURIComponent(user.verificationToken)}&email=${encodeURIComponent(user.email)}`;
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
  try {
    console.log('Starting registration process');
    
    const { name, email, roleName, phone, location, customLocation } = req.body;
    const password = req.body.password; // Optional for regular users, required for admin

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists:', email);
      return next(new AppError('User already exists', 400));
    }

    // Check if role exists
    let role;
    if (roleName) {
      role = await Role.findOne({ name: roleName, isActive: true });
      if (!role) {
        console.log('Invalid role specified:', roleName);
        return next(new AppError('Invalid role specified', 400));
      }
    } else {
      // Use default role (jobSeeker)
      role = await Role.findOne({ isDefault: true, isActive: true });
      if (!role) {
        // Fallback to jobSeeker if no default role found
        role = await Role.findOne({ name: 'jobSeeker', isActive: true });
        if (!role) {
          console.error('No default or jobSeeker role found in the system');
          return next(new AppError('Registration system is not properly configured. Please contact support.', 500));
        }
      }
    }

    // Create user data object
    const userData = {
      name,
      email,
      roleName: role.name,
      role: role._id,
      isVerified: false
    };
    
    // Add password if provided (required for admin)
    if (password) {
      userData.password = password;
    }

    // Add phone if provided
    if (phone) {
      userData.phone = phone;
    }

    // Handle location
    if (location) {
      // Validate that location ID exists
      const locationExists = await Location.findById(location);
      if (!locationExists) {
        return next(new AppError('Invalid location selected', 400));
      }
      userData.location = location;
    } else if (customLocation) {
      // Set custom location
      userData.customLocation = customLocation;
    }

    // Handle role-specific fields
    const roleSpecificData = {};
    
    // Extract role-specific data based on role
    switch (role.name) {
      case 'jobSeeker':
        // Extract jobSeeker specific fields
        const { skills, education, experience, jobPreferences } = req.body;
        if (skills || education || experience || jobPreferences) {
          userData.jobSeekerProfile = {};
          if (skills) userData.jobSeekerProfile.skills = skills;
          if (education) userData.jobSeekerProfile.education = education;
          if (experience) userData.jobSeekerProfile.experience = experience;
          if (jobPreferences) userData.jobSeekerProfile.jobPreferences = jobPreferences;
        }
        break;

      case 'employer':
        // Extract employer specific fields
        const { 
          companyName, 
          industry, 
          companySize, 
          companyDescription, 
          website, 
          socialMedia,
          contactEmail,
          contactPhone
        } = req.body;
        
        if (companyName) {
          userData.employerProfile = {
            companyName,
            industry: industry || '',
            companySize: companySize || '',
            companyDescription: companyDescription || '',
            website: website || '',
            contactEmail: contactEmail || email,
            contactPhone: contactPhone || phone || ''
          };
          
          if (socialMedia) {
            userData.employerProfile.socialMedia = socialMedia;
          }
        }
        break;

      case 'trainer':
        // Extract trainer specific fields
        const { 
          organization,
          specialization,
          bio,
          experience: trainerExperience,
          certificates,
          trainingAreas,
          availableDays,
          availableHours
        } = req.body;
        
        if (organization || specialization) {
          userData.trainerProfile = {
            organization: organization || '',
            specialization: specialization || [],
            bio: bio || '',
            experience: trainerExperience || 0,
            certificates: certificates || [],
            trainingAreas: trainingAreas || [],
            availableDays: availableDays || [],
            availableHours: availableHours || { start: '', end: '' }
          };
        }
        break;

      case 'trainee':
        // Extract trainee specific fields
        const { 
          educationLevel,
          interests,
          previousTrainings,
          goals
        } = req.body;
        
        if (educationLevel || interests) {
          userData.traineeProfile = {
            educationLevel: educationLevel || '',
            interests: interests || [],
            previousTrainings: previousTrainings || [],
            goals: goals || []
          };
        }
        break;
    }

    // Create verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    userData.verificationToken = verificationToken;
    userData.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    console.log('Creating new user with role:', role.name);
    
    // Add new user data to database
    const user = await User.create(userData);
    console.log('New user created successfully:', user.email);
    
    // Send admin notification about new user registration
    try {
      await notificationService.sendNewUserRegistrationNotification(user);
      console.log('Admin notification for new user registration sent');
    } catch (notificationError) {
      console.error('Failed to send admin notification:', notificationError);
      // We don't want to fail registration if notification fails
    }

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

    // Send response with registration success message
    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email to verify your account.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        roleName: user.roleName,
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
    console.log('Request query parameters:', req.query);
    console.log('Request URL:', req.originalUrl);
    
    if (!token) {
      console.log('No verification token provided');
      return res.status(400).json({
        success: false,
        message: 'Verification token is required'
      });
    }

    // First, check if any user has this token
    console.log('Looking for user with token:', token);
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() }
    });

    // If no user found with this token, check if it was recently verified
    if (!user) {
      console.log('No user found with this token. Checking if email was already verified...');
      
      // Store used tokens temporarily to help identify recently verified accounts
      const recentlyVerified = global.recentlyVerifiedTokens || {};
      const email = recentlyVerified[token];
      
      if (email) {
        console.log('Token was recently used to verify email:', email);
        return res.status(200).json({
          success: true,
          message: 'Your email has been verified successfully. You can now log in.',
          user: { email, isVerified: true }
        });
      }
      
      console.log('Invalid or expired verification token');
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired verification token. Please request a new verification email.'
      });
    }

    console.log('User lookup result: User found', user.email);

    if (user.isVerified) {
      console.log('Email already verified for user:', user.email);
      return res.status(200).json({
        success: true,
        message: 'Your email has already been verified. You can now log in.',
        user: {
          email: user.email,
          isVerified: user.isVerified
        }
      });
    }

    // Update user verification status
    user.isVerified = true;
    const userEmail = user.email;
    
    // Store the token and email for future reference in case of duplicate requests
    if (!global.recentlyVerifiedTokens) {
      global.recentlyVerifiedTokens = {};
    }
    global.recentlyVerifiedTokens[token] = userEmail;
    
    // Set a timeout to clear this token after 5 minutes
    setTimeout(() => {
      if (global.recentlyVerifiedTokens && global.recentlyVerifiedTokens[token]) {
        delete global.recentlyVerifiedTokens[token];
      }
    }, 5 * 60 * 1000);
    
    // Clear verification token
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    console.log('Email verified successfully for user:', userEmail);
    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      user: {
        email: userEmail,
        isVerified: true
      }
    });
  } catch (error) {
    console.error('Email verification error:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({
      success: false,
      message: 'Error verifying email',
      error: 'Internal server error'
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
      error: 'Internal server error'
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
      const token = generateToken(user._id, user.roleName);
      
      // Remove password from response
      user.password = undefined;

      // Set token in cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: true,
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
      error: 'Internal server error'
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

    // Validate email 
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address'
      });
    }

    // For admin login, password is required
    if (isAdmin && !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password for admin login'
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log(`User not found with email: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'No account found with that email address'
      });
    }

    console.log(`User found with email: ${email}, role: ${user.role}, roleName: ${user.roleName}, isVerified: ${user.isVerified}`);

    // For admin login, check if user has admin role first
    if (isAdmin) {
      console.log(`Admin login attempt for user: ${email}, roleName: ${user.roleName}`);
      
      if (user.roleName !== 'admin') {
        console.log(`Admin access denied for user: ${email} (roleName: ${user.roleName})`);
        return res.status(401).json({
          success: false,
          message: 'Unauthorized. Admin access denied.'
        });
      }

      // For admin, verify password
      let isMatch = false;
      try {
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
      } catch (passwordError) {
        console.error('Error comparing passwords:', passwordError);
        return res.status(500).json({
          success: false,
          message: 'Error during authentication'
        });
      }

      if (!isMatch) {
        console.log(`Password does not match for admin user: ${email}`);
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }
    } 
    // For regular users, no password check needed - email-only authentication

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
    const token = generateToken(user._id, user.roleName);

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
      secure: true,
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
      error: 'Internal server error'
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
      error: 'Internal server error'
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
      message: 'Password reset functionality will be implemented with OAuth2'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error processing forgot password request',
      error: 'Internal server error'
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
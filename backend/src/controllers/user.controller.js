import User from '../models/user.model.js';
import Onboarding from '../models/onboarding.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/appError.js';
import { sendEmail } from '../utils/emailService.js';
import crypto from 'crypto';

// @desc    Get current logged in user
// @route   GET /api/users/me
// @access  Private
export const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    data: {
      ...user.toObject(),
      professionalInfo: {
        ...user.professionalInfo,
        resume: user.professionalInfo?.resume || null
      }
    }
  });
});

// @desc    Get comprehensive user data including profile and onboarding
// @route   GET /api/users/account-data
// @access  Private
export const getAccountData = asyncHandler(async (req, res, next) => {
  console.log('Fetching comprehensive user data for user:', req.user.id);
  
  try {
    // Get user data
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }
    
    // Get onboarding data
    const onboarding = await Onboarding.findOne({ user: req.user.id });
    
    // Extract job preferences from onboarding if available
    let jobPreferences = {};
    if (onboarding?.preferences?.data?.jobPreferences) {
      jobPreferences = onboarding.preferences.data.jobPreferences;
      console.log('Found job preferences in onboarding:', jobPreferences);
    }
    
    // Extract phone from personal info if available in onboarding
    let phone = user.phone;
    let address = user.address || {};
    
    if (onboarding?.personalInfo?.data) {
      // If user doesn't have phone but onboarding has it, use that
      if (!phone && onboarding.personalInfo.data.phone) {
        phone = onboarding.personalInfo.data.phone;
        console.log('Using phone from onboarding:', phone);
      }
      
      // If user doesn't have address but onboarding has it, use that
      if (!address.city && onboarding.personalInfo.data.address?.city) {
        address.city = onboarding.personalInfo.data.address.city;
        console.log('Using address from onboarding:', address);
      }
    }
    
    // Build combined settings data
    const jobAlertsFromSettings = user.settings?.jobAlerts || {};
    const settings = {
      ...user.settings,
      jobAlerts: {
        role: jobAlertsFromSettings.role || jobPreferences.desiredRole || '',
        location: jobAlertsFromSettings.location || jobPreferences.desiredLocation || ''
      }
    };
    
    console.log('Combined settings with job alerts:', settings);
    
    // Build the response object
    const responseData = {
      ...user.toObject(),
      phone: phone || '',
      address: address,
      settings: settings,
      onboardingData: onboarding ? {
        isComplete: onboarding.isComplete,
        completedAt: onboarding.completedAt,
        personalInfo: onboarding.personalInfo,
        professionalInfo: {
          ...onboarding.professionalInfo,
          data: {
            ...onboarding.professionalInfo?.data,
            resume: onboarding.professionalInfo?.data?.resume || user.professionalInfo?.resume || null
          }
        },
        skills: onboarding.skills,
        preferences: onboarding.preferences
      } : null
    };
    
    console.log('Sending account data response with combined user and onboarding data');
    
    res.status(200).json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('Error in getAccountData:', error);
    next(new AppError('Failed to retrieve account data', 500));
  }
});

// @desc    Update user profile
// @route   PUT /api/users/update-profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res, next) => {
  console.log('Updating user profile with data:', req.body);
  
  // Extract fields to update
  const fieldsToUpdate = {};
  
  // Update name and email if provided
  if (req.body.name) fieldsToUpdate.name = req.body.name;
  if (req.body.email) fieldsToUpdate.email = req.body.email;
  
  // Update phone if provided
  if (req.body.phone !== undefined) {
    fieldsToUpdate.phone = req.body.phone;
  }
  
  // Update address if provided
  if (req.body.address) {
    fieldsToUpdate.address = req.body.address;
  }
  
  // Update settings if provided
  if (req.body.settings) {
    fieldsToUpdate.settings = req.body.settings;
  }
  
  console.log('Fields to update:', fieldsToUpdate);
  
  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  console.log('User profile updated successfully');
  
  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update user settings (comprehensive)
// @route   PUT /api/users/settings
// @access  Private
export const updateUserSettings = asyncHandler(async (req, res, next) => {
  console.log('Updating user settings with data:', JSON.stringify(req.body, null, 2));
  
  try {
    const userId = req.user.id;
    const fieldsToUpdate = {};
    
    // Handle social links updates
    if (req.body.socialLinks) {
      console.log('Updating social links:', req.body.socialLinks);
      fieldsToUpdate.socialLinks = req.body.socialLinks;
    }
    
    // Handle contact information updates
    if (req.body.contact) {
      if (req.body.contact.phone) {
        fieldsToUpdate.phone = req.body.contact.phone;
      }
      
      if (req.body.contact.email) {
        fieldsToUpdate.email = req.body.contact.email;
      }
      
      if (req.body.contact.mapLocation) {
        fieldsToUpdate.address = fieldsToUpdate.address || {};
        fieldsToUpdate.address.city = req.body.contact.mapLocation;
      }
    }
    
    // Handle personal information updates
    if (req.body.personal) {
      if (req.body.personal.fullName) {
        fieldsToUpdate.name = req.body.personal.fullName;
      }
      
      if (req.body.personal.title) {
        fieldsToUpdate.professionalInfo = fieldsToUpdate.professionalInfo || {};
        fieldsToUpdate.professionalInfo.currentTitle = req.body.personal.title;
      }
      
      if (req.body.personal.dateOfBirth) {
        fieldsToUpdate.dateOfBirth = req.body.personal.dateOfBirth;
      }
      
      if (req.body.personal.experience) {
        fieldsToUpdate.professionalInfo = fieldsToUpdate.professionalInfo || {};
        fieldsToUpdate.professionalInfo.yearsOfExperience = req.body.personal.experience;
      }
      
      if (req.body.personal.education) {
        fieldsToUpdate.professionalInfo = fieldsToUpdate.professionalInfo || {};
        fieldsToUpdate.professionalInfo.education = req.body.personal.education;
      }
      
      if (req.body.personal.website) {
        fieldsToUpdate.website = req.body.personal.website;
      }
    }
    
    // Handle settings updates
    if (req.body.settings) {
      fieldsToUpdate.settings = fieldsToUpdate.settings || {};
      
      // Handle notifications settings
      if (req.body.settings.notifications) {
        fieldsToUpdate.settings.notifications = {
          ...(fieldsToUpdate.settings.notifications || {}),
          ...req.body.settings.notifications
        };
      }
      
      // Handle privacy settings
      if (req.body.settings.privacy) {
        fieldsToUpdate.settings.privacy = {
          ...(fieldsToUpdate.settings.privacy || {}),
          ...req.body.settings.privacy
        };
      }
      
      // Handle job alerts settings
      if (req.body.settings.jobAlerts) {
        console.log('Received job alerts update:', req.body.settings.jobAlerts);
        fieldsToUpdate.settings.jobAlerts = {
          ...(fieldsToUpdate.settings.jobAlerts || {}),
          role: req.body.settings.jobAlerts.role || '',
          location: req.body.settings.jobAlerts.location || ''
        };
        console.log('Updated job alerts field:', fieldsToUpdate.settings.jobAlerts);
      }
    }
    
    console.log('Fields to update:', JSON.stringify(fieldsToUpdate, null, 2));
    
    // Update the user data
    const updatedUser = await User.findByIdAndUpdate(userId, fieldsToUpdate, {
      new: true,
      runValidators: true
    });
    
    if (!updatedUser) {
      return next(new AppError('User not found', 404));
    }
    
    console.log('User settings updated successfully');
    
    // Get the most up-to-date user data, including onboarding status
    const onboarding = await Onboarding.findOne({ user: userId });
    const userData = updatedUser.toObject();
    
    // Add onboarding status to the response
    userData.onboardingComplete = onboarding?.isComplete || false;
    userData.onboardingCompletedAt = onboarding?.completedAt || null;
    userData.onboardingStatus = onboarding ? {
      personalInfo: onboarding.personalInfo?.completed || false,
      professionalInfo: onboarding.professionalInfo?.completed || false,
      skills: onboarding.skills?.completed || false,
      preferences: onboarding.preferences?.completed || false,
      isComplete: onboarding.isComplete || false
    } : null;
    
    // Return the updated user data
    res.status(200).json({
      success: true,
      data: userData,
      message: 'User settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating user settings:', error);
    return next(new AppError(`Failed to update user settings: ${error.message}`, 500));
  }
});

// @desc    Update user password
// @route   PUT /api/users/update-password
// @access  Private
export const updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new AppError('Password is incorrect', 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password updated successfully'
  });
});

// @desc    Forgot password
// @route   POST /api/users/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('There is no user with that email', 404));
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // Create reset url
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/users/reset-password/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

  try {
    await sendEmail(
      user.email,
      'Password reset token',
      message
    );

    res.status(200).json({
      success: true,
      message: 'Email sent'
    });
  } catch (err) {
    console.log(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new AppError('Email could not be sent', 500));
  }
});

// @desc    Reset password
// @route   PUT /api/users/reset-password/:token
// @access  Public
export const resetPassword = asyncHandler(async (req, res, next) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return next(new AppError('Invalid token', 400));
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password reset successful'
  });
});

// @desc    Delete user account
// @route   DELETE /api/users/me
// @access  Private
export const deleteAccount = asyncHandler(async (req, res, next) => {
  await User.findByIdAndDelete(req.user.id);

  res.status(200).json({
    success: true,
    data: {}
  });
}); 
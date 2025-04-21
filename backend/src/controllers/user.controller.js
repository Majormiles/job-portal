import User from '../models/user.model.js';
import Onboarding from '../models/onboarding.model.js';
import DeletedAccount from '../models/deletedAccount.model.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/appError.js';
import { sendEmail } from '../utils/emailService.js';
import crypto from 'crypto';
import Application from '../models/application.model.js';
import mongoose from 'mongoose';

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
  console.log('=== ACCOUNT DELETION REQUEST ===');
  console.log('User ID:', req.user.id);
  console.log('Request body:', req.body);
  
  const { deletionReason, customReason } = req.body;

  // Validate deletion reason
  if (!deletionReason) {
    console.log('❌ Deletion failed: No reason provided');
    return next(new AppError('Please provide a reason for account deletion', 400));
  }

  // Get user data before deletion
  const user = await User.findById(req.user.id);
  if (!user) {
    console.log('❌ Deletion failed: User not found');
    return next(new AppError('User not found', 404));
  }
  console.log('✅ Found user:', user.email);

  // Get onboarding data if it exists
  const onboarding = await Onboarding.findOne({ user: req.user.id });
  console.log('Onboarding data found:', !!onboarding);

  // Calculate account metrics
  const jobApplications = await Application.countDocuments({ applicant: req.user.id });
  const savedJobs = user.savedJobs ? user.savedJobs.length : 0;
  const profileCompletion = calculateProfileCompletion(user, onboarding);
  const daysActive = Math.ceil((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24));
  
  console.log('Account metrics calculated:', {
    jobApplications,
    savedJobs,
    profileCompletion,
    daysActive
  });

  try {
    // Store deleted account data
    console.log('Creating DeletedAccount record...');
    const deletedAccount = await DeletedAccount.create({
      originalId: user._id,
      email: user.email,
      name: user.name,
      deletionReason,
      customReason: deletionReason === 'Other' ? customReason : null,
      accountData: {
        user: user.toObject(),
        onboarding: onboarding ? onboarding.toObject() : null
      },
      accountMetrics: {
        jobApplicationsCount: jobApplications,
        savedJobsCount: savedJobs,
        profileCompletionPercentage: profileCompletion,
        daysActive
      }
    });
    console.log('✅ Created DeletedAccount record:', deletedAccount._id);

    // Delete the user account
    console.log('Deleting user account...');
    await User.findByIdAndDelete(req.user.id);
    console.log('✅ Deleted user account');

    // If onboarding data exists, delete it
    if (onboarding) {
      console.log('Deleting onboarding data...');
      await Onboarding.findByIdAndDelete(onboarding._id);
      console.log('✅ Deleted onboarding data');
    }

    // Delete all applications by this user
    console.log('Deleting user applications...');
    const deleteResult = await Application.deleteMany({ applicant: req.user.id });
    console.log('✅ Deleted applications:', deleteResult.deletedCount);

    console.log('=== ACCOUNT DELETION COMPLETED ===');
    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error during deletion process:', error);
    return next(new AppError('Error during account deletion process', 500));
  }
});

// Helper function to calculate profile completion percentage
const calculateProfileCompletion = (user, onboarding) => {
  let completionScore = 0;
  let totalFields = 0;

  // Basic user fields
  const userFields = ['name', 'email', 'phone'];
  userFields.forEach(field => {
    totalFields++;
    if (user[field]) completionScore++;
  });

  // Professional info
  if (user.professionalInfo) {
    const professionalFields = ['currentTitle', 'experience', 'education'];
    professionalFields.forEach(field => {
      totalFields++;
      if (user.professionalInfo[field]) completionScore++;
    });
  }

  // Onboarding data
  if (onboarding) {
    // Personal info
    if (onboarding.personalInfo?.completed) completionScore++;
    totalFields++;

    // Professional info
    if (onboarding.professionalInfo?.completed) completionScore++;
    totalFields++;

    // Skills
    if (onboarding.skills?.completed) completionScore++;
    totalFields++;

    // Preferences
    if (onboarding.preferences?.completed) completionScore++;
    totalFields++;
  }

  return Math.round((completionScore / totalFields) * 100);
};

/**
 * Update user role
 * @route   PUT /api/users/role
 * @access  Private
 */
export const updateUserRole = asyncHandler(async (req, res, next) => {
  try {
    const { role, userType, roleName } = req.body;
    
    if (!role && !userType && !roleName) {
      return next(new AppError('Please provide at least one of: role, userType, or roleName', 400));
    }
    
    // Use the first available value in order of priority: role, userType, roleName
    const roleToUse = role || userType || roleName;
    
    // Valid roles check
    const validRoleNames = ['admin', 'jobSeeker', 'employer', 'trainer', 'trainee'];
    if (!validRoleNames.includes(roleToUse)) {
      return next(new AppError('Invalid role specified', 400));
    }
    
    // Map frontend role names to database role names if needed
    let dbRoleName = roleToUse;
    if (roleToUse === 'user') {
      dbRoleName = 'jobSeeker';
    }
    
    // Find the Role document based on role name
    const Role = mongoose.model('Role');
    const roleDoc = await Role.findOne({ name: dbRoleName });
    
    if (!roleDoc) {
      return next(new AppError(`Role "${dbRoleName}" not found in the database`, 404));
    }
    
    // Update the user role
    const updateData = { 
      role: roleDoc._id,
      roleName: dbRoleName
    };
    
    const user = await User.findByIdAndUpdate(
      req.user.id, 
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return next(new AppError('User not found', 404));
    }
    
    res.status(200).json({
      success: true,
      data: user,
      message: `User role updated to ${dbRoleName} successfully`
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    return next(new AppError(`Failed to update user role: ${error.message}`, 500));
  }
}); 
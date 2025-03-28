const User = require('../models/user.model');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

// @desc    Get current logged in user
// @route   GET /api/users/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update user profile
// @route   PUT /api/users/me
// @access  Private
exports.updateProfile = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Update password
// @route   PUT /api/users/me/password
// @access  Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
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
exports.forgotPassword = asyncHandler(async (req, res, next) => {
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
    await sendEmail({
      email: user.email,
      subject: 'Password reset token',
      message
    });

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
// @route   PUT /api/users/reset-password/:resettoken
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
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

// @desc    Delete account
// @route   DELETE /api/users/me
// @access  Private
exports.deleteAccount = asyncHandler(async (req, res, next) => {
  await User.findByIdAndDelete(req.user.id);

  res.status(200).json({
    success: true,
    message: 'Account deleted successfully'
  });
});

// @desc    Get user onboarding status
// @route   GET /api/users/onboarding-status
// @access  Private
exports.getOnboardingStatus = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  const onboardingStatus = {
    isComplete: false,
    personalInfo: false,
    education: false,
    experience: false,
    skills: false,
    preferences: false
  };

  // Check personal info
  if (user.name && user.email && user.phone && user.address) {
    onboardingStatus.personalInfo = true;
  }

  // Check professional info
  if (user.professionalInfo && 
      user.professionalInfo.currentTitle && 
      user.professionalInfo.yearsOfExperience && 
      user.professionalInfo.desiredTitle) {
    onboardingStatus.education = true;
  }

  // Check experience
  if (user.professionalInfo && 
      user.professionalInfo.currentCompany && 
      user.professionalInfo.employmentType) {
    onboardingStatus.experience = true;
  }

  // Check skills
  if (user.skills && 
      (user.skills.technical?.length > 0 || 
       user.skills.soft?.length > 0 || 
       user.skills.languages?.length > 0)) {
    onboardingStatus.skills = true;
  }

  // Check preferences
  if (user.preferences && 
      user.preferences.jobPreferences && 
      user.preferences.industryPreferences?.length > 0) {
    onboardingStatus.preferences = true;
  }

  // Set overall completion status
  onboardingStatus.isComplete = 
    onboardingStatus.personalInfo && 
    onboardingStatus.education && 
    onboardingStatus.experience && 
    onboardingStatus.skills && 
    onboardingStatus.preferences;

  res.status(200).json({
    success: true,
    data: onboardingStatus
  });
}); 
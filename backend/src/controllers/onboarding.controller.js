const Onboarding = require('../models/onboarding.model');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');

// @desc    Get user onboarding status
// @route   GET /api/users/onboarding-status
// @access  Private
exports.getOnboardingStatus = asyncHandler(async (req, res, next) => {
  let onboarding = await Onboarding.findOne({ user: req.user.id });

  if (!onboarding) {
    // Create new onboarding document if it doesn't exist
    onboarding = await Onboarding.create({
      user: req.user.id
    });
  }

  res.status(200).json({
    success: true,
    data: {
      isComplete: onboarding.isComplete,
      personalInfo: onboarding.personalInfo.completed,
      education: onboarding.professionalInfo.completed,
      experience: onboarding.professionalInfo.completed,
      skills: onboarding.skills.completed,
      preferences: onboarding.preferences.completed
    }
  });
});

// @desc    Update onboarding section
// @route   PUT /api/users/onboarding/:section
// @access  Private
exports.updateOnboardingSection = asyncHandler(async (req, res, next) => {
  const { section } = req.params;
  const validSections = ['personalInfo', 'professionalInfo', 'skills', 'preferences'];

  if (!validSections.includes(section)) {
    return next(new AppError('Invalid section', 400));
  }

  let onboarding = await Onboarding.findOne({ user: req.user.id });

  if (!onboarding) {
    onboarding = await Onboarding.create({
      user: req.user.id
    });
  }

  // Update the section data and mark it as completed
  onboarding[section] = {
    completed: req.body.completed,
    data: req.body.data
  };

  // Update isComplete status
  onboarding.isComplete = 
    onboarding.personalInfo.completed && 
    onboarding.professionalInfo.completed && 
    onboarding.skills.completed && 
    onboarding.preferences.completed;

  await onboarding.save();

  res.status(200).json({
    success: true,
    data: onboarding
  });
});

// @desc    Get onboarding data
// @route   GET /api/users/onboarding
// @access  Private
exports.getOnboardingData = asyncHandler(async (req, res, next) => {
  const onboarding = await Onboarding.findOne({ user: req.user.id });

  if (!onboarding) {
    return next(new AppError('Onboarding data not found', 404));
  }

  res.status(200).json({
    success: true,
    data: onboarding
  });
}); 
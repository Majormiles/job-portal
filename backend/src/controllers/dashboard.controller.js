import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/user.model.js';
import Application from '../models/application.model.js';
import DashboardStats from '../models/dashboardStats.model.js';
import ApiError from '../utils/ApiError.js';

const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  res.json({
    success: true,
    data: user
  });
});

const getRecentApplications = asyncHandler(async (req, res) => {
  const applications = await Application.find({ userId: req.user._id })
    .sort({ appliedDate: -1 })
    .limit(5);

  res.json({
    success: true,
    data: applications
  });
});

const getDashboardStats = asyncHandler(async (req, res) => {
  let stats = await DashboardStats.findOne({ userId: req.user._id });
  
  if (!stats) {
    // Create default stats if not exists
    const appliedJobsCount = await Application.countDocuments({ userId: req.user._id });
    stats = await DashboardStats.create({
      userId: req.user._id,
      appliedJobs: appliedJobsCount,
      favoriteJobs: 0,
      jobAlerts: 0
    });
  }

  res.json({
    success: true,
    data: stats
  });
});

export {
  getUserProfile,
  getRecentApplications,
  getDashboardStats
}; 
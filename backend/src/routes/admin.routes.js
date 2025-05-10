import express from 'express';
import { protect, authorize, adminOnly } from '../middleware/auth.middleware.js';
import User from '../models/user.model.js';
import Job from '../models/job.model.js';
import Application from '../models/application.model.js';
import JobType from '../models/jobType.model.js';
import Interest from '../models/interest.model.js';
import CompanyType from '../models/companyType.model.js';
import { addAdminFlag } from '../middleware/adminCheck.middleware.js';
import AppError from '../utils/appError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { 
  getAdminNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  deleteNotification, 
  deleteAllNotifications,
  getNotificationStats
} from '../controllers/admin.notification.controller.js';

const router = express.Router();

// Protect all admin routes
router.use(protect);
router.use(authorize('admin'));

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
});

// Get all jobs
router.get('/jobs', async (req, res) => {
  try {
    const jobs = await Job.find().populate('user', 'name email');
    res.status(200).json({
      success: true,
      data: jobs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching jobs',
      error: error.message
    });
  }
});

// Get all applications for admin (no population)
router.get('/applications', async (req, res) => {
  try {
    console.log('Admin applications route hit');
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', status, jobId, search, startDate } = req.query;
    
    // Build query
    const query = {};
    
    // Add filters if provided
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (jobId && jobId !== 'all') {
      query.job = jobId;
    }
    
    if (startDate) {
      query.createdAt = { $gte: new Date(startDate) };
    }
    
    if (search) {
      // Simple search without populated fields
      query.$or = [
        { applicantName: { $regex: search, $options: 'i' } },
        { applicantEmail: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Prepare sort options
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // Calculate skip value for pagination
    const skip = (page - 1) * limit;
    
    console.log('Query:', query);
    console.log('Sort:', sort);
    console.log('Skip:', skip);
    console.log('Limit:', limit);
    
    // Execute query with pagination and NO population
    const applications = await Application.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count for pagination
    const totalCount = await Application.countDocuments(query);
    
    console.log('Sending admin applications response:', { count: applications.length, totalCount });
    
    res.json({
      success: true,
      data: applications,
      totalCount,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(totalCount / limit)
    });
  } catch (error) {
    console.error('Error in admin applications route:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching applications',
      error: error.message
    });
  }
});

// Get system statistics
router.get('/stats', async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const jobCount = await Job.countDocuments();
    const applicationCount = await Application.countDocuments();
    const jobTypeCount = await JobType.countDocuments();
    const interestCount = await Interest.countDocuments();
    const companyTypeCount = await CompanyType.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        users: userCount,
        jobs: jobCount,
        applications: applicationCount,
        jobTypes: jobTypeCount,
        interests: interestCount,
        companyTypes: companyTypeCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
});

// Update user role
router.patch('/users/:userId/role', async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user role',
      error: error.message
    });
  }
});

// ADMIN JOB TYPES MANAGEMENT
// Get all job types for admin dashboard
router.get('/job-types', async (req, res) => {
  try {
    const jobTypes = await JobType.find().sort({ order: 1, name: 1 });
    res.status(200).json({
      success: true,
      data: jobTypes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching job types',
      error: error.message
    });
  }
});

// Create job type from admin dashboard
router.post('/job-types', async (req, res) => {
  try {
    const { name, description, icon, order, isActive } = req.body;
    
    // Generate id from name if not provided
    const id = req.body.id || JobType.nameToId(name);
    
    // Check if job type with this name already exists
    const existing = await JobType.findOne({ 
      $or: [{ id }, { name }]
    });
    
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Job type with this name already exists'
      });
    }
    
    const jobType = await JobType.create({
      id,
      name,
      description,
      icon,
      order,
      isActive: isActive !== undefined ? isActive : true
    });
    
    res.status(201).json({
      success: true,
      data: jobType
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating job type',
      error: error.message
    });
  }
});

// ADMIN INTERESTS MANAGEMENT
// Get all interests for admin dashboard
router.get('/interests', async (req, res) => {
  try {
    const interests = await Interest.find().sort({ order: 1, name: 1 });
    res.status(200).json({
      success: true,
      data: interests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching interests',
      error: error.message
    });
  }
});

// Create interest from admin dashboard
router.post('/interests', async (req, res) => {
  try {
    const { name, description, icon, category, order, isActive } = req.body;
    
    // Generate id from name if not provided
    const id = req.body.id || Interest.nameToId(name);
    
    // Check if interest with this name already exists
    const existing = await Interest.findOne({ 
      $or: [{ id }, { name }]
    });
    
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Interest with this name already exists'
      });
    }
    
    const interest = await Interest.create({
      id,
      name,
      description,
      icon,
      category,
      order,
      isActive: isActive !== undefined ? isActive : true
    });
    
    res.status(201).json({
      success: true,
      data: interest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating interest',
      error: error.message
    });
  }
});

// ADMIN COMPANY TYPES MANAGEMENT
// Get all company types for admin dashboard
router.get('/company-types', async (req, res) => {
  try {
    const companyTypes = await CompanyType.find().sort({ order: 1, name: 1 });
    res.status(200).json({
      success: true,
      data: companyTypes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching company types',
      error: error.message
    });
  }
});

// Create company type from admin dashboard
router.post('/company-types', async (req, res) => {
  try {
    const { name, description, icon, order, isActive } = req.body;
    
    // Generate _id from name if not provided
    const _id = req.body._id || CompanyType.nameToId(name);
    
    // Check if company type with this name already exists
    const existing = await CompanyType.findOne({ 
      $or: [{ _id }, { name }]
    });
    
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Company type with this name already exists'
      });
    }
    
    const companyType = await CompanyType.create({
      _id,
      name,
      description,
      icon,
      order,
      isActive: isActive !== undefined ? isActive : true
    });
    
    res.status(201).json({
      success: true,
      data: companyType
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating company type',
      error: error.message
    });
  }
});

// INITIALIZE ALL DATA
router.post('/initialize-data', async (req, res) => {
  try {
    // Initialize job types
    const defaultJobTypes = [
      { id: 'full-time', name: 'Full-time', order: 1 },
      { id: 'part-time', name: 'Part-time', order: 2 },
      { id: 'contract', name: 'Contract', order: 3 },
      { id: 'temporary', name: 'Temporary', order: 4 },
      { id: 'internship', name: 'Internship', order: 5 },
      { id: 'remote', name: 'Remote', order: 6 },
      { id: 'hybrid', name: 'Hybrid', order: 7 },
      { id: 'seasonal', name: 'Seasonal', order: 8 },
      { id: 'freelance', name: 'Freelance', order: 9 },
      { id: 'volunteer', name: 'Volunteer', order: 10 }
    ];

    // Create job types
    for (const jobType of defaultJobTypes) {
      await JobType.findOneAndUpdate(
        { id: jobType.id },
        {
          id: jobType.id,
          name: jobType.name,
          order: jobType.order,
          isActive: true
        },
        { upsert: true, new: true }
      );
    }

    // Initialize interests
    const defaultInterests = [
      { id: 'web-development', name: 'Web Development', category: 'technical', order: 1 },
      { id: 'mobile-app-development', name: 'Mobile App Development', category: 'technical', order: 2 },
      // ... other interests ...
      { id: 'other', name: 'Other', category: 'other', order: 21 }
    ];

    // Create interests
    for (const interest of defaultInterests) {
      await Interest.findOneAndUpdate(
        { id: interest.id },
        {
          id: interest.id,
          name: interest.name,
          category: interest.category,
          order: interest.order,
          isActive: true
        },
        { upsert: true, new: true }
      );
    }

    // Initialize company types
    const defaultCompanyTypes = [
      { _id: 'corporation', name: 'Corporation', order: 1 },
      { _id: 'limited-liability', name: 'Limited Liability Company (LLC)', order: 2 },
      { _id: 'partnership', name: 'Partnership', order: 3 },
      { _id: 'sole-proprietorship', name: 'Sole Proprietorship', order: 4 },
      { _id: 'non-profit', name: 'Non-Profit Organization', order: 5 },
      { _id: 'startup', name: 'Startup', order: 6 },
      { _id: 'government', name: 'Government Agency', order: 7 },
      { _id: 'educational', name: 'Educational Institution', order: 8 },
      { _id: 'other', name: 'Other', order: 9 }
    ];

    // Create company types
    for (const companyType of defaultCompanyTypes) {
      await CompanyType.findOneAndUpdate(
        { _id: companyType._id },
        {
          _id: companyType._id,
          name: companyType.name,
          order: companyType.order,
          isActive: true
        },
        { upsert: true, new: true }
      );
    }

    res.status(200).json({
      success: true,
      message: 'All data initialized successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error initializing data',
      error: error.message
    });
  }
});

// Special route to check admin permissions
router.get('/check-permissions', addAdminFlag, asyncHandler(async (req, res, next) => {
  console.log('Admin permission check requested');
  console.log('User object:', {
    id: req.user._id,
    role: req.user.roleName,
    isAdmin: req.user.isAdmin || false
  });
  console.log('Headers:', {
    'x-admin-role': req.headers['x-admin-role'],
    'x-admin-type': req.headers['x-admin-type']
  });
  
  // Check if user has admin role
  if (req.user.roleName !== 'admin') {
    return next(new AppError('You do not have admin role in your user record', 403));
  }
  
  // Check if isAdmin flag is properly set
  if (!req.user.isAdmin) {
    return next(new AppError('Your isAdmin flag is not set properly', 403));
  }
  
  // If we made it here, everything is good
  res.status(200).json({
    success: true,
    message: 'You have the required admin permissions',
    details: {
      userId: req.user._id,
      role: req.user.roleName,
      isAdmin: req.user.isAdmin
    }
  });
}));

// Notification routes
router.get('/notifications', protect, adminOnly, getAdminNotifications);
router.get('/notifications/stats', protect, adminOnly, getNotificationStats);
router.put('/notifications/:id/read', protect, adminOnly, markNotificationAsRead);
router.put('/notifications/read-all', protect, adminOnly, markAllNotificationsAsRead);
router.delete('/notifications/:id', protect, adminOnly, deleteNotification);
router.delete('/notifications', protect, adminOnly, deleteAllNotifications);

export default router; 
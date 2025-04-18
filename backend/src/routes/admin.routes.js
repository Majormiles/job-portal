import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware.js';
import User from '../models/user.model.js';
import Job from '../models/job.model.js';
import Application from '../models/application.model.js';

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

    res.status(200).json({
      success: true,
      data: {
        users: userCount,
        jobs: jobCount,
        applications: applicationCount
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

export default router; 
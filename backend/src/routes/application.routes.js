import express from 'express';
import {
  getJobApplications,
  getMyApplications,
  updateApplicationStatus,
  getApplication,
  deleteApplication
} from '../controllers/application.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import Application from '../models/application.model.js';

const router = express.Router();

// Public routes
router.get('/job/:jobId', protect, authorize('employer', 'admin'), getJobApplications);

// Protected routes
router.get('/my-applications', protect, getMyApplications);
router.get('/:id', protect, getApplication);
router.delete('/:id', protect, deleteApplication);

// Admin routes at root level
router.get('/', protect, authorize('admin'), async (req, res) => {
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
      // Search in user name, email or job title
      query.$or = [
        { 'user.name': { $regex: search, $options: 'i' } },
        { 'user.email': { $regex: search, $options: 'i' } },
        { 'job.title': { $regex: search, $options: 'i' } }
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
    
    // Execute query with pagination
    const applications = await Application.find(query)
      .populate('user', 'name email')
      .populate('job', 'title company')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total count for pagination
    const totalCount = await Application.countDocuments(query);
    
    console.log('Sending applications response:', { count: applications.length, totalCount });
    
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

// Admin routes for managing applications
router.patch('/:id/status', protect, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['pending', 'reviewed', 'interviewed', 'offered', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }
    
    // Update application
    const application = await Application.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    res.json({
      success: true,
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating application status',
      error: error.message
    });
  }
});

router.patch('/:id/notes', protect, authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    
    // Update application
    const application = await Application.findByIdAndUpdate(
      id,
      { notes },
      { new: true }
    );
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    res.json({
      success: true,
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating application notes',
      error: error.message
    });
  }
});

router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {
    // Get counts by status
    const statusCounts = await Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    // Convert to more readable format
    const stats = {
      total: 0,
      byStatus: {}
    };
    
    statusCounts.forEach(status => {
      stats.byStatus[status._id] = status.count;
      stats.total += status.count;
    });
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching application statistics',
      error: error.message
    });
  }
});

// Employer routes
router.put('/:id/status', protect, authorize('employer', 'admin'), updateApplicationStatus);

export default router; 
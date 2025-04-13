import express from 'express';
import User from '../models/user.model.js';
import Job from '../models/job.model.js';
import Company from '../models/company.model.js';

const router = express.Router();

/**
 * @route   GET /api/stats
 * @desc    Get portal statistics (users, jobs, companies)
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    console.log('Fetching database statistics...');
    
    // Fetch statistics from database
    const [userCount, jobCount, companyCount] = await Promise.all([
      User.countDocuments(),
      Job.countDocuments(),
      Company.countDocuments()
    ]);
    
    console.log('Database stats retrieved:', {
      users: userCount,
      jobs: jobCount,
      companies: companyCount
    });

    res.status(200).json({
      success: true,
      data: {
        jobs: jobCount || 0,
        candidates: userCount || 0,
        companies: companyCount || 0
      }
    });
  } catch (error) {
    console.error('Error fetching portal stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching portal statistics',
      error: error.message
    });
  }
});

export default router; 
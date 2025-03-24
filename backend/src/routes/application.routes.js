const express = require('express');
const router = express.Router();
const {
  getJobApplications,
  getMyApplications,
  updateApplicationStatus,
  getApplication,
  deleteApplication
} = require('../controllers/application.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Public routes
router.get('/job/:jobId', protect, authorize('employer', 'admin'), getJobApplications);

// Protected routes
router.get('/my-applications', protect, getMyApplications);
router.get('/:id', protect, getApplication);
router.delete('/:id', protect, deleteApplication);

// Employer routes
router.put('/:id/status', protect, authorize('employer', 'admin'), updateApplicationStatus);

module.exports = router; 
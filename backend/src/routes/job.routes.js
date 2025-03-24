const express = require('express');
const router = express.Router();
const {
  createJob,
  getJobs,
  getJob,
  updateJob,
  deleteJob,
  applyForJob,
  getEmployerJobs
} = require('../controllers/job.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Public routes
router.get('/', getJobs);
router.get('/:id', getJob);

// Protected routes
router.use(protect);

// Job application
router.post('/:id/apply', applyForJob);

// Employer routes
router.use(authorize('employer', 'admin'));

router
  .route('/')
  .post(createJob);

router
  .route('/:id')
  .put(updateJob)
  .delete(deleteJob);

router.get('/employer/jobs', getEmployerJobs);

module.exports = router; 
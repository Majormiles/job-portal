import express from 'express';
import {
  createJob,
  getJobs,
  getJob,
  updateJob,
  deleteJob,
  applyForJob,
  getEmployerJobs,
  getJobTypes
} from '../controllers/job.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/types', getJobTypes);
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

export default router; 
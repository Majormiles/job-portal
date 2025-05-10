import express from 'express';
import {
  createJobType,
  getJobTypes,
  getJobType,
  updateJobType,
  deleteJobType,
  initializeJobTypes,
  searchJobTypes
} from '../controllers/jobType.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getJobTypes);
router.get('/search', searchJobTypes);
router.get('/:id', getJobType);

// Protected routes (admin only)
router.post('/', protect, authorize('admin'), createJobType);
router.put('/:id', protect, authorize('admin'), updateJobType);
router.delete('/:id', protect, authorize('admin'), deleteJobType);
router.post('/initialize', protect, authorize('admin'), initializeJobTypes);

export default router; 
import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import * as interestController from '../controllers/interest.controller.js';

const router = express.Router();

// Public routes
router.get('/', interestController.getInterests);
router.get('/search', interestController.searchInterests);
router.get('/:id', interestController.getInterest);

// Protected routes (admin only)
router.post('/', protect, authorize('admin'), interestController.createInterest);
router.put('/:id', protect, authorize('admin'), interestController.updateInterest);
router.delete('/:id', protect, authorize('admin'), interestController.deleteInterest);
router.post('/initialize', protect, authorize('admin'), interestController.initializeInterests);

export default router; 
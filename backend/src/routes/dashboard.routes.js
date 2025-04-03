import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import {
  getUserProfile,
  getRecentApplications,
  getDashboardStats
} from '../controllers/dashboard.controller.js';

const router = express.Router();

router.use(protect);

router.get('/me', getUserProfile);
router.get('/applications/recent', getRecentApplications);
router.get('/stats', getDashboardStats);

export default router; 
import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { getUserReceipts } from '../controllers/payment.controller.js';

const router = express.Router();

// Protect all receipt routes
router.use(protect);

// User receipt routes
router.get('/user/:userId', getUserReceipts);

// Admin-only routes for receipt management
router.use('/admin', authorize('admin'));
// Add admin routes here as needed

export default router; 
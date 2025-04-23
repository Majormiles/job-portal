import express from 'express';
import {
  initializePayment,
  verifyPayment,
  checkPaymentStatus,
  getPaymentAmount,
  handleWebhook,
  updatePaymentStatus,
  getAdminPaymentStats,
  getAdminTransactions,
  getAdminPaymentAnalytics,
  getAdminPaymentReports,
  getPaymentSettings,
  updatePaymentSettings
} from '../controllers/payment.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { addAdminFlag } from '../middleware/adminCheck.middleware.js';

const router = express.Router();

// Public routes
router.post('/initialize', initializePayment);
router.get('/verify/:reference', verifyPayment);
router.get('/status/:email', checkPaymentStatus);
router.get('/amount/:roleName', getPaymentAmount);
router.post('/webhook', handleWebhook);
router.post('/update-status', updatePaymentStatus);

// Admin routes
router.get('/admin/stats', protect, authorize('admin'), getAdminPaymentStats);
router.get('/admin/transactions', protect, authorize('admin'), getAdminTransactions);
router.get('/admin/analytics', protect, authorize('admin'), getAdminPaymentAnalytics);
router.get('/admin/reports', protect, authorize('admin'), getAdminPaymentReports);

// Payment settings routes - admin only
router.get('/settings', protect, authorize('admin'), addAdminFlag, getPaymentSettings);
router.put('/settings', protect, authorize('admin'), addAdminFlag, updatePaymentSettings);

export default router; 
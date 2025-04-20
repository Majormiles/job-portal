import express from 'express';
import {
  initializePayment,
  verifyPayment,
  checkPaymentStatus,
  getPaymentAmount,
  handleWebhook
} from '../controllers/payment.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/initialize', initializePayment);
router.get('/verify/:reference', verifyPayment);
router.get('/status/:email', checkPaymentStatus);
router.get('/amount/:roleName', getPaymentAmount);
router.post('/webhook', handleWebhook);

export default router; 
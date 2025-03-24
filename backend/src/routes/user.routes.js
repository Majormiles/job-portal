const express = require('express');
const router = express.Router();
const {
  getMe,
  updateProfile,
  updatePassword,
  forgotPassword,
  resetPassword,
  deleteAccount
} = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');

// Public routes
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

// Protected routes
router.use(protect);

router.get('/me', getMe);
router.put('/me', updateProfile);
router.put('/me/password', updatePassword);
router.delete('/me', deleteAccount);

module.exports = router; 
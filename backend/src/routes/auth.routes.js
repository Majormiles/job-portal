const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  updatePassword,
  logout
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate } = require('../utils/validation');
const {
  registerSchema,
  loginSchema
} = require('../utils/validation');

// Public routes
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resettoken', resetPassword);

// Protected routes
router.use(protect);
router.get('/me', getMe);
router.put('/update-password', updatePassword);
router.get('/logout', logout);

module.exports = router; 
import express from 'express';
import {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  updatePassword,
  logout,
  verifyEmail,
  googleLogin,
  getOAuthConfig,
  resendVerification
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validate } from '../utils/validation.js';
import {
  registerSchema,
  loginSchema
} from '../utils/validation.js';
import { getAuthUrl, handleCallback } from '../utils/getGoogleRefreshToken.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', (req, res, next) => {
  console.log('AUTH ROUTE: Login request received');
  if (req.body.isAdmin) {
    console.log('AUTH ROUTE: Admin login attempt for:', req.body.email);
  }
  return login(req, res, next);
});
router.post('/google', googleLogin);
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);
router.get('/config', getOAuthConfig);

// Protected routes
router.use(protect);
router.get('/me', getMe);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resettoken', resetPassword);
router.put('/update-password', updatePassword);
router.get('/logout', logout);

// Route to get the OAuth URL
router.get('/google/url', (req, res) => {
  const url = getAuthUrl();
  res.json({ url });
});

// OAuth callback route
router.get('/oauth2callback', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.status(400).json({ message: 'Authorization code is required' });
    }

    const tokens = await handleCallback(code);
    res.json({ 
      message: 'Authorization successful! Check your console for the tokens to add to your .env file.',
      tokens 
    });
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).json({ message: 'Error processing OAuth callback' });
  }
});

export default router; 
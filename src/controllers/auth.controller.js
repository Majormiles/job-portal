import User from '../models/user.model.js';
import Onboarding from '../models/onboarding.model.js';
import asyncHandler from 'express-async-handler';
import { generateToken } from '../utils/token.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import AppError from '../utils/appError.js';
import Debug from '../utils/debug.js';
import bcrypt from 'bcryptjs';

const debug = new Debug('auth.controller');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Check if password matches
let isMatch = false;
try {
  // Special handling for admin logins to make sure password check works
  if (isAdmin) {
    console.log('Admin login attempt, performing direct password verification');
    
    // For admin login, use bcrypt directly to compare password
    if (user.password) {
      isMatch = await bcrypt.compare(password, user.password);
      console.log(`Admin password check result: ${isMatch ? 'PASSED' : 'FAILED'}`);
    } else {
      console.error('Admin user has no password field');
      return res.status(500).json({
        success: false,
        message: 'Admin user has invalid configuration'
      });
    }
  } 
  // Regular user login flow
  else if (typeof user.comparePassword === 'function') {
    isMatch = await user.comparePassword(password);
  } else if (typeof user.matchPassword === 'function') {
    isMatch = await user.matchPassword(password);
  } else {
    console.error(`No password comparison method available for user: ${email}`);
    return res.status(500).json({
      success: false,
      message: 'Server configuration error'
    });
  }
} catch (passwordError) {
  console.error('Error comparing passwords:', passwordError);
  return res.status(500).json({
    success: false,
    message: 'Error during authentication'
  });
} 
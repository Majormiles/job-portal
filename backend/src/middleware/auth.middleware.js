import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import AppError from '../utils/appError.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';

// Protect routes - Authentication
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check if the request is for email verification
  if (req.path === '/verify-email') {
    return next();
  }

  console.log('=== AUTH MIDDLEWARE DEBUG ===');
  console.log('Headers:', req.headers);
  console.log('Cookies:', req.cookies);

  // Check if token exists in headers or cookies
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    console.log('Token found in Authorization header');
  } else if (req.cookies.token) {
    token = req.cookies.token;
    console.log('Token found in cookies');
  }

  if (!token) {
    console.log('No token found');
    return next(new AppError('Not authorized to access this route', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token verified, decoded:', decoded);

    // Get user from token
    const user = await User.findById(decoded.id).select('-password');
    console.log('User found:', user ? 'Yes' : 'No');

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Check if token contains role and if it matches user role
    if (decoded.role && decoded.role === 'admin' && user.roleName !== 'admin') {
      console.log('Token has admin role but user in DB does not, updating user...');
      // Update user roleName in DB to match token
      user.roleName = 'admin';
      await user.save();
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    return next(new AppError('Not authorized to access this route', 401));
  }
});

// Grant access to specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    // Check if the user object exists in req
    if (!req.user) {
      return next(
        new ApiError(401, 'Not authorized to access this route')
      );
    }
    
    // Get role from user object or from token
    const userRole = req.user.roleName;
    
    // Check if user role is in allowed roles
    if (!roles.includes(userRole)) {
      return next(
        new ApiError(
          403,
          `User role ${userRole} is not authorized to access this route`
        )
      );
    }
    
    next();
  };
};

// Check if user is the owner of the resource
export const checkOwnership = (Model) => {
  return asyncHandler(async (req, res, next) => {
    const resource = await Model.findById(req.params.id);

    if (!resource) {
      return next(new ApiError(404, 'Resource not found'));
    }

    // Check if user is the owner or admin
    if (resource.user.toString() !== req.user.id && req.user.roleName !== 'admin') {
      return next(new ApiError(403, 'Not authorized to modify this resource'));
    }

    next();
  });
}; 
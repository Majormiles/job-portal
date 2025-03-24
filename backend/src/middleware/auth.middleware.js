const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');

// Protect routes - Authentication
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check if token exists in headers or cookies
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(new AppError('Not authorized to access this route', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch (err) {
    return next(new AppError('Not authorized to access this route', 401));
  }
});

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};

// Check if user is the owner of the resource
exports.checkOwnership = (Model) => {
  return asyncHandler(async (req, res, next) => {
    const resource = await Model.findById(req.params.id);

    if (!resource) {
      return next(new AppError('Resource not found', 404));
    }

    // Check if user is the owner or admin
    if (resource.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new AppError('Not authorized to modify this resource', 403));
    }

    next();
  });
}; 
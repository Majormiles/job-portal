import ApiError from '../utils/ApiError.js';

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: undefined
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(error => error.message).join(', ');
    return res.status(400).json({
      status: 'error',
      error: {
        statusCode: 400,
        status: 'error'
      },
      message,
      stack: undefined
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} already exists`;
    return res.status(400).json({
      status: 'error',
      error: {
        statusCode: 400,
        status: 'error'
      },
      message,
      stack: undefined
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 'error',
      error: {
        statusCode: 401,
        status: 'error'
      },
      message: 'Invalid token',
      stack: undefined
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      status: 'error',
      error: {
        statusCode: 401,
        status: 'error'
      },
      message: 'Token expired',
      stack: undefined
    });
  }

  // Default error
  return res.status(500).json({
    status: 'error',
    error: {
      statusCode: 500,
      status: 'error'
    },
    message: err.message || 'Server Error',
    stack: undefined
  });
};

export default errorHandler; 
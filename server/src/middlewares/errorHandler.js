const logger = require('../utils/logger');

// Custom error class so you can throw errors with a status code from anywhere
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // distinguishes "expected" errors from bugs
    Error.captureStackTrace(this, this.constructor);
  }
}

// Must be registered AFTER all routes, and take 4 args so Express treats it as an error handler
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  logger.error(err.message, {
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
    body: req.body,
    statusCode,
  });

  res.status(statusCode).json({
    success: false,
    message: err.isOperational ? err.message : 'Something went wrong. Please try again.',
    // Only leak stack traces in dev, never in production
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

module.exports = { errorHandler, AppError };
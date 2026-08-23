// src/middlewares/error.middleware.js
export const globalErrorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Invalid or expired authentication token.';
  }

  // Handle Mongoose CastError (Bad ID format)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Resource not found. Invalid ID structure: ${err.value}`;
  }

  // Handle Zod Validation Errors
  if (err.name === 'ZodError') {
    statusCode = 400;
    message = err.errors.map(e => e.message).join(', ');
  }

  if (err.code === 11000) {
    statusCode = 409;
    message = 'A record with this value already exists.';
  }

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed.';
  }

  if (statusCode >= 500) {
    console.error(err);
    message = 'Internal Server Error';
  }

  res.status(statusCode).json({
    status: 'error',
    success: false,
    message,
    // Only show stack trace in development, hide it in production for security
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

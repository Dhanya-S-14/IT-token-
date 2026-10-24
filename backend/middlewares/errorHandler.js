const logger = require('../utils/logger');
const config = require('../config');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.stack = err.stack;

  if (err.name === 'CastError') {
    error.message = 'Resource not found';
    error.statusCode = 404;
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error.message = `Duplicate value for ${field}. This ${field} already exists.`;
    error.statusCode = 400;
  }

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    error.message = messages.join('. ');
    error.statusCode = 400;
  }

  error.statusCode = error.statusCode || 500;
  error.message = error.message || 'Internal Server Error';

  if (config.NODE_ENV === 'development') {
    logger.error('Error:', {
      message: error.message,
      stack: error.stack,
      statusCode: error.statusCode
    });
  }

  if (config.NODE_ENV === 'production' && error.statusCode === 500) {
    error.message = 'Something went wrong. Please try again later.';
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    ...(config.NODE_ENV === 'development' && { stack: error.stack })
  });
};

module.exports = errorHandler;

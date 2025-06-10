const { ValidationError, UniqueConstraintError, DatabaseError } = require('sequelize');
const config = require("../config/config");
const logger = require("../config/logger");
const apiError = require("../utils/apiError");

/**
 * Convert error to apiError instance if it's not already
 * @param {Error} err - The error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const errorConverter = (err, req, res, next) => {
  let error = err;

  if (err instanceof ValidationError) {
    const messages = err.errors.map((e) => e.message).join(', ');
    error = new apiError(400, messages, true, err.stack);
  }

  else if (err instanceof UniqueConstraintError) {
    const messages = err.errors.map((e) => e.message).join(', ');
    error = new apiError(400, messages, true, err.stack);
  }

  else if (err instanceof DatabaseError) {
    error = new apiError(500, 'Database error', false, err.stack);
  }

  else if (err.name === 'JsonWebTokenError') {
    error = new apiError(401, 'Invalid token', true, err.stack);
  }
  else if (err.name === 'TokenExpiredError') {
    error = new apiError(401, 'Token expired', true, err.stack);
  }

  else if (!(err instanceof apiError) && !(err instanceof Error)) {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Unknown error';
    error = new apiError(statusCode, message, false, err.stack);
  }

  else if (!(err instanceof apiError)) {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal server error';
    error = new apiError(statusCode, message, false, err.stack);
  }

  next(error);
};

/**
 * Error handler middleware
 * @param {apiError} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
  let { statusCode, message } = err;

  if (!statusCode) {
    statusCode = 500;
  }

  if (config.env === 'production' && !err.isOperational) {
    statusCode = 500;
    message = 'Internal server error';
  }

  const logLevel = statusCode >= 500 ? 'error' : 'warn';
  logger[logLevel](err.message, {
    statusCode,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  const response = {
    code: statusCode,
    message,
    ...(config.env === 'development' && { stack: err.stack })
  };

  // Set secure CORS headers for error responses
  const origin = req.headers.origin;
  if (origin) {
    // Validate origin before setting it to prevent CORS misconfiguration
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:19000',
      'http://localhost:19006',
      'http://localhost:8081',
      'http://10.0.2.2:8081',
      'http://10.0.2.2:3000',
      'http://10.0.2.2:19000',
      config.frontendUrl
    ].filter(Boolean);
    
    // Check if origin is localhost or in allowed list
    const isLocalhost = origin.match(/^https?:\/\/localhost:\d+$/);
    const isLocalNetwork = origin.match(/^https?:\/\/192\.168\.\d+\.\d+:\d+$/);
    const isAndroidEmulator = origin.match(/^https?:\/\/10\.0\.2\.\d+:\d+$/);
    const isAllowed = allowedOrigins.includes(origin);
    
    if (isLocalhost || isLocalNetwork || isAndroidEmulator || isAllowed) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }
  }
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  res.status(statusCode).json(response);
};

module.exports = {
  errorConverter,
  errorHandler
};

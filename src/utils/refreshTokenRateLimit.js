const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { tokenTypes } = require("../config/tokens");
const apiError = require("../utils/apiError");
const httpStatus = require("http-status");

/**
 * Rate limiter for refresh token usage
 * Allows only 1 request per 5 minutes per user
 */
const refreshTokenRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 1,
  message: {
    statusCode: httpStatus.TOO_MANY_REQUESTS,
    message: "Too many refresh token requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,

  keyGenerator: (req) => {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return req.ip;
    }

    try {
      // Use jwt.verify directly since keyGenerator must be synchronous
      // but we still want to validate the token format
      const payload = jwt.verify(refreshToken, config.jwt.secret);
      if (payload.type === tokenTypes.REFRESH) {
        return payload.userId || payload.sub || req.ip;
      }
      return req.ip;
    } catch (err) {
      // If token is invalid or expired, use IP as fallback
      return req.ip;
    }
  },

  skip: (req) => {
    const accessToken = req.headers.authorization?.replace("Bearer ", "");
    
    // Skip rate limiting if there's a valid (non-expired) access token
    if (!accessToken) return false;
    
    try {
      const payload = jwt.verify(accessToken, config.jwt.secret);
      // If access token is valid and of correct type, skip rate limiting
      return payload.type === tokenTypes.ACCESS;
    } catch (err) {
      // If access token is invalid or expired, apply rate limiting
      return false;
    }
  },

  handler: (req, res) => {
    const error = new apiError(
      429,
      "Refresh token can only be used once every 5 minutes. Please wait before trying again."
    );
    res.status(429).json({
      code: error.statusCode,
      message: error.message,
      retryAfter: Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000),
    });
  },
});

module.exports = refreshTokenRateLimit;

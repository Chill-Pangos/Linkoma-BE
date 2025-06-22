const rateLimit = require('express-rate-limit');
const tokenService = require("../services/token.service");
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
      const payload = tokenService.verifyToken(
        refreshToken,
        tokenTypes.REFRESH
      );
      return payload.userId || payload.sub;
    } catch (err) {
      return req.ip;
    }
  },

  skip: (req) => {
    const accessToken = req.headers.authorization?.replace("Bearer ", "");
    const refreshToken = req.cookies?.refreshToken;

    if (!accessToken && !refreshToken) return false;

    try {
      if (accessToken) {
        tokenService.verifyToken(accessToken, tokenTypes.ACCESS);
      }
      if (refreshToken) {
        tokenService.verifyToken(refreshToken, tokenTypes.REFRESH);
      }
      return true;
    } catch (err) {
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

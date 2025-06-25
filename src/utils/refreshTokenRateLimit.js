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
      const payload = jwt.verify(refreshToken, config.jwt.secret);
      // Kiểm tra loại token
      if (payload.type !== tokenTypes.REFRESH) {
        return req.ip;
      }
      return payload.userId || payload.sub;
    } catch (err) {
      // Nếu không thể verify token, sử dụng IP làm key
      return req.ip;
    }
  },

  skip: (req) => {
    const accessToken = req.headers.authorization?.replace("Bearer ", "");
    
    // Chỉ skip rate limiting nếu có access token hợp lệ (chưa hết hạn)
    if (!accessToken) return false;

    try {
      const payload = jwt.verify(accessToken, config.jwt.secret);
      // Kiểm tra loại token và còn hạn
      if (payload.type === tokenTypes.ACCESS) {
        // Nếu access token còn hợp lệ, skip rate limiting vì không cần refresh
        return true;
      }
      return false;
    } catch (err) {
      // Nếu access token không hợp lệ hoặc hết hạn, không skip rate limiting
      // vì user sẽ cần sử dụng refresh token
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

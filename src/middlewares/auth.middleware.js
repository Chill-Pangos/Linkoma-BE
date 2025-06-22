const tokenService = require("../services/token.service");
const { tokenTypes } = require("../config/tokens");
const apiError = require("../utils/apiError");
const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const roleService = require("../services/role.service");
const userService = require("../services/user.service");
const refreshTokenRateLimit = require("../utils/refreshTokenRateLimit");

/**
 * @description Middleware to authenticate user based on access and refresh tokens.
 * @param {Array} requiredPermissions - Array of permissions required to access the resource.
 * @returns {Function} - Express middleware function.
 * @throws {apiError} - Throws an error if authentication fails or permissions are insufficient.
 */

const auth = (...requiredPermissions) => {
  return catchAsync(async (req, res, next) => {
    const accessToken = req.headers.authorization?.replace("Bearer ", "");
    const refreshToken = req.cookies?.refreshToken;

    // Try to authenticate with access token first
    if (accessToken) {
      const result = await tryAccessToken(accessToken, requiredPermissions);
      if (result.success) {
        req.user = result.user;
        return next();
      }
      // If access token is invalid but not expired, return error
      if (!result.isExpired) {
        return next(new apiError(401, result.error || "Invalid access token"));
      }
      // Access token expired, continue to refresh token logic
    }

    // Try to authenticate with refresh token
    if (refreshToken) {
      return refreshTokenRateLimit(req, res, async (rateLimitError) => {
        if (rateLimitError) {
          return next(rateLimitError);
        }

        try {
          const result = await tryRefreshToken(refreshToken, requiredPermissions);
          if (result.success) {
            req.user = result.user;
            // Set new access token in response header
            res.setHeader("Authorization", `Bearer ${result.newAccessToken}`);
            return next();
          }
          return next(new apiError(401, result.error || "Invalid refresh token"));
        } catch (err) {
          return next(new apiError(401, "Invalid refresh token"));
        }
      });
    }

    return next(new apiError(401, "Please authenticate"));
  });
};

/**
 * @description Check if user role has required permissions
 * @param {string} userRole - User's role
 * @param {Array} requiredPermissions - Array of required permissions
 * @throws {apiError} If user doesn't have required permissions
 */
const checkPermissions = (userRole, requiredPermissions) => {
  if (!requiredPermissions.length) return;

  // Check if user role has all required permissions
  const hasAllPermissions = requiredPermissions.every((permission) =>
    roleService.hasPermission(userRole, permission)
  );

  if (!hasAllPermissions) {
    throw new apiError(
      403,
      "You do not have permission to access this resource"
    );
  }
};

/**
 * @description Try to authenticate with access token
 * @param {string} accessToken - Access token
 * @param {Array} requiredPermissions - Required permissions
 * @returns {Object} - Result object with success status, user, and error info
 */
const tryAccessToken = async (accessToken, requiredPermissions) => {
  try {
    const payload = await tokenService.verifyToken(accessToken, tokenTypes.ACCESS);
    const user = await userService.getUserById(payload.sub);

    if (!user) {
      return { success: false, error: "User not found", isExpired: false };
    }

    checkPermissions(user.role, requiredPermissions);
    return { success: true, user };
  } catch (err) {
    const isExpired = err.name === "TokenExpiredError";
    return { 
      success: false, 
      error: err.message || "Invalid access token", 
      isExpired 
    };
  }
};

/**
 * @description Try to authenticate with refresh token
 * @param {string} refreshToken - Refresh token
 * @param {Array} requiredPermissions - Required permissions
 * @returns {Object} - Result object with success status, user, new access token, and error info
 */
const tryRefreshToken = async (refreshToken, requiredPermissions) => {
  try {
    const payload = await tokenService.verifyToken(refreshToken, tokenTypes.REFRESH);
    const userId = payload.userId || payload.sub;
    
    if (!userId) {
      return { success: false, error: "Invalid refresh token" };
    }

    const user = await userService.getUserById(userId);
    if (!user) {
      return { success: false, error: "User not found" };
    }

    const newAccessToken = await tokenService.generateAccessToken(user.userId);
    checkPermissions(user.role, requiredPermissions);
    
    return { 
      success: true, 
      user, 
      newAccessToken: newAccessToken.accessToken 
    };
  } catch (err) {
    return { success: false, error: err.message || "Invalid refresh token" };
  }
};

module.exports = auth;

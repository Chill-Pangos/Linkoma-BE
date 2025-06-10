const tokenService = require("../services/token.service");
const { tokenTypes } = require("../config/tokens");
const apiError = require("../utils/apiError");
const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const roleService = require("../services/role.service");
const userService = require("../services/user.service");

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
    let payload;
    let user;

    if (accessToken) {
      try {
        payload = await tokenService.verifyToken(
          accessToken,
          tokenTypes.ACCESS
        );
        user = await userService.getUserById(payload.sub);

        if (!user) throw new apiError(401, "User not found");

        req.user = user;
        try {
          checkPermissions(user.role, requiredPermissions);
        } catch (permError) {
          return next(permError);
        }
        return next();
      } catch (err) {
        if (err.name !== "TokenExpiredError") {
          return next(
            new apiError(401, err.message || "Invalid access token")
          );
        }
        // Token expired, continue to refresh token logic
      }
    }

    if (refreshToken) {
      try {
        payload = await tokenService.verifyToken(
          refreshToken,
          tokenTypes.REFRESH
        );

        // For refresh token, verifyToken returns tokenRecord with userId field
        // For access token, verifyToken returns JWT payload with sub field
        const userId = payload.userId || payload.sub;
        if (!userId) {
          throw new apiError(401, "Invalid refresh token");
        }

        user = await userService.getUserById(userId);
        if (!user) throw new apiError(401, "User not found");

        const newAccessToken = await tokenService.generateAccessToken(user.userId);
        res.setHeader("Authorization", `Bearer ${newAccessToken.accessToken}`);

        req.user = user;
        try {
          checkPermissions(user.role, requiredPermissions);
        } catch (permError) {
          return next(permError);
        }
        return next();
      } catch (err) {
        return next(new apiError(401, "Invalid refresh token"));
      }
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
const checkPermissions = async (userRole, requiredPermissions) => {
  if (!requiredPermissions.length) return;

  // Check if user role has all required permissions
  const hasAllPermissions = requiredPermissions.every(permission => 
    roleService.hasPermission(userRole, permission)
  );

  if (!hasAllPermissions) {
    throw new apiError(
      403,
      "You do not have permission to access this resource"
    );
  }
};

module.exports = auth;

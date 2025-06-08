const tokenService = require("../services/token.service");
const { tokenTypes } = require("../config/tokens");
const apiError = require("../utils/apiError");
const { status } = require("http-status");
const catchAsync = require("../utils/catchAsync");
const permissionService = require("../services/permission.service");
const userService = require("../services/user.service");

/**
 * @description Middleware to authenticate user based on access and refresh tokens.
 * @param {Array} requiredPermissions - Array of permissions required to access the resource.
 * @returns {Function} - Express middleware function.
 * @throws {apiError} - Throws an error if authentication fails or permissions are insufficient.
 */

const auth = (...requiredPermissions) =>
  catchAsync(async (req, res, next) => {
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
        user = await userService.getUserById(payload.userId);

        if (!user) throw new apiError(status.UNAUTHORIZED, "User not found");

        req.user = user;
        await checkPermissions(user.role, requiredPermissions);
        return next();
      } catch (err) {
        if (err.name !== "TokenExpiredError") {
          return next(
            new apiError(status.UNAUTHORIZED, "Invalid access token")
          );
        }
      }
    }

    if (refreshToken) {
      try {
        payload = await tokenService.verifyToken(
          refreshToken,
          tokenTypes.REFRESH
        );

        if (!payload?.userId) {
          throw new apiError(status.UNAUTHORIZED, "Invalid refresh token");
        }

        user = await userService.getUserById(payload.userId);
        if (!user) throw new apiError(status.UNAUTHORIZED, "User not found");

        const newAccessToken = await tokenService.generateAccessToken(user.id);
        res.setHeader("Authorization", `Bearer ${newAccessToken.accessToken}`);

        req.user = user;
        await checkPermissions(user.role, requiredPermissions);
        return next();
      } catch (err) {
        return next(new apiError(status.UNAUTHORIZED, "Invalid refresh token"));
      }
    }

    return next(new apiError(status.UNAUTHORIZED, "Please authenticate"));
  });

/**
 */
const checkPermissions = async (role, requiredPermissions) => {
  if (!requiredPermissions.length) return;

  const hasPermission = await permissionService.checkPermissions(
    role,
    requiredPermissions
  );
  if (!hasPermission) {
    throw new apiError(
      status.FORBIDDEN,
      "You do not have permission to access this resource"
    );
  }
};

module.exports = auth;

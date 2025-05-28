const ApiError = require("../errors/api.error");
const db = require("../config/database");
const { status } = require("http-status");
const bcrypt = require("bcrypt");
const userService = require("./user.service");
const { tokenTypes } = require("../config/tokens");
const tokenService = require("./token.service");
const day = require("dayjs");
const { config } = require("dotenv");
const { ref } = require("joi");

/**
 * @description Logs in a user by validating email and password
 *
 * @param {string} email - The user's email
 * @param {string} password - The user's password
 * @return {Object} - The user object if login is successful
 * @throws {ApiError} - If there is an error during the login process
 */

const login = async (email, password) => {
  try {
    if (!email || !password) {
      throw new ApiError(status.BAD_REQUEST, "Email and password are required");
    }

    const user = await userService.getUserByEmail(email);

    if (!user) {
      throw new ApiError(status.UNAUTHORIZED, "Invalid email");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new ApiError(status.UNAUTHORIZED, "Invalid password");
    }

    return {
      user: user,
      ...(await tokenService.generateAuthTokens(user.userID)),
    };
  } catch (error) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, error.message);
  }
};

const logout = async (refreshToken) => {
  try {
    if (!refreshToken) {
      throw new ApiError(status.BAD_REQUEST, "Refresh token is required");
    }

    const tokenData = await tokenService.verifyToken(
      refreshToken,
      tokenTypes.REFRESH
    );

    if (!tokenData) {
      throw new ApiError(status.UNAUTHORIZED, "Invalid refresh token");
    }

    await tokenService.revokeToken(refreshToken, tokenTypes.REFRESH, tokenData.userID);

    return { message: "Logged out successfully" };
  } catch (error) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, error.message);
  }
};

/**
 * @description Refreshes the access token using a valid refresh token
 * @param {string} refreshToken - The refresh token to be used for generating a new access token
 * @return {Object} - An object containing the new access token, its expiration date, and user details
 * @throws {ApiError} - If the refresh token is invalid or not found
 */

const refreshAccessToken = async (refreshToken) => {
  try {
    if (!refreshToken) {
      throw new ApiError(status.BAD_REQUEST, "Refresh token is required");
    }

    const tokenData = await tokenService.verifyToken(
      refreshToken,
      tokenTypes.REFRESH
    );

    if (!tokenData) {
      throw new ApiError(status.UNAUTHORIZED, "Invalid refresh token");
    }

    const user = await userService.getUserById(tokenData.userID);

    if (!user) {
      throw new ApiError(status.UNAUTHORIZED, "User not found");
    }

    const newAccessTokenExpires = day().add(
      config.jwt.accessTokenExpirationMinutes,
      "minute"
    );

    const newAccessToken = await tokenService.generateToken(
      user.userID,
      tokenTypes.ACCESS,
      newAccessTokenExpires
    );

    return {
      accessToken: newAccessToken,
      expires: newAccessTokenExpires.toDate(),
      user: user,
    };
  } catch (error) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, error.message);
  }
};

const refreshAuth = async (refreshToken) => {
  try {
    if (!refreshToken) {
      throw new ApiError(status.BAD_REQUEST, "Refresh token is required");
    }

    const tokenData = await tokenService.verifyToken(
      refreshToken,
      tokenTypes.REFRESH
    );

    if (!tokenData) {
      throw new ApiError(status.UNAUTHORIZED, "Invalid refresh token");
    }

    const user = await userService.getUserById(tokenData.userID);

    if (!user) {
      throw new ApiError(status.UNAUTHORIZED, "User not found");
    }

    return await tokenService.generateAuthTokens(user.userID);
  } catch (error) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, error.message);
  }
};

/**
 * @description Resets the user's password
 *
 * @param {string} email - The user's email
 * @param {string} newPassword - The new password to set
 * @return {Object} - A message indicating the password reset was successful
 * @throws {ApiError} - If there is an error during the password reset process
 */

/**
 *  * @description Generates a reset password token for a user
 * @param {string} email - The email of the user
 * @returns {Promise<Object>} - An object containing the reset password token and its expiration date
 * @throws {ApiError} - If there is an error during token generation
 */

const resetPassword = async (email) => {
  try {
    if (!email) {
      throw new ApiError(
        status.BAD_REQUEST,
        "Email and new password are required"
      );
    }

    const user = await userService.getUserByEmail(email);

    if (!user) {
      throw new ApiError(status.NOT_FOUND, "User not found");
    }

    return await tokenService.resetPasswordToken(user.userID);
  } catch (error) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, error.message);
  }
};

module.exports = {
  login,
  logout,
  refreshAccessToken,
  refreshAuth,
  resetPassword,
};

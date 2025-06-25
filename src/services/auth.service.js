const apiError = require("../utils/apiError");
const User = require("../models/user.model");
const httpStatus = require("http-status");
const bcrypt = require("bcryptjs");
const userService = require("./user.service");
const { tokenTypes } = require("../config/tokens");
const tokenService = require("./token.service");
const day = require("dayjs");
const config = require("../config/config");

/**
 * @description Logs in a user by validating email and password
 *
 * @param {string} email - The user's email
 * @param {string} password - The user's password
 * @return {Object} - The user object if login is successful
 * @throws {apiError} - If there is an error during the login process
 */

const login = async (email, password) => {
  try {
    if (!email || !password) {
      throw new apiError(400, "Email and password are required");
    }

    const user = await userService.getUserByEmail(email);

    if (!user) {
      throw new apiError(401, "Invalid email");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new apiError(401, "Invalid password");
    }

    const Tokens = await tokenService.generateAuthTokens(user.userId);

    return {
      user: user, 
      access: Tokens.access,  
      refresh: Tokens.refresh,
    };
  } catch (error) {
    // Re-throw apiError as is, only wrap non-apiError exceptions
    if (error instanceof apiError) {
      throw error;
    }
    throw new apiError(500, error.message);
  }
};

const logout = async (refreshToken) => {
  try {
    if (!refreshToken) {
      throw new apiError(400, "Refresh token is required");
    }

    const tokenData = await tokenService.verifyToken(
      refreshToken,
      tokenTypes.REFRESH
    );

    if (!tokenData) {
      throw new apiError(401, "Invalid refresh token");
    }

    await tokenService.revokeToken(
      refreshToken,
      tokenData.userId
    );

    return { message: "Logged out successfully" };
  } catch (error) {
    throw new apiError(500, error.message);
  }
};

/**
 * @description Initiates the forgot password process by generating a reset token
 *
 * @param {string} email - The email of the user requesting a password reset
 * @return {Object} - An object containing the reset password token and its expiration date
 * @throws {apiError} - If the email is not provided or the user is not found
 */

const forgotPassword = async (email) => {
  try {
    if (!email) {
      throw new apiError(400, "Email is required");
    }

    const user = await userService.getUserByEmail(email);

    if (!user) {
      throw new apiError(404, "User not found");
    }

    return await tokenService.resetPasswordToken(user.userId);
  } catch (error) {
    throw new apiError(500, error.message);
  }
};

/**
 * @description Resets the user's password using a valid reset token
 *
 * @param {string} resetToken - The reset token provided to the user
 * @param {string} password - The new password to be set
 * @return {Object} - A success message if the password is reset successfully
 * @throws {apiError} - If the reset token is invalid or the user is not found
 */

const resetPassword = async (resetToken, password) => {
  try {
    if (!resetToken || !password) {
      throw new apiError(
        400,
        "Reset token and password are required"
      );
    }

    const tokenData = await tokenService.verifyToken(
      resetToken,
      tokenTypes.RESET_PASSWORD
    );

    if (!tokenData) {
      throw new apiError(401, "Invalid reset token");
    }

    const user = await userService.getUserById(tokenData.userId);

    if (!user) {
      throw new apiError(404, "User not found");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    await userService.updateUser(user.userId, { password: hashedPassword });

    return { message: "Password reset successfully" };
  } catch (error) {
    throw new apiError(500, error.message);
  }
};

module.exports = {
  login,
  logout,
  forgotPassword,
  resetPassword,
};

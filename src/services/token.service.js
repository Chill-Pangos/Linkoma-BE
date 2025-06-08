const jwt = require("jsonwebtoken");
const day = require("dayjs");
const { tokenTypes } = require("../config/tokens");
const config = require("../config/config");
const Token = require("../models/tokens.model");
const apiError = require("../utils/apiError");
const { status } = require("http-status");
const { ref } = require("joi");

/**
 * @description Generates a JWT token for a user
 * @param {number} userId - The ID of the user
 * @param {string} type - The type of token (e.g., access, refresh)
 * @param {number} expires - The expiration time in minutes/days
 * @param {string} [secret=config.jwt.secret] - The secret key for signing the token
 * @return {Promise<string>} - The generated JWT token
 * @throws {apiError} - If there is an error during token generation
 */

const generateToken = async (
  userId,
  type,
  expires,
  secret = config.jwt.secret
) => {
  const payload = {
    sub: userId,
    type,
    iat: day().unix(),
    exp: day().add(expires).unix(),
  };

  return jwt.sign(payload, secret);
};

/**
 * @description Saves a token in the database
 * @param {string} token - The token to be saved
 * @param {number} userId - The ID of the user associated with the token
 * @param {string} type - The type of token (e.g., access, refresh)
 * @param {number} expires - The expiration time in minutes/days
 * @param {boolean} [revoked=false] - Whether the token is revoked
 * @return {Promise<Object>} - The saved token data
 * @throws {apiError} - If there is an error during token saving
 */

const saveToken = async (token, userId, type, expires, revoked = false) => {
  try {
    const tokenData = {
      token,
      userID: userId,
      expires,
      revoked
    };

    const savedToken = await Token.create(tokenData);

    if (!savedToken) {
      throw new apiError(status.INTERNAL_SERVER_ERROR, "Token not saved");
    }

    return {
      id: savedToken.tokenId,
      token,
      userId,
      type,
      expires: expires,
      revoked,
    };
  } catch (error) {
    throw new apiError(status.INTERNAL_SERVER_ERROR, error.message);
  }
};

/**
 * @description Verifies a JWT token and returns its payload
 * @param {string} token - The JWT token to be verified
 * @param {string} type - The expected type of the token (e.g., access, refresh)
 * @param {string} [secret=config.jwt.secret] - The secret key for verifying the token
 * @return {Promise<Object>} - The payload of the verified token
 * @throws {apiError} - If the token is invalid or expired
 */

const verifyToken = async (token, type, secret = config.jwt.secret) => {
  let payload;

  try {
    payload = jwt.verify(token, secret);
  } catch (error) {
    throw new apiError(status.UNAUTHORIZED, "Invalid or expired token");
  }

  if (payload.type !== type) {
    throw new apiError(status.UNAUTHORIZED, "Invalid token type");
  }

  if (payload.type === tokenTypes.REFRESH) {
    try {
      const tokenRecord = await Token.findOne({
        where: {
          token: token,
          userId: payload.sub,
          revoked: false,
        },
      });

      if (!tokenRecord || new Date() > tokenRecord.expires) {
        throw new apiError(status.UNAUTHORIZED, "Token not found or invalid");
      }

      return tokenRecord;
    } catch (error) {
      throw new apiError(status.INTERNAL_SERVER_ERROR, error.message);
    }
  }

  return {
    token: token,
    expires: payload.exp,
    userID: payload.sub,
  };
};

/**
 * @description Generates access and refresh tokens for a user
 * @param {number} userId - The ID of the user
 * @return {Promise<Object>} - An object containing access and refresh tokens with their expiration dates
 * @throws {apiError} - If there is an error during token generation
 */

const generateAuthTokens = async (userId) => {
  const accessTokenExpires = day().add(
    config.jwt.accessExpirationMinutes,
    "minute"
  ).toDate();
  const refreshTokenExpires = day().add(
    config.jwt.refreshExpirationDays,
    "day"
  ).toDate();

  const accessToken = await generateToken(
    userId,
    tokenTypes.ACCESS,
    accessTokenExpires
  );

  const refreshToken = await generateToken(
    userId,
    tokenTypes.REFRESH,
    refreshTokenExpires
  );

  await saveToken(
    refreshToken,
    userId,
    tokenTypes.REFRESH,
    refreshTokenExpires
  );

  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires,
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpires,
    },
  };
};

/**
 * @description Revokes a specific token for a user
 * @param {string} token - The token to be revoked
 * @param {string} type - The type of token (e.g., access, refresh)
 * @param {number} userId - The ID of the user associated with the token
 * @return {Promise<Object>} - A message indicating the success of the revocation
 * @throws {apiError} - If there is an error during token revocation
 */

const revokeToken = async (token, userId) => {
  try {
    const [affectedRows] = await Token.update(
      { revoked: true },
      {
        where: {
          token: token,
          userId: userId,
        },
      }
    );

    if (affectedRows === 0) {
      throw new apiError(
        status.NOT_FOUND,
        "Token not found or already revoked"
      );
    }

    return { message: "Token revoked successfully" };
  } catch (error) {
    throw new apiError(status.INTERNAL_SERVER_ERROR, error.message);
  }
};

/**
 * @description Revokes all tokens for a specific user
 * @param {number} userId - The ID of the user whose tokens are to be revoked
 * @return {Promise<Object>} - A message indicating the success of the revocation
 * @throws {apiError} - If there is an error during token revocation
 */

const revokeAllTokens = async (userId) => {
  try {
    const [affectedRows] = await Token.update(
      { revoked: true },
      {
        where: {
          userId: userId,
        },
      }
    );

    if (affectedRows === 0) {
      throw new apiError(status.NOT_FOUND, "No tokens found for this user");
    }

    return { message: "All tokens revoked successfully" };
  } catch (error) {
    throw new apiError(status.INTERNAL_SERVER_ERROR, error.message);
  }
};

/**
 * @description Refreshes the access token using a valid refresh token
 * @param {string} refreshToken - The refresh token to be used for generating a new access token
 * @return {Promise<Object>} - An object containing the new access and refresh tokens with their expiration dates
 * @throws {apiError} - If the refresh token is invalid or not found
 */

const refreshAuthToken = async (refreshToken) => {
  const tokenData = await verifyToken(refreshToken, tokenTypes.REFRESH);

  if (!tokenData) {
    throw new apiError(status.UNAUTHORIZED, "Invalid refresh token");
  }

  const userId = tokenData.userID;

  await revokeToken(refreshToken, tokenTypes.REFRESH, userId);

  return await generateAuthTokens(userId);
};

/**
 * @description Generates a reset password token for a user
 * @param {number} userId - The ID of the user
 * @return {Promise<Object>} - An object containing the reset password token and its expiration date
 * @throws {apiError} - If there is an error during token generation
 */

const resetPasswordToken = async (userId) => {
  const expires = day().add(
    config.jwt.resetPasswordExpirationMinutes,
    "minute"
  );

  const resetPasswordToken = await generateToken(
    userId,
    tokenTypes.RESET_PASSWORD,
    expires
  );

  return {
    resetPasswordToken: resetPasswordToken,
    expires: expires.toDate(),
  };
};

/**
 * @description Generates an access token for a user
 * @param {number} userId - The ID of the user
 * @return {Promise<Object>} - An object containing the access token and its expiration date
 * @throws {apiError} - If there is an error during token generation
 */

const generateAccessToken = async (userId) => {
  const expires = day().add(config.jwt.accessExpirationMinutes, "minute");

  const accessToken = await generateToken(userId, tokenTypes.ACCESS, expires);

  return {
    accessToken: accessToken,
    expires: expires.toDate(),
  };
};

module.exports = {
  generateToken,
  saveToken,
  verifyToken,
  generateAuthTokens,
  resetPasswordToken,
  refreshAuthToken,
  revokeToken,
  revokeAllTokens,
  generateAccessToken,
};

const authController = require("../../controllers/auth.controller");
const express = require("express");
const validate = require("../../middlewares/validate.middleware");
const authValidation = require("../../validations/auth.validation");
const rateLimit = require("express-rate-limit");

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: {
    statusCode: 429,
    message: "Too many requests, please try again later.",
  },
});

router.post("/login", authLimiter, validate(authValidation.login), authController.login);
router.post("/logout", authLimiter, validate(authValidation.logout), authController.logout);
router.post(
  "/forgot-password",
  authLimiter,
  validate(authValidation.forgotPassword),
  authController.forgotPassword
);
router.post(
  "/reset-password/:resetToken",
  authLimiter,
  validate(authValidation.resetPassword),
  authController.resetPassword
);

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication and authorization management
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     description: Login user with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: example@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: hashed_password_string
 *     responses:
 *       '200':
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: access_token_string
 *       '401':
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Invalid email or password
 *               statusCode: 401
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Internal server error
 *               statusCode: 500
 */

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     description: Logout user by invalidating the refresh token
 *     tags: [Auth]
 *     responses:
 *       '200':
 *         description: User logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User logged out successfully
 *       '400':
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Refresh token is required
 *               statusCode: 400
 *       '401':
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Unauthorized
 *               statusCode: 401
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Internal server error
 *               statusCode: 500
 */

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Forgot password
 *     description: Initiate the forgot password process by sending a reset token to the user's email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: example@example.com
 *     responses:
 *       '204':
 *         description: Password reset email sent successfully
 *       '400':
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Email is required
 *               statusCode: 400
 *       '404':
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: User not found
 *               statusCode: 404
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Internal server error
 *               statusCode: 500
 */

/**
 * @swagger
 * /auth/reset-password/{resetToken}:
 *   post:
 *     summary: Reset password
 *     description: Reset the user's password using a valid reset token
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: resetToken
 *         required: true
 *         schema:
 *           type: string
 *           example: reset_token_string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *                 example: new_hashed_password_string
 *     responses:
 *       '204':
 *         description: Password reset successfully
 *       '400':
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Invalid reset token
 *               statusCode: 400
 *       '404':
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: User not found
 *               statusCode: 404
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: Internal server error
 *               statusCode: 500
 */

module.exports = router;
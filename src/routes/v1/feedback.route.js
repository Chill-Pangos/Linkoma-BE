const express = require("express");
const auth = require("../../middlewares/auth.middleware");
const validate = require("../../middlewares/validate.middleware");
const feedbackValidation = require("../../validations/feedback.validation");
const feedbackController = require("../../controllers/feedback.controller");
const rateLimit = require("express-rate-limit");

const router = express.Router();

// Rate limiting for feedback management operations
const feedbackLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    statusCode: 429,
    message: "Too many feedback requests, please try again later.",
  },
});

// Stricter rate limiting for feedback creation
const createFeedbackLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20, // Limit each IP to 20 feedback creations per windowMs
  message: {
    statusCode: 429,
    message: "Too many feedback creation requests, please try again later.",
  },
});

router
  .route("/")
  .post(
    createFeedbackLimiter,
    auth("manageFeedbacks"),
    validate(feedbackValidation.createFeedback),
    feedbackController.createFeedback
  )
  .get(
    feedbackLimiter,
    auth("getFeedbacks"),
    validate(feedbackValidation.getFeedbacks),
    feedbackController.getFeedbacks
  );

router
  .route("/:feedbackId")
  .get(
    feedbackLimiter,
    auth("getFeedbacks"),
    validate(feedbackValidation.getFeedback),
    feedbackController.getFeedback
  )
  .patch(
    feedbackLimiter,
    auth("manageFeedbacks"),
    validate(feedbackValidation.updateFeedbackByResident),
    feedbackController.updateFeedback
  )
  .delete(
    feedbackLimiter,
    auth("manageFeedbacks"),
    validate(feedbackValidation.deleteFeedback),
    feedbackController.deleteFeedback
  );

router
  .route("/feedbackresponse/:feedbackId")
  .patch(
    feedbackLimiter,
    auth("respondToFeedbacks"),
    validate(feedbackValidation.updateFeedbackByAdmin),
    feedbackController.updateFeedback
  );

router
  .route("/user/:userId")
  .get(
    feedbackLimiter,
    auth("getFeedbacks"),
    validate(feedbackValidation.getUserFeedbacks),
    feedbackController.getUserFeedbacks
  );

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Feedbacks
 *   description: Feedback management and retrieval
 */

/**
 * @swagger
 * /feedbacks:
 *   post:
 *     summary: Create a feedback
 *     description: Only users with manageFeedbacks permission can create feedbacks.
 *     tags: [Feedbacks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - category
 *               - description
 *             properties:
 *               userId:
 *                 type: integer
 *               category:
 *                 type: string
 *                 enum: ["Maintenance", "Service", "Complaint"]
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: ["Pending", "In Progress", "Resolved", "Rejected"]
 *               response:
 *                 type: string
 *               responseDate:
 *                 type: string
 *                 format: date
 *             example:
 *               userId: 1
 *               category: "Maintenance"
 *               description: "Air conditioner not working properly"
 *               status: "Pending"
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 feedbackId:
 *                   type: integer
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *   get:
 *     summary: Get all feedbacks
 *     description: Only users with getFeedbacks permission can retrieve feedbacks.
 *     tags: [Feedbacks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: Filter by user ID
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [Maintenance, Service, Complaint]
 *         description: Filter by category
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Pending, In Progress, Resolved, Rejected, Cancelled]
 *         description: Filter by status
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: sort by query in the form of field:desc/asc (ex. name:asc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of feedbacks
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 1
 *         description: Page number
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Feedback'
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 1
 *                 totalResults:
 *                   type: integer
 *                   example: 1
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /feedbacks/{id}:
 *   get:
 *     summary: Get a feedback
 *     description: Only users with getFeedbacks permission can fetch feedbacks.
 *     tags: [Feedbacks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Feedback id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Feedback'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a feedback
 *     description: Only users with manageFeedbacks permission can update feedbacks.
 *     tags: [Feedbacks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Feedback id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *                 enum: [Maintenance, Service, Complaint]
 *               description:
 *                 type: string
 *             example:
 *               category: Maintenance
 *               description: "Updated description of the feedback"
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Feedback'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *   delete:
 *     summary: Delete a feedback
 *     description: Only users with manageFeedbacks permission can delete feedbacks.
 *     tags: [Feedbacks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Feedback id
 *     responses:
 *       "200":
 *         description: No content
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /feedbacks/user/{userId}:
 *   get:
 *     summary: Get feedbacks by user ID
 *     description: Only users with getFeedbacks permission can retrieve user feedbacks.
 *     tags: [Feedbacks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [Maintenance, Service, Complaint]
 *         description: Filter by category
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Pending, In Progress, Resolved, Rejected, Cancelled]
 *         description: Filter by status
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: sort by query in the form of field:desc/asc (ex. name:asc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of feedbacks
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 1
 *         description: Page number
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Feedback'
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 1
 *                 totalResults:
 *                   type: integer
 *                   example: 1
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /feedbacks/feedbackresponse/{feedbackId}:
 *   patch:
 *     summary: Update feedback response by admin
 *     description: Only users with respondToFeedbacks permission can update feedback responses.
 *     tags: [Feedbacks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: feedbackId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Feedback ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Pending, In Progress, Resolved, Rejected, Cancelled]
 *               response:
 *                 type: string
 *             example:
 *               status: "Resolved"
 *               response: "Issue has been resolved"
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Feedback'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

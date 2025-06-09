const express = require('express');
const auth = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validate.middleware');
const announcementValidation = require('../../validations/announcement.validation');
const announcementController = require('../../controllers/announcement.controller');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for announcement management operations
const announcementLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    statusCode: 429,
    message: "Too many announcement requests, please try again later.",
  },
});

// Stricter rate limiting for announcement creation and modification
const createAnnouncementLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20, // Limit each IP to 20 creation/modification requests per windowMs
  message: {
    statusCode: 429,
    message: "Too many announcement modification requests, please try again later.",
  },
});

router
  .route('/')
  .post(
    createAnnouncementLimiter,
    auth('manageAnnouncements'),
    validate(announcementValidation.createAnnouncement), 
    announcementController.createAnnouncement
  )
  .get(
    announcementLimiter,
    auth('viewAnnouncements'),
    validate(announcementValidation.getAnnouncements), 
    announcementController.getAnnouncements
  );

router
  .route('/:announcementId')
  .get(
    announcementLimiter,
    auth('viewAnnouncements'),
    validate(announcementValidation.getAnnouncement), 
    announcementController.getAnnouncement
  )
  .patch(
    createAnnouncementLimiter,
    auth('manageAnnouncements'),
    validate(announcementValidation.updateAnnouncement), 
    announcementController.updateAnnouncement
  )
  .delete(
    createAnnouncementLimiter,
    auth('manageAnnouncements'),
    validate(announcementValidation.deleteAnnouncement), 
    announcementController.deleteAnnouncement
  );

router
  .route('/user/:userId')
  .get(
    announcementLimiter,
    auth('viewAnnouncements'),
    validate(announcementValidation.getUserAnnouncements), 
    announcementController.getUserAnnouncements
  );

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Announcements
 *   description: Announcement management and retrieval
 */

/**
 * @swagger
 * /announcements: 
 *   post:
 *     summary: Create an announcement
 *     description: Only users with manageAnnouncements permission can create announcements.
 *     tags: [Announcements]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - priority
 *               - title
 *               - content
 *               - author
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [General, Urgent, Maintenance, Event]
 *               priority:
 *                 type: string
 *                 enum: [Low, Medium, High, Critical]
 *               title:
 *                 type: string
 *                 maxLength: 200
 *               content:
 *                 type: string
 *               author:
 *                 type: integer
 *             example:
 *               type: General
 *               priority: Medium
 *               title: "Monthly Maintenance Schedule"
 *               content: "Building maintenance will be conducted on the first Saturday of each month."
 *               author: 1
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
 *                 announcementId:
 *                   type: integer
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized' 
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all announcements
 *     description: Only users with viewAnnouncements permission can retrieve announcements.
 *     tags: [Announcements]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [General, Urgent, Maintenance, Event]
 *         description: Filter by announcement type
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [Low, Medium, High, Critical]
 *         description: Filter by priority
 *       - in: query
 *         name: author
 *         schema:
 *           type: integer
 *         description: Filter by author ID
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: sort by query in the form of field:desc/asc (ex. title:asc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of announcements
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
 *                     $ref: '#/components/schemas/Announcement'
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
 * /announcements/{id}:
 *   get:
 *     summary: Get an announcement
 *     description: Only users with viewAnnouncements permission can fetch announcements.
 *     tags: [Announcements]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Announcement id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Announcement'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden' 
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update an announcement
 *     description: Only users with manageAnnouncements permission can update announcements.
 *     tags: [Announcements]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Announcement id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [General, Urgent, Maintenance, Event]
 *               priority:
 *                 type: string
 *                 enum: [Low, Medium, High, Critical]
 *               title:
 *                 type: string
 *                 maxLength: 200
 *               content:
 *                 type: string
 *             example:
 *               priority: High
 *               title: "Updated Maintenance Schedule"
 *               content: "Building maintenance schedule has been updated."
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Announcement'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden' 
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     summary: Delete an announcement
 *     description: Only users with manageAnnouncements permission can delete announcements.
 *     tags: [Announcements]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Announcement id
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
 * /announcements/user/{userId}:
 *   get:
 *     summary: Get announcements by user ID
 *     description: Only users with viewAnnouncements permission can retrieve user announcements.
 *     tags: [Announcements]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [General, Urgent, Maintenance, Event]
 *         description: Filter by announcement type
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [Low, Medium, High, Critical]
 *         description: Filter by priority
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: sort by query in the form of field:desc/asc (ex. title:asc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of announcements
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
 *                     $ref: '#/components/schemas/Announcement'
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

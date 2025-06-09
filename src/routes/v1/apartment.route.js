const express = require('express');
const auth = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validate.middleware');
const apartmentValidation = require('../../validations/apartment.validation');
const apartmentController = require('../../controllers/apartment.controller');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for apartment management operations
const apartmentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    statusCode: 429,
    message: "Too many apartment requests, please try again later.",
  },
});

// Stricter rate limiting for apartment creation
const createApartmentLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10, // Limit each IP to 10 apartment creations per windowMs
  message: {
    statusCode: 429,
    message: "Too many apartment creation requests, please try again later.",
  },
});

router
  .route('/')
  .post(
    createApartmentLimiter,
    auth('manageApartments'),
    validate(apartmentValidation.createApartment),
    apartmentController.createApartment
  )
  .get(
    apartmentLimiter,
    auth('getApartments'),
    validate(apartmentValidation.getApartments),
    apartmentController.getApartments
  );

router
  .route('/:apartmentId')
  .get(
    apartmentLimiter,
    auth('getApartments'),
    validate(apartmentValidation.getApartment),
    apartmentController.getApartment
  )
  .patch(
    apartmentLimiter,
    auth('manageApartments'),
    validate(apartmentValidation.updateApartment),
    apartmentController.updateApartment
  )
  .delete(
    apartmentLimiter,
    auth('manageApartments'),
    validate(apartmentValidation.deleteApartment),
    apartmentController.deleteApartment
  );

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Apartments
 *   description: Apartment management and retrieval
 */

/**
 * @swagger
 * /apartments:
 *   post:
 *     summary: Create an apartment
 *     description: Only managers and admins can create apartments.
 *     tags: [Apartments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - apartmentTypeId
 *             properties:
 *               apartmentTypeId:
 *                 type: integer
 *                 description: ID of the apartment type
 *               floor:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 50
 *                 description: Floor number
 *               status:
 *                 type: string
 *                 enum: [available, rented, maintenance]
 *                 default: available
 *                 description: Apartment status
 *             example:
 *               apartmentTypeId: 1
 *               floor: 5
 *               status: available
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Apartment'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 *   get:
 *     summary: Get all apartments
 *     description: Retrieve apartments with optional filtering and pagination.
 *     tags: [Apartments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: apartmentTypeId
 *         schema:
 *           type: integer
 *         description: Filter by apartment type ID
 *       - in: query
 *         name: floor
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *         description: Filter by floor number
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [available, rented, maintenance]
 *         description: Filter by apartment status
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
 *           maximum: 100
 *           default: 10
 *         description: Maximum number of apartments
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
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
 *                     $ref: '#/components/schemas/Apartment'
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
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /apartments/{apartmentId}:
 *   get:
 *     summary: Get an apartment
 *     description: Get apartment information by ID.
 *     tags: [Apartments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: apartmentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Apartment ID
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Apartment'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 *   patch:
 *     summary: Update an apartment
 *     description: Only managers and admins can update apartments.
 *     tags: [Apartments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: apartmentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Apartment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               apartmentTypeId:
 *                 type: integer
 *                 description: ID of the apartment type
 *               floor:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 50
 *                 description: Floor number
 *               status:
 *                 type: string
 *                 enum: [available, rented, maintenance]
 *                 description: Apartment status
 *             example:
 *               floor: 6
 *               status: rented
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Apartment'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 *   delete:
 *     summary: Delete an apartment
 *     description: Only admins can delete apartments.
 *     tags: [Apartments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: apartmentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Apartment ID
 *     responses:
 *       "204":
 *         description: No content
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 */

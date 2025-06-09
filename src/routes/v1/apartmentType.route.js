const express = require('express');
const auth = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validate.middleware');
const apartmentValidation = require('../../validations/apartment.validation');
const apartmentTypeController = require('../../controllers/apartmentType.controller');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for apartment type management operations
const apartmentTypeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    statusCode: 429,
    message: "Too many apartment type requests, please try again later.",
  },
});

// Stricter rate limiting for apartment type creation
const createApartmentTypeLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10, // Limit each IP to 10 apartment type creations per windowMs
  message: {
    statusCode: 429,
    message: "Too many apartment type creation requests, please try again later.",
  },
});

router
  .route('/')
  .post(
    createApartmentTypeLimiter,
    auth('manageApartmentTypes'),
    validate(apartmentValidation.createApartmentType),
    apartmentTypeController.createApartmentType
  )
  .get(
    apartmentTypeLimiter,
    auth('getApartments'),
    validate(apartmentValidation.getApartmentTypes),
    apartmentTypeController.getApartmentTypes
  );

router
  .route('/:apartmentTypeId')
  .get(
    apartmentTypeLimiter,
    auth('getApartments'),
    validate(apartmentValidation.getApartmentType),
    apartmentTypeController.getApartmentType
  )
  .patch(
    apartmentTypeLimiter,
    auth('manageApartmentTypes'),
    validate(apartmentValidation.updateApartmentType),
    apartmentTypeController.updateApartmentType
  )
  .delete(
    apartmentTypeLimiter,
    auth('manageApartmentTypes'),
    validate(apartmentValidation.deleteApartmentType),
    apartmentTypeController.deleteApartmentType
  );

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Apartment Types
 *   description: Apartment type management and retrieval
 */

/**
 * @swagger
 * /apartment-types:
 *   post:
 *     summary: Create an apartment type
 *     description: Only managers and admins can create apartment types.
 *     tags: [Apartment Types]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - typeName
 *               - area
 *               - numBedrooms
 *               - numBathrooms
 *               - rentFee
 *             properties:
 *               typeName:
 *                 type: string
 *                 maxLength: 100
 *                 description: Name of the apartment type
 *               area:
 *                 type: number
 *                 minimum: 0
 *                 description: Area in square meters
 *               numBedrooms:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 10
 *                 description: Number of bedrooms
 *               numBathrooms:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 10
 *                 description: Number of bathrooms
 *               rentFee:
 *                 type: number
 *                 minimum: 0
 *                 description: Monthly rent fee
 *               description:
 *                 type: string
 *                 description: Description of the apartment type
 *             example:
 *               typeName: "Studio"
 *               area: 35.5
 *               numBedrooms: 0
 *               numBathrooms: 1
 *               rentFee: 500000
 *               description: "Cozy studio apartment perfect for single residents"
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApartmentType'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 *
 *   get:
 *     summary: Get all apartment types
 *     description: Retrieve apartment types with optional filtering and pagination.
 *     tags: [Apartment Types]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: typeName
 *         schema:
 *           type: string
 *         description: Filter by apartment type name (partial match)
 *       - in: query
 *         name: minArea
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Minimum area filter
 *       - in: query
 *         name: maxArea
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Maximum area filter
 *       - in: query
 *         name: numBedrooms
 *         schema:
 *           type: integer
 *           minimum: 0
 *           maximum: 10
 *         description: Filter by number of bedrooms
 *       - in: query
 *         name: numBathrooms
 *         schema:
 *           type: integer
 *           minimum: 0
 *           maximum: 10
 *         description: Filter by number of bathrooms
 *       - in: query
 *         name: minRentFee
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Minimum rent fee filter
 *       - in: query
 *         name: maxRentFee
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Maximum rent fee filter
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: sort by query in the form of field:desc/asc (ex. rentFee:asc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Maximum number of apartment types
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
 *                 apartmentTypes:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ApartmentType'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 */

/**
 * @swagger
 * /apartment-types/{apartmentTypeId}:
 *   get:
 *     summary: Get an apartment type
 *     description: Get apartment type information by ID.
 *     tags: [Apartment Types]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: apartmentTypeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Apartment type ID
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApartmentType'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *       "500":
 *         $ref: '#/components/responses/InternalServerError'
 *
 *   patch:
 *     summary: Update an apartment type
 *     description: Only managers and admins can update apartment types.
 *     tags: [Apartment Types]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: apartmentTypeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Apartment type ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               typeName:
 *                 type: string
 *                 maxLength: 100
 *                 description: Name of the apartment type
 *               area:
 *                 type: number
 *                 minimum: 0
 *                 description: Area in square meters
 *               numBedrooms:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 10
 *                 description: Number of bedrooms
 *               numBathrooms:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 10
 *                 description: Number of bathrooms
 *               rentFee:
 *                 type: number
 *                 minimum: 0
 *                 description: Monthly rent fee
 *               description:
 *                 type: string
 *                 description: Description of the apartment type
 *             example:
 *               rentFee: 550000
 *               description: "Updated studio apartment description"
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApartmentType'
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
 *
 *   delete:
 *     summary: Delete an apartment type
 *     description: Only admins can delete apartment types. Cannot delete if apartments are using this type.
 *     tags: [Apartment Types]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: apartmentTypeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Apartment type ID
 *     responses:
 *       "204":
 *         description: No content
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
 */

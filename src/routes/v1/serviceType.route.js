const express = require('express');
const auth = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validate.middleware');
const serviceTypeValidation = require('../../validations/serviceType.validation');
const serviceTypeController = require('../../controllers/serviceType.controller');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for service type management operations
const serviceTypeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    statusCode: 429,
    message: "Too many service type requests, please try again later.",
  },
});

// Stricter rate limiting for service type creation
const createServiceTypeLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20, // Limit each IP to 20 service type creations per windowMs
  message: {
    statusCode: 429,
    message: "Too many service type creation requests, please try again later.",
  },
});

router
  .route('/')
  .post(
    createServiceTypeLimiter,
    auth('manageServiceTypes'),
    validate(serviceTypeValidation.createServiceType),
    serviceTypeController.createServiceType
  )
  .get(
    serviceTypeLimiter,
    auth('getServiceTypes'),
    validate(serviceTypeValidation.getServiceTypes),
    serviceTypeController.getServiceTypes
  );

router
  .route('/:serviceTypeId')
  .get(
    serviceTypeLimiter,
    auth('getServiceTypes'),
    validate(serviceTypeValidation.getServiceType),
    serviceTypeController.getServiceType
  )
  .patch(
    serviceTypeLimiter,
    auth('manageServiceTypes'),
    validate(serviceTypeValidation.updateServiceType),
    serviceTypeController.updateServiceType
  )
  .delete(
    serviceTypeLimiter,
    auth('manageServiceTypes'),
    validate(serviceTypeValidation.deleteServiceType),
    serviceTypeController.deleteServiceType
  );

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: ServiceTypes
 *   description: Service type management and retrieval
 */

/**
 * @swagger
 * /service-types:
 *   post:
 *     summary: Create a service type
 *     description: Only authorized users can create service types.
 *     tags: [ServiceTypes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - serviceName
 *               - unit
 *               - unitPrice
 *             properties:
 *               serviceName:
 *                 type: string
 *                 maxLength: 100
 *                 description: Name of the service
 *               unit:
 *                 type: string
 *                 maxLength: 20
 *                 description: Unit of measurement
 *               unitPrice:
 *                 type: number
 *                 format: decimal
 *                 minimum: 0
 *                 description: Price per unit
 *             example:
 *               serviceName: "Electricity"
 *               unit: "kWh"
 *               unitPrice: 3500
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
 *                 serviceTypeId:
 *                   type: integer
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all service types
 *     description: Retrieve service types with optional filtering and pagination.
 *     tags: [ServiceTypes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: serviceName
 *         schema:
 *           type: string
 *         description: Filter by service name
 *       - in: query
 *         name: unit
 *         schema:
 *           type: string
 *         description: Filter by unit
 *       - in: query
 *         name: minUnitPrice
 *         schema:
 *           type: number
 *         description: Minimum unit price filter
 *       - in: query
 *         name: maxUnitPrice
 *         schema:
 *           type: number
 *         description: Maximum unit price filter
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: sort by query in the form of field:desc/asc (ex. serviceName:asc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Maximum number of service types
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
 *                     $ref: '#/components/schemas/ServiceType'
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
 *
 * /service-types/{id}:
 *   get:
 *     summary: Get a service type
 *     description: Get service type information by ID.
 *     tags: [ServiceTypes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Service type ID
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/ServiceType'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a service type
 *     description: Update service type information.
 *     tags: [ServiceTypes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Service type ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               serviceName:
 *                 type: string
 *                 maxLength: 100
 *               unit:
 *                 type: string
 *                 maxLength: 20
 *               unitPrice:
 *                 type: number
 *                 format: decimal
 *                 minimum: 0
 *             example:
 *               serviceName: "Water Supply"
 *               unitPrice: 4000
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/ServiceType'
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
 *     summary: Delete a service type
 *     description: Delete a service type by ID.
 *     tags: [ServiceTypes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Service type ID
 *     responses:
 *       "204":
 *         description: No content
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

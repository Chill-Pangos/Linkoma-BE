const express = require('express');
const auth = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validate.middleware');
const serviceRegistrationValidation = require('../../validations/serviceRegistration.validation');
const serviceRegistrationController = require('../../controllers/serviceRegistration.controller');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for service registration management operations
const serviceRegistrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    statusCode: 429,
    message: "Too many service registration requests, please try again later.",
  },
});

// Stricter rate limiting for service registration creation
const createServiceRegistrationLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 30, // Limit each IP to 30 service registration creations per windowMs
  message: {
    statusCode: 429,
    message: "Too many service registration creation requests, please try again later.",
  },
});

router
  .route('/')
  .post(
    createServiceRegistrationLimiter,
    auth('manageServiceRegistrations'),
    validate(serviceRegistrationValidation.createServiceRegistration),
    serviceRegistrationController.createServiceRegistration
  )
  .get(
    serviceRegistrationLimiter,
    auth('getServiceRegistrations'),
    validate(serviceRegistrationValidation.getServiceRegistrations),
    serviceRegistrationController.getServiceRegistrations
  );

router
  .route('/:serviceRegistrationId')
  .get(
    serviceRegistrationLimiter,
    auth('getServiceRegistrations'),
    validate(serviceRegistrationValidation.getServiceRegistration),
    serviceRegistrationController.getServiceRegistration
  )
  .patch(
    serviceRegistrationLimiter,
    auth('manageServiceRegistrations'),
    validate(serviceRegistrationValidation.updateServiceRegistration),
    serviceRegistrationController.updateServiceRegistration
  )
  .delete(
    serviceRegistrationLimiter,
    auth('manageServiceRegistrations'),
    validate(serviceRegistrationValidation.deleteServiceRegistration),
    serviceRegistrationController.deleteServiceRegistration
  );

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: ServiceRegistrations
 *   description: Service registration management and retrieval
 */

/**
 * @swagger
 * /service-registrations:
 *   post:
 *     summary: Create a service registration
 *     description: Only authorized users can create service registrations.
 *     tags: [ServiceRegistrations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - apartmentId
 *               - serviceTypeId
 *               - startDate
 *             properties:
 *               apartmentId:
 *                 type: integer
 *                 description: ID of the apartment
 *               serviceTypeId:
 *                 type: integer
 *                 description: ID of the service type
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Start date of service registration
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: End date of service registration
 *               status:
 *                 type: string
 *                 enum: [Active, Inactive, Cancelled]
 *                 default: Active
 *                 description: Status of the service registration
 *               note:
 *                 type: string
 *                 maxLength: 500
 *                 description: Additional notes
 *             example:
 *               apartmentId: 1
 *               serviceTypeId: 1
 *               startDate: "2025-01-01"
 *               endDate: "2025-12-31"
 *               status: "Active"
 *               note: "Annual electricity service"
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
 *                 serviceRegistrationId:
 *                   type: integer
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all service registrations
 *     description: Retrieve service registrations with optional filtering and pagination.
 *     tags: [ServiceRegistrations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: apartmentId
 *         schema:
 *           type: integer
 *         description: Filter by apartment ID
 *       - in: query
 *         name: serviceTypeId
 *         schema:
 *           type: integer
 *         description: Filter by service type ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Active, Inactive, Cancelled]
 *         description: Filter by status
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by end date
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: sort by query in the form of field:desc/asc (ex. startDate:desc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Maximum number of service registrations
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
 *                     $ref: '#/components/schemas/ServiceRegistration'
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
 * /service-registrations/{id}:
 *   get:
 *     summary: Get a service registration
 *     description: Get service registration information by ID.
 *     tags: [ServiceRegistrations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Service registration ID
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/ServiceRegistration'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a service registration
 *     description: Update service registration information.
 *     tags: [ServiceRegistrations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Service registration ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               apartmentId:
 *                 type: integer
 *               serviceTypeId:
 *                 type: integer
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [Active, Inactive, Cancelled]
 *               note:
 *                 type: string
 *                 maxLength: 500
 *             example:
 *               status: "Inactive"
 *               note: "Service temporarily suspended"
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/ServiceRegistration'
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
 *     summary: Delete a service registration
 *     description: Delete a service registration by ID.
 *     tags: [ServiceRegistrations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Service registration ID
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

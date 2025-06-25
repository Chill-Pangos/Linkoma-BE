const express = require('express');
const rateLimit = require('express-rate-limit');
const auth = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validate.middleware');
const invoiceValidation = require('../../validations/invoice.validation');
const invoiceController = require('../../controllers/invoice.controller');

const router = express.Router();

// Rate limiting
const createInvoiceLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: 'Too many invoice creation attempts, please try again later.',
});

const getInvoicesLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.',
});

const updateDeleteLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // limit each IP to 30 requests per windowMs
  message: 'Too many update/delete attempts, please try again later.',
});

router
  .route('/')
  .post(
    createInvoiceLimit,
    auth('manageInvoices'),
    validate(invoiceValidation.createInvoice),
    invoiceController.createInvoice
  )
  .get(
    getInvoicesLimit,
    auth('getInvoices'),
    validate(invoiceValidation.getInvoices),
    invoiceController.getInvoices
  );

router
  .route('/with-details')
  .post(
    createInvoiceLimit,
    auth('manageInvoices'),
    validate(invoiceValidation.createInvoiceWithDetails),
    invoiceController.createInvoiceWithDetails
  );

router
  .route('/:invoiceId')
  .get(
    getInvoicesLimit,
    auth('getInvoices'),
    validate(invoiceValidation.getInvoice),
    invoiceController.getInvoice
  )
  .patch(
    updateDeleteLimit,
    auth('manageInvoices'),
    validate(invoiceValidation.updateInvoice),
    invoiceController.updateInvoice
  )
  .delete(
    updateDeleteLimit,
    auth('manageInvoices'),
    validate(invoiceValidation.deleteInvoice),
    invoiceController.deleteInvoice
  );

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Invoices
 *   description: Invoice management
 */

/**
 * @swagger
 * /invoices:
 *   post:
 *     summary: Create an invoice
 *     description: Only users with manageInvoices permission can create invoices. Due date will be automatically set to 7 days from creation date if not provided.
 *     tags: [Invoices]
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
 *             properties:
 *               apartmentId:
 *                 type: integer
 *               rentFee:
 *                 type: number
 *               serviceFee:
 *                 type: number
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 description: Due date (optional - defaults to 7 days from creation)
 *               status:
 *                 type: string
 *                 enum: [Paid, Unpaid, Overdue]
 *             example:
 *               apartmentId: 1
 *               rentFee: 1000
 *               serviceFee: 200
 *               status: "Unpaid"
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
 *                 invoiceId:
 *                   type: integer
 *                 dueDate:
 *                   type: string
 *                   format: date
 *                   description: Auto-generated due date (7 days from creation)
 *                 rentFee:
 *                   type: number
 *                 serviceFee:
 *                   type: number
 *                 totalAmount:
 *                   type: number
 *                 status:
 *                   type: string
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all invoices
 *     description: Only users with getInvoices permission can retrieve invoices.
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: apartmentId
 *         schema:
 *           type: integer
 *         description: Filter by apartment ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Paid, Unpaid, Overdue]
 *         description: Filter by status
 *       - in: query
 *         name: minRentFee
 *         schema:
 *           type: number
 *         description: Minimum rent fee filter
 *       - in: query
 *         name: maxRentFee
 *         schema:
 *           type: number
 *         description: Maximum rent fee filter
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
 *         description: Maximum number of invoices
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
 *                     $ref: '#/components/schemas/Invoice'
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
 * /invoices/with-details:
 *   post:
 *     summary: Create an invoice with details
 *     description: Only users with manageInvoices permission can create invoices with details based on provided service usages. Rent fee is automatically taken from apartment type. Due date is automatically set to 7 days from creation.
 *     tags: [Invoices]
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
 *               - serviceUsages
 *             properties:
 *               apartmentId:
 *                 type: integer
 *                 description: ID of the apartment
 *               serviceUsages:
 *                 type: array
 *                 description: Array of service usage data
 *                 items:
 *                   type: object
 *                   required:
 *                     - serviceTypeId
 *                     - usage
 *                   properties:
 *                     serviceTypeId:
 *                       type: integer
 *                       description: ID of the service type
 *                     usage:
 *                       type: number
 *                       description: Usage amount for this service
 *             example:
 *               apartmentId: 1
 *               serviceUsages:
 *                 - serviceTypeId: 1
 *                   usage: 150
 *                 - serviceTypeId: 2
 *                   usage: 25
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
 *                 invoiceId:
 *                   type: integer
 *                 dueDate:
 *                   type: string
 *                   format: date
 *                   description: Auto-generated due date (7 days from creation)
 *                 rentFee:
 *                   type: number
 *                 serviceFee:
 *                   type: number
 *                 totalAmount:
 *                   type: number
 *                 invoiceDetailsCount:
 *                   type: integer
 *                 serviceDetails:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       serviceName:
 *                         type: string
 *                       unit:
 *                         type: string
 *                       unitPrice:
 *                         type: number
 *                       usage:
 *                         type: number
 *                       totalAmount:
 *                         type: number
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /invoices/{id}:
 *   get:
 *     summary: Get an invoice
 *     description: Only users with getInvoices permission can retrieve invoices.
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Invoice id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Invoice'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update an invoice
 *     description: Only users with manageInvoices permission can update invoices.
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Invoice id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rentFee:
 *                 type: number
 *               serviceFee:
 *                 type: number
 *               dueDate:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [Paid, Unpaid, Overdue]
 *             example:
 *               status: "Paid"
 *     responses:
 *       "200":
 *         description: OK
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
 *     summary: Delete an invoice
 *     description: Only users with manageInvoices permission can delete invoices.
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Invoice id
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

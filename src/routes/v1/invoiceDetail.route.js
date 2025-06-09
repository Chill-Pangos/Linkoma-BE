const express = require('express');
const rateLimit = require('express-rate-limit');
const auth = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validate.middleware');
const invoiceDetailValidation = require('../../validations/invoiceDetail.validation');
const invoiceDetailController = require('../../controllers/invoiceDetail.controller');

const router = express.Router();

// Rate limiting
const createInvoiceDetailLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  message: 'Too many invoice detail creation attempts, please try again later.',
});

const getInvoiceDetailsLimit = rateLimit({
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
    createInvoiceDetailLimit,
    auth('manageInvoiceDetails'),
    validate(invoiceDetailValidation.createInvoiceDetail),
    invoiceDetailController.createInvoiceDetail
  )
  .get(
    getInvoiceDetailsLimit,
    auth('getInvoiceDetails'),
    validate(invoiceDetailValidation.getInvoiceDetails),
    invoiceDetailController.getInvoiceDetails
  );

router
  .route('/:invoiceDetailId')
  .get(
    getInvoiceDetailsLimit,
    auth('getInvoiceDetails'),
    validate(invoiceDetailValidation.getInvoiceDetail),
    invoiceDetailController.getInvoiceDetail
  )
  .patch(
    updateDeleteLimit,
    auth('manageInvoiceDetails'),
    validate(invoiceDetailValidation.updateInvoiceDetail),
    invoiceDetailController.updateInvoiceDetail
  )
  .delete(
    updateDeleteLimit,
    auth('manageInvoiceDetails'),
    validate(invoiceDetailValidation.deleteInvoiceDetail),
    invoiceDetailController.deleteInvoiceDetail
  );

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: InvoiceDetails
 *   description: Invoice detail management
 */

/**
 * @swagger
 * /invoice-details:
 *   post:
 *     summary: Create an invoice detail
 *     description: Only users with manageInvoiceDetails permission can create invoice details.
 *     tags: [InvoiceDetails]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - invoiceId
 *               - serviceTypeId
 *               - usage
 *               - totalAmount
 *             properties:
 *               invoiceId:
 *                 type: integer
 *               serviceTypeId:
 *                 type: integer
 *               usage:
 *                 type: number
 *               totalAmount:
 *                 type: number
 *             example:
 *               invoiceId: 1
 *               serviceTypeId: 1
 *               usage: 150
 *               totalAmount: 300
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
 *                 invoiceDetailId:
 *                   type: integer
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all invoice details
 *     description: Only users with getInvoiceDetails permission can retrieve invoice details.
 *     tags: [InvoiceDetails]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: invoiceId
 *         schema:
 *           type: integer
 *         description: Filter by invoice ID
 *       - in: query
 *         name: serviceTypeId
 *         schema:
 *           type: integer
 *         description: Filter by service type ID
 *       - in: query
 *         name: minUsage
 *         schema:
 *           type: number
 *         description: Minimum usage filter
 *       - in: query
 *         name: maxUsage
 *         schema:
 *           type: number
 *         description: Maximum usage filter
 *       - in: query
 *         name: minTotalAmount
 *         schema:
 *           type: number
 *         description: Minimum total amount filter
 *       - in: query
 *         name: maxTotalAmount
 *         schema:
 *           type: number
 *         description: Maximum total amount filter
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: sort by query in the form of field:desc/asc (ex. usage:desc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of invoice details
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
 *                     $ref: '#/components/schemas/InvoiceDetail'
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
 * /invoice-details/{id}:
 *   get:
 *     summary: Get an invoice detail
 *     description: Only users with getInvoiceDetails permission can retrieve invoice details.
 *     tags: [InvoiceDetails]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Invoice detail id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/InvoiceDetail'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update an invoice detail
 *     description: Only users with manageInvoiceDetails permission can update invoice details.
 *     tags: [InvoiceDetails]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Invoice detail id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               usage:
 *                 type: number
 *               totalAmount:
 *                 type: number
 *             example:
 *               usage: 200
 *               totalAmount: 400
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
 *     summary: Delete an invoice detail
 *     description: Only users with manageInvoiceDetails permission can delete invoice details.
 *     tags: [InvoiceDetails]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Invoice detail id
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

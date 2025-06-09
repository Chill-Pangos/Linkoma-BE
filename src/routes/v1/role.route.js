const express = require('express');
const rateLimit = require('express-rate-limit');
const auth = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validate.middleware');
const roleValidation = require('../../validations/role.validation');
const roleController = require('../../controllers/role.controller');

const router = express.Router();

// Rate limiting for role management operations
const roleGeneralLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many role requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const roleModificationLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes  
  max: 20, // Limit each IP to 20 role modifications per windowMs
  message: {
    error: 'Too many role modification requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router
  .route('/')
  .get(
    roleGeneralLimiter,
    auth('systemConfig'),
    roleController.getAllRoles
  );

router
  .route('/:role/permissions')
  .get(
    roleGeneralLimiter,
    auth('systemConfig'),
    validate(roleValidation.getRolePermissions),
    roleController.getRolePermissions
  );

router
  .route('/:role/permissions/:permission')
  .get(
    roleGeneralLimiter,
    auth('systemConfig'),
    validate(roleValidation.checkRolePermission),
    roleController.checkRolePermission
  );

router
  .route('/assign/:userId')
  .post(
    roleModificationLimiter,
    auth('manageUsers'),
    validate(roleValidation.assignRoleToUser),
    roleController.assignRoleToUser
  );

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: Role management and permissions
 */

/**
 * @swagger
 * /roles:
 *   get:
 *     summary: Get all available roles
 *     description: Only admins can retrieve all roles.
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 roles:
 *                   type: array
 *                   items:
 *                     type: string
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /roles/{role}/permissions:
 *   get:
 *     summary: Get permissions for a specific role
 *     description: Only admins can view role permissions.
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: role
 *         required: true
 *         schema:
 *           type: string
 *           enum: [user, resident, manager, admin]
 *         description: Role name
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 role:
 *                   type: string
 *                 permissions:
 *                   type: array
 *                   items:
 *                     type: string
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /roles/assign/{userId}:
 *   post:
 *     summary: Assign role to user
 *     description: Only admins can assign roles to users.
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [user, resident, manager, admin]
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 userId:
 *                   type: integer
 *                 role:
 *                   type: string
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

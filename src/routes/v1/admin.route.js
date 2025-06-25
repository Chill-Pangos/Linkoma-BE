const express = require("express");
const adminController = require("../../controllers/admin.controller");
const adminValidation = require("../../validations/admin.validation");
const validate = require("../../middlewares/validate.middleware");
const  auth  = require("../../middlewares/auth.middleware");

const router = express.Router();

// All admin routes require admin permission
router.use(auth("admin"));

/** * @swagger
 * /admin/revenue/monthly:
 *   get:
 *     summary: Get monthly revenue statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Year to aggregate (default to current year)
 *     responses:
 *       200:
 *         description: Monthly revenue statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/revenue/monthly",
  validate(adminValidation.getMonthlyRevenue),
  adminController.getMonthlyRevenue
);

/** * @swagger
 * /admin/revenue/monthly/{year}/{month}:
 *   get:
 *     summary: Get detailed monthly revenue statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *         description: Year
 *       - in: path
 *         name: month
 *         required: true
 *         schema:
 *           type: integer
 *         description: Month (1-12)
 *     responses:
 *       200:
 *         description: Detailed monthly revenue statistics
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/revenue/monthly/:year/:month",
  validate(adminValidation.getDetailedMonthlyRevenue),
  adminController.getDetailedMonthlyRevenue
);

/** * @swagger
 * /admin/revenue/service-types:
 *   get:
 *     summary: Get revenue statistics by service type
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Year to aggregate (default to current year)
 *     responses:
 *       200:
 *         description: Service type revenue statistics
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/revenue/service-types",
  validate(adminValidation.getRevenueByServiceType),
  adminController.getRevenueByServiceType
);

/** * @swagger
 * /admin/overview:
 *   get:
 *     summary: Get system overview statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System overview statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/overview", adminController.getSystemOverview);

/**
 * @swagger
 * /admin/apartments/service-usage:
 *   get:
 *     summary: Get apartment count by service type usage
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Year to filter registrations (optional)
 *     responses:
 *       200:
 *         description: Apartment service usage statistics
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/apartments/service-usage",
  validate(adminValidation.getApartmentCountByServiceType),
  adminController.getApartmentCountByServiceType
);

/**
 * @swagger
 * /admin/apartments/service/{serviceTypeId}:
 *   get:
 *     summary: Get apartments that actually used a specific service type
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: serviceTypeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Service type ID
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Year to filter usage (optional)
 *     responses:
 *       200:
 *         description: List of apartments that used the service with usage statistics
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Service type not found
 */
router.get(
  "/apartments/service/:serviceTypeId",
  validate(adminValidation.getApartmentsByServiceType),
  adminController.getApartmentsByServiceType
);

/**
 * @swagger
 * /admin/report:
 *   get:
 *     summary: Get complete report data
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Year for monthly trend
 *     responses:
 *       200:
 *         description: Complete report data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     overview:
 *                       type: object
 *                     monthlyTrend:
 *                       type: array
 *                     serviceDistribution:
 *                       type: array
 *                     apartmentStatus:
 *                       type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/report",
  validate(adminValidation.getReportData),
  adminController.getReportData
);

/**
 * @swagger
 * /admin/dashboard/overview:
 *   get:
 *     summary: Get dashboard overview statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering
 *     responses:
 *       200:
 *         description: Dashboard overview statistics
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/dashboard/overview",
  validate(adminValidation.getDashboardOverview),
  adminController.getDashboardOverview
);

/**
 * @swagger
 * /admin/dashboard/monthly-trend:
 *   get:
 *     summary: Get monthly revenue trend
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Year for trend data
 *     responses:
 *       200:
 *         description: Monthly revenue trend
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/dashboard/monthly-trend",
  validate(adminValidation.getDashboardMonthlyTrend),
  adminController.getDashboardMonthlyTrend
);

/**
 * @swagger
 * /admin/dashboard/service-distribution:
 *   get:
 *     summary: Get service distribution statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Service distribution statistics
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/dashboard/service-distribution",
  adminController.getDashboardServiceDistribution
);

/**
 * @swagger
 * /admin/dashboard/apartment-status:
 *   get:
 *     summary: Get apartment status distribution
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Apartment status distribution
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/dashboard/apartment-status",
  adminController.getDashboardApartmentStatus
);

/**
 * @swagger
 * /admin/dashboard/recent-activities:
 *   get:
 *     summary: Get recent activities
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *         description: Number of activities to return
 *     responses:
 *       200:
 *         description: Recent activities
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/dashboard/recent-activities",
  validate(adminValidation.getDashboardRecentActivities),
  adminController.getDashboardRecentActivities
);

/**
 * @swagger
 * /admin/dashboard-vn:
 *   get:
 *     summary: Get complete dashboard data (Vietnamese interface)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Year for filtering
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         description: Month for filtering
 *     responses:
 *       200:
 *         description: Complete dashboard data with Vietnamese interface
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     mainStats:
 *                       type: object
 *                     quickOverview:
 *                       type: object
 *                     recentActivities:
 *                       type: array
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/dashboard-vn",
  validate(adminValidation.getDashboardVN),
  adminController.getDashboardVN
);

/**
 * @swagger
 * /admin/dashboard/main-stats:
 *   get:
 *     summary: Get dashboard main statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Year for filtering
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *         description: Month for filtering
 *     responses:
 *       200:
 *         description: Dashboard main statistics
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/dashboard/main-stats",
  validate(adminValidation.getDashboardMainStats),
  adminController.getDashboardMainStats
);

/**
 * @swagger
 * /admin/dashboard/quick-overview:
 *   get:
 *     summary: Get dashboard quick overview
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard quick overview
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/dashboard/quick-overview",
  adminController.getDashboardQuickOverview
);

/**
 * @swagger
 * /admin/dashboard/recent-activities-vn:
 *   get:
 *     summary: Get recent activities (Vietnamese)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *         description: Number of activities to return
 *     responses:
 *       200:
 *         description: Recent activities with Vietnamese messages
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  "/dashboard/recent-activities-vn",
  validate(adminValidation.getDashboardRecentActivities),
  adminController.getDashboardRecentActivitiesVN
);

module.exports = router;

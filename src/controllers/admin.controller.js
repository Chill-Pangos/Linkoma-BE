const catchAsync = require("../utils/catchAsync");
const adminService = require("../services/admin.service");
const apiError = require("../utils/apiError");

/**
 * @description Get monthly revenue for the year
 * @route GET /api/v1/admin/revenue/monthly
 * @access Private (Admin only)
 */
const getMonthlyRevenue = catchAsync(async (req, res) => {
  const { year } = req.query;
  const yearNumber = year ? parseInt(year) : new Date().getFullYear();

  if (yearNumber < 2000 || yearNumber > new Date().getFullYear() + 1) {
    throw new apiError(400, "Invalid year");
  }

  const result = await adminService.getMonthlyRevenue(yearNumber);

  res.status(200).json({
    code: 200,
    message: "Monthly revenue statistics retrieved successfully",
    data: result,
  });
});

/**
 * @description Get detailed monthly revenue
 * @route GET /api/v1/admin/revenue/monthly/:year/:month
 * @access Private (Admin only)
 */
const getDetailedMonthlyRevenue = catchAsync(async (req, res) => {
  const { year, month } = req.params;
  const yearNumber = parseInt(year);
  const monthNumber = parseInt(month);
  if (!yearNumber || !monthNumber) {
    throw new apiError(400, "Year and month must be numbers");
  }

  if (yearNumber < 2000 || yearNumber > new Date().getFullYear() + 1) {
    throw new apiError(400, "Invalid year");
  }

  if (monthNumber < 1 || monthNumber > 12) {
    throw new apiError(400, "Invalid month");
  }
  const result = await adminService.getDetailedMonthlyRevenue(
    yearNumber,
    monthNumber
  );

  res.status(200).json({
    code: 200,
    message: "Detailed revenue statistics retrieved successfully",
    data: result,
  });
});

/**
 * @description Get revenue by service type
 * @route GET /api/v1/admin/revenue/service-types
 * @access Private (Admin only)
 */
const getRevenueByServiceType = catchAsync(async (req, res) => {
  const { year } = req.query;
  const yearNumber = year ? parseInt(year) : new Date().getFullYear();

  if (yearNumber < 2000 || yearNumber > new Date().getFullYear() + 1) {
    throw new apiError(400, "Invalid year");
  }
  const result = await adminService.getRevenueByServiceType(yearNumber);

  res.status(200).json({
    code: 200,
    message: "Service revenue statistics retrieved successfully",
    data: result,
  });
});

/**
 * @description Get system overview statistics
 * @route GET /api/v1/admin/overview
 * @access Private (Admin only)
 */
const getSystemOverview = catchAsync(async (req, res) => {
  const result = await adminService.getSystemOverview();
  res.status(200).json({
    code: 200,
    message: "System overview retrieved successfully",
    data: result,
  });
});

/**
 * @description Get apartment count by service type usage
 * @route GET /api/v1/admin/apartments/service-usage
 * @access Private (Admin only)
 */
const getApartmentCountByServiceType = catchAsync(async (req, res) => {
  const { year } = req.query;
  const yearNumber = year ? parseInt(year) : null;

  if (year && (yearNumber < 2000 || yearNumber > new Date().getFullYear() + 1)) {
    throw new apiError(400, "Invalid year");
  }

  const result = await adminService.getApartmentCountByServiceType(yearNumber);

  res.status(200).json({
    code: 200,
    message: "Apartment service usage statistics retrieved successfully",
    data: result,
  });
});

/**
 * @description Get apartments that registered for a specific service type
 * @route GET /api/v1/admin/apartments/service/:serviceTypeId
 * @access Private (Admin only)
 */
const getApartmentsByServiceType = catchAsync(async (req, res) => {
  const { serviceTypeId } = req.params;
  const { status = "Active" } = req.query;

  if (!serviceTypeId || isNaN(parseInt(serviceTypeId))) {
    throw new apiError(400, "Valid service type ID is required");
  }

  const result = await adminService.getApartmentsByServiceType(
    parseInt(serviceTypeId),
    status
  );

  res.status(200).json({
    code: 200,
    message: "Apartments by service type retrieved successfully",
    data: result,
  });
});

/**
 * Get dashboard overview statistics
 * @route GET /api/v1/admin/dashboard/overview
 * @access Private (Admin only)
 */
const getDashboardOverview = catchAsync(async (req, res) => {
  const { startDate, endDate } = req.query;

  const filter = {};
  if (startDate) filter.startDate = startDate;
  if (endDate) filter.endDate = endDate;

  const result = await adminService.getDashboardOverview(filter);

  res.status(200).json({
    code: 200,
    message: "Dashboard overview retrieved successfully",
    data: result,
  });
});

/**
 * Get monthly revenue trend for dashboard
 * @route GET /api/v1/admin/dashboard/monthly-trend
 * @access Private (Admin only)
 */
const getDashboardMonthlyTrend = catchAsync(async (req, res) => {
  const { year } = req.query;
  const yearNumber = year ? parseInt(year) : new Date().getFullYear();

  if (yearNumber < 2000 || yearNumber > new Date().getFullYear() + 1) {
    throw new apiError(400, "Invalid year");
  }

  const result = await adminService.getDashboardMonthlyTrend({ year: yearNumber });

  res.status(200).json({
    code: 200,
    message: "Monthly trend retrieved successfully",
    data: result,
  });
});

/**
 * Get service distribution for dashboard
 * @route GET /api/v1/admin/dashboard/service-distribution
 * @access Private (Admin only)
 */
const getDashboardServiceDistribution = catchAsync(async (req, res) => {
  const result = await adminService.getDashboardServiceDistribution();

  res.status(200).json({
    code: 200,
    message: "Service distribution retrieved successfully",
    data: result,
  });
});

/**
 * Get apartment status distribution for dashboard
 * @route GET /api/v1/admin/dashboard/apartment-status
 * @access Private (Admin only)
 */
const getDashboardApartmentStatus = catchAsync(async (req, res) => {
  const result = await adminService.getDashboardApartmentStatus();

  res.status(200).json({
    code: 200,
    message: "Apartment status distribution retrieved successfully",
    data: result,
  });
});

/**
 * Get recent activities for dashboard
 * @route GET /api/v1/admin/dashboard/recent-activities
 * @access Private (Admin only)
 */
const getDashboardRecentActivities = catchAsync(async (req, res) => {
  const { limit } = req.query;
  const limitNumber = limit ? parseInt(limit) : 10;

  if (limitNumber < 1 || limitNumber > 50) {
    throw new apiError(400, "Limit must be between 1 and 50");
  }

  const result = await adminService.getDashboardRecentActivities(limitNumber);

  res.status(200).json({
    code: 200,
    message: "Recent activities retrieved successfully",
    data: result,
  });
});

/**
 * Get complete report data
 * @route GET /api/v1/admin/report
 * @access Private (Admin only)
 */
const getReportData = catchAsync(async (req, res) => {
  const { startDate, endDate, year } = req.query;
  
  const filter = {};
  if (startDate) filter.startDate = startDate;
  if (endDate) filter.endDate = endDate;
  if (year) {
    const yearNumber = parseInt(year);
    if (yearNumber < 2000 || yearNumber > new Date().getFullYear() + 1) {
      throw new apiError(400, "Invalid year");
    }
    filter.year = yearNumber;
  }

  const result = await adminService.getReportData(filter);

  res.status(200).json({
    code: 200,
    message: "Report data retrieved successfully",
    data: result,
  });
});

/**
 * Get dashboard main statistics
 * @route GET /api/v1/admin/dashboard/main-stats
 * @access Private (Admin only)
 */
const getDashboardMainStats = catchAsync(async (req, res) => {
  const { year, month } = req.query;
  
  const filter = {};
  if (year) filter.year = parseInt(year);
  if (month) filter.month = parseInt(month);

  const result = await adminService.getDashboardMainStats(filter);

  res.status(200).json({
    code: 200,
    message: "Dashboard main statistics retrieved successfully",
    data: result,
  });
});

/**
 * Get dashboard quick overview
 * @route GET /api/v1/admin/dashboard/quick-overview
 * @access Private (Admin only)
 */
const getDashboardQuickOverview = catchAsync(async (req, res) => {
  const result = await adminService.getDashboardQuickOverview();

  res.status(200).json({
    code: 200,
    message: "Dashboard quick overview retrieved successfully",
    data: result,
  });
});

/**
 * Get dashboard recent activities (Vietnamese)
 * @route GET /api/v1/admin/dashboard/recent-activities-vn
 * @access Private (Admin only)
 */
const getDashboardRecentActivitiesVN = catchAsync(async (req, res) => {
  const { limit } = req.query;
  const limitNumber = limit ? parseInt(limit) : 10;

  if (limitNumber < 1 || limitNumber > 50) {
    throw new apiError(400, "Limit must be between 1 and 50");
  }

  const result = await adminService.getDashboardRecentActivitiesVN(limitNumber);

  res.status(200).json({
    code: 200,
    message: "Recent activities retrieved successfully",
    data: result,
  });
});

/**
 * Get complete dashboard data (Vietnamese)
 * @route GET /api/v1/admin/dashboard-vn
 * @access Private (Admin only)
 */
const getDashboardVN = catchAsync(async (req, res) => {
  const { year, month } = req.query;
  
  const filter = {};
  if (year) filter.year = parseInt(year);
  if (month) filter.month = parseInt(month);

  const result = await adminService.getDashboardVN(filter);

  res.status(200).json({
    code: 200,
    message: "Dashboard data retrieved successfully",
    data: result,
  });
});

module.exports = {
  getMonthlyRevenue,
  getDetailedMonthlyRevenue,
  getRevenueByServiceType,
  getSystemOverview,
  getApartmentCountByServiceType,
  getApartmentsByServiceType,
  getDashboardOverview,
  getDashboardMonthlyTrend,
  getDashboardServiceDistribution,
  getDashboardApartmentStatus,
  getDashboardRecentActivities,
  getReportData,
  getDashboardMainStats,
  getDashboardQuickOverview,
  getDashboardRecentActivitiesVN,
  getDashboardVN,
};

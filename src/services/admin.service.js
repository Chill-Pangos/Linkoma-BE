const {
  Invoice,
  InvoiceDetail,
  ServiceType,
  Apartment,
  ApartmentType,
  ServiceRegistration,
  User,
} = require("../models");
const { Op, Sequelize } = require("sequelize");
const apiError = require("../utils/apiError");

/**
 * Helper function to get month name in Vietnamese
 * @param {number} month - Month number (1-12)
 * @return {string} - Month name in Vietnamese
 */
const getMonthName = (month) => {
  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
    'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
    'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];
  return monthNames[month - 1] || `Tháng ${month}`;
};

/**
 * @description Aggregate revenue by month for the current year
 * @param {number} year - Year to aggregate (default to current year)
 * @return {Object} - Monthly revenue and total yearly revenue
 * @throws {apiError} - If there is an error during aggregation
 */
const getMonthlyRevenue = async (year = new Date().getFullYear()) => {
  try {
    // Query monthly revenue aggregation
    const monthlyData = await Invoice.findAll({
      attributes: [
        [Sequelize.fn("MONTH", Sequelize.col("createdAt")), "month"],
        [Sequelize.fn("COUNT", Sequelize.col("invoiceId")), "totalInvoices"],
        [Sequelize.fn("SUM", Sequelize.col("rentFee")), "totalRentFee"],
        [Sequelize.fn("SUM", Sequelize.col("serviceFee")), "totalServiceFee"],
        [
          Sequelize.fn(
            "SUM",
            Sequelize.literal("COALESCE(Invoice.rentFee, 0) + COALESCE(Invoice.serviceFee, 0)")
          ),
          "totalRevenue",
        ],
      ],
      where: {
        createdAt: {
          [Op.gte]: new Date(`${year}-01-01`),
          [Op.lt]: new Date(`${year + 1}-01-01`),
        },
        status: "Paid", // Only count paid invoices
      },
      group: [Sequelize.fn("MONTH", Sequelize.col("createdAt"))],
      order: [[Sequelize.fn("MONTH", Sequelize.col("createdAt")), "ASC"]],
      raw: true,
    }); // Create array of 12 months with default data
    const monthlyRevenue = Array.from({ length: 12 }, (_, index) => ({
      month: index + 1,
      monthName: getMonthName(index + 1),
      totalInvoices: 0,
      totalRentFee: 0,
      totalServiceFee: 0,
      totalRevenue: 0,
    })); // Update actual data into array
    monthlyData.forEach((data) => {
      const monthIndex = data.month - 1;
      monthlyRevenue[monthIndex] = {
        month: data.month,
        monthName: getMonthName(data.month),
        totalInvoices: parseInt(data.totalInvoices) || 0,
        totalRentFee: parseFloat(data.totalRentFee) || 0,
        totalServiceFee: parseFloat(data.totalServiceFee) || 0,
        totalRevenue: parseFloat(data.totalRevenue) || 0,
      };
    }); // Calculate total yearly revenue
    const yearlyTotal = monthlyRevenue.reduce(
      (total, month) => ({
        totalInvoices: total.totalInvoices + month.totalInvoices,
        totalRentFee: total.totalRentFee + month.totalRentFee,
        totalServiceFee: total.totalServiceFee + month.totalServiceFee,
        totalRevenue: total.totalRevenue + month.totalRevenue,
      }),
      {
        totalInvoices: 0,
        totalRentFee: 0,
        totalServiceFee: 0,
        totalRevenue: 0,
      }
    );

    return {
      year,
      monthlyRevenue,
      yearlyTotal,
      summary: {
        highestMonth: monthlyRevenue.reduce((max, month) =>
          month.totalRevenue > max.totalRevenue ? month : max
        ),
        lowestMonth: monthlyRevenue.reduce((min, month) =>
          month.totalRevenue < min.totalRevenue ? month : min
        ),
        averageMonthlyRevenue: yearlyTotal.totalRevenue / 12,
      },
    };
  } catch (error) {
    throw new apiError(500, `Error aggregating revenue: ${error.message}`);
  }
};

/**
 * @description Detailed monthly revenue aggregation with apartment information
 * @param {number} year - Year to aggregate
 * @param {number} month - Month to get detailed statistics
 * @return {Object} - Detailed revenue by apartment for the month
 * @throws {apiError} - If there is an error during aggregation
 */
const getDetailedMonthlyRevenue = async (year, month) => {
  try {
    if (!year || !month || month < 1 || month > 12) {
      throw new apiError(400, "Invalid year and month");
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const detailedData = await Invoice.findAll({
      attributes: [
        "invoiceId",
        "rentFee",
        "serviceFee",
        "createdAt",
        "status",
        [
          Sequelize.literal("COALESCE(Invoice.rentFee, 0) + COALESCE(Invoice.serviceFee, 0)"),
          "totalAmount",
        ],
      ],
      where: {
        createdAt: {
          [Op.gte]: startDate,
          [Op.lt]: endDate,
        },
        status: "Paid",
      },
      include: [
        {
          model: Apartment,
          as: "apartment",
          attributes: ["apartmentId", "floor"],
          include: [
            {
              model: ApartmentType,
              as: "apartmentType",
              attributes: ["typeName", "area"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const summary = {
      totalInvoices: detailedData.length,
      totalRentFee: detailedData.reduce(
        (sum, invoice) => sum + parseFloat(invoice.rentFee || 0),
        0
      ),
      totalServiceFee: detailedData.reduce(
        (sum, invoice) => sum + parseFloat(invoice.serviceFee || 0),
        0
      ),
      totalRevenue: detailedData.reduce(
        (sum, invoice) =>
          sum +
          parseFloat(invoice.rentFee || 0) +
          parseFloat(invoice.serviceFee || 0),
        0
      ),
    };

    return {
      year,
      month,
      monthName: getMonthName(month),
      summary,
      invoices: detailedData,
    };
  } catch (error) {
    throw new apiError(
      500,
      `Error aggregating detailed revenue: ${error.message}`
    );
  }
};

/**
 * @description Revenue statistics by service type for the year
 * @param {number} year - Year to aggregate
 * @return {Object} - Revenue by each service type
 * @throws {apiError} - If there is an error during aggregation
 */
const getRevenueByServiceType = async (year = new Date().getFullYear()) => {
  try {
    const serviceRevenueData = await InvoiceDetail.findAll({
      attributes: [
        [
          Sequelize.fn("SUM", Sequelize.col("InvoiceDetail.totalAmount")),
          "totalRevenue",
        ],
        [Sequelize.fn("SUM", Sequelize.col("usage")), "totalUsage"],
        [
          Sequelize.fn("COUNT", Sequelize.col("InvoiceDetail.invoiceDetailId")),
          "totalRecords",
        ],
      ],
      include: [
        {
          model: ServiceType,
          as: "serviceType",
          attributes: ["serviceTypeId", "serviceName", "unit", "unitPrice"],
        },
        {
          model: Invoice,
          as: "invoice",
          attributes: [],
          where: {
            createdAt: {
              [Op.gte]: new Date(`${year}-01-01`),
              [Op.lt]: new Date(`${year + 1}-01-01`),
            },
            status: "Paid",
          },
        },
      ],
      group: ["serviceType.serviceTypeId"],
      order: [
        [
          Sequelize.fn("SUM", Sequelize.col("InvoiceDetail.totalAmount")),
          "DESC",
        ],
      ],
      raw: false,
    });

    const totalServiceRevenue = serviceRevenueData.reduce(
      (sum, item) => sum + parseFloat(item.dataValues.totalRevenue || 0),
      0
    );

    const serviceStats = serviceRevenueData.map((item) => ({
      serviceTypeId: item.serviceType.serviceTypeId,
      serviceName: item.serviceType.serviceName,
      unit: item.serviceType.unit,
      unitPrice: parseFloat(item.serviceType.unitPrice),
      totalRevenue: parseFloat(item.dataValues.totalRevenue || 0),
      totalUsage: parseFloat(item.dataValues.totalUsage || 0),
      totalRecords: parseInt(item.dataValues.totalRecords || 0),
      percentage:
        totalServiceRevenue > 0
          ? (
              (parseFloat(item.dataValues.totalRevenue || 0) /
                totalServiceRevenue) *
              100
            ).toFixed(2)
          : 0,
    }));

    return {
      year,
      totalServiceRevenue,
      serviceStats,
      summary: {
        totalServiceTypes: serviceStats.length,
        highestRevenueService: serviceStats[0] || null,
        averageRevenuePerService:
          serviceStats.length > 0
            ? totalServiceRevenue / serviceStats.length
            : 0,
      },
    };
  } catch (error) {
    throw new apiError(
      500,
      `Error aggregating service revenue: ${error.message}`
    );
  }
};

/**
 * @description System overview statistics
 * @return {Object} - Overall system statistics
 * @throws {apiError} - If there is an error during aggregation
 */
const getSystemOverview = async () => {
  try {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1; // Invoice statistics
    const invoiceStats = await Invoice.findAll({
      attributes: [
        [Sequelize.fn("COUNT", Sequelize.col("invoiceId")), "totalInvoices"],
        [
          Sequelize.fn(
            "COUNT",
            Sequelize.literal("CASE WHEN status = 'Paid' THEN 1 END")
          ),
          "paidInvoices",
        ],
        [
          Sequelize.fn(
            "COUNT",
            Sequelize.literal("CASE WHEN status = 'Unpaid' THEN 1 END")
          ),
          "unpaidInvoices",
        ],
        [
          Sequelize.fn(
            "SUM",
            Sequelize.literal(
              "CASE WHEN status = 'Paid' THEN COALESCE(rentFee, 0) + COALESCE(serviceFee, 0) END"
            )
          ),
          "totalRevenue",
        ],
        [
          Sequelize.fn(
            "SUM",
            Sequelize.literal(
              "CASE WHEN status = 'Unpaid' THEN COALESCE(rentFee, 0) + COALESCE(serviceFee, 0) END"
            )
          ),
          "pendingRevenue",
        ],
      ],
      raw: true,
    }); // Current month statistics
    const currentMonthStats = await Invoice.findAll({
      attributes: [
        [Sequelize.fn("COUNT", Sequelize.col("invoiceId")), "monthlyInvoices"],
        [
          Sequelize.fn(
            "SUM",
            Sequelize.literal(
              "CASE WHEN status = 'Paid' THEN COALESCE(rentFee, 0) + COALESCE(serviceFee, 0) END"
            )
          ),
          "monthlyRevenue",
        ],
      ],
      where: {
        createdAt: {
          [Op.gte]: new Date(currentYear, currentMonth - 1, 1),
          [Op.lt]: new Date(currentYear, currentMonth, 1),
        },
      },
      raw: true,
    }); // Apartment statistics
    const apartmentStats = await Apartment.count();

    const stats = invoiceStats[0];
    const monthStats = currentMonthStats[0];

    return {
      invoiceOverview: {
        totalInvoices: parseInt(stats.totalInvoices) || 0,
        paidInvoices: parseInt(stats.paidInvoices) || 0,
        unpaidInvoices: parseInt(stats.unpaidInvoices) || 0,
        paymentRate:
          stats.totalInvoices > 0
            ? ((stats.paidInvoices / stats.totalInvoices) * 100).toFixed(2)
            : 0,
      },
      revenueOverview: {
        totalRevenue: parseFloat(stats.totalRevenue) || 0,
        pendingRevenue: parseFloat(stats.pendingRevenue) || 0,
        collectionRate:
          stats.totalRevenue > 0
            ? (
                ((stats.totalRevenue - stats.pendingRevenue) /
                  stats.totalRevenue) *
                100
              ).toFixed(2)
            : "0.00",
      },
      currentMonth: {
        month: currentMonth,
        year: currentYear,
        monthlyInvoices: parseInt(monthStats.monthlyInvoices) || 0,
        monthlyRevenue: parseFloat(monthStats.monthlyRevenue) || 0,
      },
      systemStats: {
        totalApartments: apartmentStats,
        occupancyRate:
          apartmentStats > 0
            ? ((stats.totalInvoices > 0 ? 1 : 0) * 100).toFixed(2)
            : 0,
      },
    };
  } catch (error) {
    throw new apiError(500, `Error aggregating overview: ${error.message}`);
  }
};

/**
 * @description Get apartment count by service type usage
 * @param {number} year - Year to aggregate (optional)
 * @return {Object} - Count of apartments using each service type
 * @throws {apiError} - If there is an error during aggregation
 */
const getApartmentCountByServiceType = async (year = null) => {
  try {
    let whereClause = {};
    
    // If year is specified, filter by year
    if (year) {
      whereClause = {
        createdAt: {
          [Op.gte]: new Date(`${year}-01-01`),
          [Op.lt]: new Date(`${year + 1}-01-01`)
        }
      };
    }

    // Get count of apartments using each service type
    const apartmentServiceData = await ServiceRegistration.findAll({
      attributes: [
        [Sequelize.fn('COUNT', Sequelize.fn('DISTINCT', Sequelize.col('apartmentId'))), 'apartmentCount'],
        [Sequelize.fn('COUNT', Sequelize.col('ServiceRegistration.serviceRegistrationId')), 'totalRegistrations']
      ],
      where: {
        status: 'Active',
        ...whereClause
      },
      include: [
        {
          model: ServiceType,
          as: 'serviceType',
          attributes: ['serviceTypeId', 'serviceName', 'unit', 'unitPrice']
        }
      ],
      group: ['serviceType.serviceTypeId'],
      order: [[Sequelize.fn('COUNT', Sequelize.fn('DISTINCT', Sequelize.col('apartmentId'))), 'DESC']],
      raw: false
    });

    // Get total apartment count for percentage calculation
    const totalApartments = await Apartment.count();

    const serviceUsageStats = apartmentServiceData.map(item => ({
      serviceTypeId: item.serviceType.serviceTypeId,
      serviceName: item.serviceType.serviceName,
      unit: item.serviceType.unit,
      unitPrice: parseFloat(item.serviceType.unitPrice),
      apartmentCount: parseInt(item.dataValues.apartmentCount) || 0,
      totalRegistrations: parseInt(item.dataValues.totalRegistrations) || 0,
      usagePercentage: totalApartments > 0 ? 
        ((parseInt(item.dataValues.apartmentCount) / totalApartments) * 100).toFixed(2) : 0
    }));

    return {
      year: year || 'All time',
      totalApartments,
      serviceUsageStats,
      summary: {
        totalServiceTypes: serviceUsageStats.length,
        mostUsedService: serviceUsageStats[0] || null,
        leastUsedService: serviceUsageStats[serviceUsageStats.length - 1] || null,
        averageUsagePercentage: serviceUsageStats.length > 0 ?
          (serviceUsageStats.reduce((sum, item) => sum + parseFloat(item.usagePercentage), 0) / serviceUsageStats.length).toFixed(2) : 0
      }
    };
  } catch (error) {
    throw new apiError(500, `Error aggregating apartment service usage: ${error.message}`);
  }
};

/**
 * @description Get detailed apartment list that registered for a specific service type
 * @param {number} serviceTypeId - Service type ID
 * @param {string} status - Registration status (Active, Inactive, All)
 * @return {Object} - List of apartments that registered for the specified service
 * @throws {apiError} - If there is an error during query
 */
const getApartmentsByServiceType = async (serviceTypeId, status = 'Active') => {
  try {
    if (!serviceTypeId) {
      throw new apiError(400, "Service type ID is required");
    }

    // Get service type info
    const serviceType = await ServiceType.findByPk(serviceTypeId);
    if (!serviceType) {
      throw new apiError(404, "Service type not found");
    }

    let whereClause = { serviceTypeId };
    if (status !== 'All') {
      whereClause.status = status;
    }

    const serviceRegistrations = await ServiceRegistration.findAll({
      where: whereClause,
      include: [
        {
          model: Apartment,
          as: 'apartment',
          attributes: ['apartmentId', 'floor'],
          include: [{
            model: ApartmentType,
            as: 'apartmentType',
            attributes: ['typeName', 'area', 'rentFee']
          }]
        }
      ],
      order: [['apartment', 'floor', 'ASC']]
    });

    const apartmentList = serviceRegistrations.map(reg => ({
      serviceRegistrationId: reg.serviceRegistrationId,
      apartmentId: reg.apartment.apartmentId,
      floor: reg.apartment.floor,
      apartmentType: reg.apartment.apartmentType.typeName,
      area: reg.apartment.apartmentType.area,
      rentFee: reg.apartment.apartmentType.rentFee,
      registrationStatus: reg.status,
      registeredAt: reg.createdAt
    }));

    return {
      serviceType: {
        serviceTypeId: serviceType.serviceTypeId,
        serviceName: serviceType.serviceName,
        unit: serviceType.unit,
        unitPrice: serviceType.unitPrice
      },
      filterStatus: status,
      totalCount: apartmentList.length,
      apartments: apartmentList,
      summary: {
        activeRegistrations: apartmentList.filter(apt => apt.registrationStatus === 'Active').length,
        inactiveRegistrations: apartmentList.filter(apt => apt.registrationStatus === 'Inactive').length
      }
    };
  } catch (error) {
    throw new apiError(500, `Error getting apartments by service type: ${error.message}`);
  }
};

/**
 * Get dashboard overview statistics
 * @param {Object} filter - Filter object with dateRange
 * @return {Object} - Dashboard statistics
 */
const getDashboardOverview = async (filter = {}) => {
  const { startDate, endDate } = filter;
  
  // Date range for filtering
  const dateFilter = {};
  if (startDate && endDate) {
    dateFilter.createdAt = {
      [Op.between]: [startDate, endDate]
    };
  } else if (startDate) {
    dateFilter.createdAt = {
      [Op.gte]: startDate
    };
  } else if (endDate) {
    dateFilter.createdAt = {
      [Op.lte]: endDate
    };
  }

  // Total revenue from paid invoices
  const totalRevenue = await Invoice.sum('rentFee', {
    where: {
      status: 'Paid',
      ...dateFilter
    }
  }) || 0;

  const totalServiceFee = await Invoice.sum('serviceFee', {
    where: {
      status: 'Paid',
      ...dateFilter
    }
  }) || 0;

  // Total apartments
  const totalApartments = await Apartment.count();

  // Total residents (users with 'resident' role)
  const totalResidents = await User.count({
    where: {
      role: 'resident'
    }
  });

  // Maintenance requests (apartments in maintenance status)
  const maintenanceRequests = await Apartment.count({
    where: {
      status: 'maintenance'
    }
  });

  return {
    totalRevenue: totalRevenue + totalServiceFee,
    totalApartments,
    totalResidents,
    maintenanceRequests
  };
};

/**
 * Get monthly revenue trend for dashboard
 * @param {Object} filter - Filter object with year
 * @return {Array} - Monthly revenue data
 */
const getDashboardMonthlyTrend = async (filter = {}) => {
  const { year = new Date().getFullYear() } = filter;
  
  const monthlyData = await Invoice.findAll({
    attributes: [
      [Sequelize.fn("MONTH", Sequelize.col("createdAt")), "month"],
      [
        Sequelize.fn(
          "SUM",
          Sequelize.literal("COALESCE(Invoice.rentFee, 0) + COALESCE(Invoice.serviceFee, 0)")
        ),
        "revenue",
      ],
    ],
    where: {
      status: 'Paid',
      createdAt: {
        [Op.gte]: new Date(`${year}-01-01`),
        [Op.lt]: new Date(`${year + 1}-01-01`),
      }
    },
    group: [Sequelize.fn("MONTH", Sequelize.col("createdAt"))],
    order: [[Sequelize.fn("MONTH", Sequelize.col("createdAt")), "ASC"]],
    raw: true,
  });

  // Fill missing months with 0
  const result = [];
  for (let month = 1; month <= 12; month++) {
    const monthData = monthlyData.find(item => parseInt(item.month) === month);
    result.push({
      month,
      monthName: getMonthName(month),
      revenue: monthData ? parseFloat(monthData.revenue) || 0 : 0
    });
  }

  return result;
};

/**
 * Get service distribution statistics for dashboard
 * @return {Array} - Service distribution data
 */
const getDashboardServiceDistribution = async () => {
  const serviceStats = await ServiceRegistration.findAll({
    attributes: [
      'serviceTypeId',
      [Sequelize.fn('COUNT', Sequelize.col('ServiceRegistration.serviceRegistrationId')), 'registrationCount']
    ],
    include: [{
      model: ServiceType,
      as: 'serviceType',
      attributes: ['serviceName']
    }],
    where: {
      status: 'Active'
    },
    group: ['serviceTypeId', 'serviceType.serviceTypeId'],
    raw: true
  });

  // Calculate total registrations for percentage
  const totalRegistrations = serviceStats.reduce((sum, item) => sum + parseInt(item.registrationCount), 0);

  return serviceStats.map(item => ({
    serviceName: item['serviceType.serviceName'],
    registrationCount: parseInt(item.registrationCount),
    percentage: totalRegistrations > 0 ? Math.round((parseInt(item.registrationCount) / totalRegistrations) * 100) : 0
  }));
};

/**
 * Get apartment status distribution for dashboard
 * @return {Object} - Apartment status statistics
 */
const getDashboardApartmentStatus = async () => {
  const statusStats = await Apartment.findAll({
    attributes: [
      'status',
      [Sequelize.fn('COUNT', Sequelize.col('apartmentId')), 'count']
    ],
    group: ['status'],
    raw: true
  });

  const result = {
    available: 0,
    rented: 0,
    maintenance: 0,
    total: 0
  };

  statusStats.forEach(item => {
    result[item.status] = parseInt(item.count);
    result.total += parseInt(item.count);
  });

  return result;
};

/**
 * Get recent service registrations for dashboard
 * @param {number} limit - Number of recent activities to return
 * @return {Array} - Recent service registrations
 */
const getDashboardRecentActivities = async (limit = 10) => {
  const activities = [];

  // Recent service registrations
  const recentRegistrations = await ServiceRegistration.findAll({
    include: [
      {
        model: ServiceType,
        as: 'serviceType',
        attributes: ['serviceName']
      },
      {
        model: Apartment,
        as: 'apartment',
        attributes: ['apartmentId']
      }
    ],
    order: [['createdAt', 'DESC']],
    limit: Math.floor(limit / 2),
    raw: true
  });

  recentRegistrations.forEach(reg => {
    activities.push({
      type: 'service_registration',
      message: `Apartment ${reg['apartment.apartmentId']} registered for ${reg['serviceType.serviceName']}`,
      timestamp: reg.createdAt
    });
  });

  // Recent payments
  const recentPayments = await Invoice.findAll({
    include: [{
      model: Apartment,
      as: 'apartment',
      attributes: ['apartmentId']
    }],
    where: {
      status: 'Paid'
    },
    order: [['updatedAt', 'DESC']],
    limit: Math.floor(limit / 2),
    raw: true
  });

  recentPayments.forEach(payment => {
    const totalAmount = (payment.rentFee || 0) + (payment.serviceFee || 0);
    activities.push({
      type: 'payment',
      message: `Apartment ${payment['apartment.apartmentId']} paid ${totalAmount.toLocaleString('vi-VN')} VND`,
      timestamp: payment.updatedAt
    });
  });

  // Sort by timestamp and limit
  return activities
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, limit);
};

/**
 * Get complete report data (formerly dashboard data)
 * @param {Object} filter - Filter object
 * @return {Object} - Complete report data
 */
const getReportData = async (filter = {}) => {
  const [
    overview,
    monthlyTrend,
    serviceDistribution,
    apartmentStatus
  ] = await Promise.all([
    getDashboardOverview(filter),
    getDashboardMonthlyTrend(filter),
    getDashboardServiceDistribution(),
    getDashboardApartmentStatus()
  ]);

  return {
    overview,
    monthlyTrend,
    serviceDistribution,
    apartmentStatus,
    generatedAt: new Date().toISOString()
  };
};

/**
 * Get dashboard main stats with comparisons
 * @param {Object} filter - Filter object with current month/year
 * @return {Object} - Dashboard main statistics
 */
const getDashboardMainStats = async (filter = {}) => {
  const currentDate = new Date();
  const currentYear = filter.year || currentDate.getFullYear();
  const currentMonth = filter.month || currentDate.getMonth() + 1;
  
  // Previous month for comparison
  let prevMonth = currentMonth - 1;
  let prevYear = currentYear;
  if (prevMonth < 1) {
    prevMonth = 12;
    prevYear = currentYear - 1;
  }

  // Current month date range
  const currentMonthStart = new Date(currentYear, currentMonth - 1, 1);
  const currentMonthEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59);
  
  // Previous month date range
  const prevMonthStart = new Date(prevYear, prevMonth - 1, 1);
  const prevMonthEnd = new Date(prevYear, prevMonth, 0, 23, 59, 59);

  // 1. Monthly Revenue (Doanh thu tháng)
  const currentMonthRevenue = await Invoice.sum('rentFee', {
    where: {
      status: 'Paid',
      createdAt: { [Op.between]: [currentMonthStart, currentMonthEnd] }
    }
  }) || 0;

  const currentMonthServiceFee = await Invoice.sum('serviceFee', {
    where: {
      status: 'Paid',
      createdAt: { [Op.between]: [currentMonthStart, currentMonthEnd] }
    }
  }) || 0;

  const prevMonthRevenue = await Invoice.sum('rentFee', {
    where: {
      status: 'Paid',
      createdAt: { [Op.between]: [prevMonthStart, prevMonthEnd] }
    }
  }) || 0;

  const prevMonthServiceFee = await Invoice.sum('serviceFee', {
    where: {
      status: 'Paid',
      createdAt: { [Op.between]: [prevMonthStart, prevMonthEnd] }
    }
  }) || 0;

  const totalCurrentRevenue = currentMonthRevenue + currentMonthServiceFee;
  const totalPrevRevenue = prevMonthRevenue + prevMonthServiceFee;
  const revenueChange = totalPrevRevenue > 0 ? 
    ((totalCurrentRevenue - totalPrevRevenue) / totalPrevRevenue * 100).toFixed(1) : 0;

  // 2. Residents (Cư dân)
  const totalResidents = await User.count({
    where: { role: 'resident' }
  });

  // 3. Occupied Apartments (Căn hộ có cư dân)
  const occupiedApartments = await Apartment.count({
    where: { status: 'rented' }
  });

  const availableApartments = await Apartment.count({
    where: { status: 'available' }
  });

  return {
    monthlyRevenue: {
      amount: totalCurrentRevenue,
      change: parseFloat(revenueChange),
      changeText: `${revenueChange > 0 ? '+' : ''}${revenueChange}% so với tháng trước`
    },
    residents: {
      total: totalResidents
    },
    apartments: {
      occupied: occupiedApartments,
      available: availableApartments,
      availableText: `Còn trống: ${availableApartments} căn`
    }
  };
};

/**
 * Get dashboard quick overview stats
 * @return {Object} - Quick overview statistics
 */
const getDashboardQuickOverview = async () => {
  const totalApartments = await Apartment.count();
  
  // Tỷ lệ lấp đầy (occupied apartments rate)
  const occupiedApartments = await Apartment.count({
    where: { status: 'rented' }
  });
  const occupancyRate = totalApartments > 0 ? 
    ((occupiedApartments / totalApartments) * 100).toFixed(1) : 0;

  // Tỷ lệ thu phí đúng hạn (paid invoices this month)
  const currentDate = new Date();
  const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const currentMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);
  
  const totalInvoicesThisMonth = await Invoice.count({
    where: {
      createdAt: { [Op.between]: [currentMonthStart, currentMonthEnd] }
    }
  });

  const paidInvoicesThisMonth = await Invoice.count({
    where: {
      status: 'Paid',
      createdAt: { [Op.between]: [currentMonthStart, currentMonthEnd] }
    }
  });

  const paymentRate = totalInvoicesThisMonth > 0 ? 
    ((paidInvoicesThisMonth / totalInvoicesThisMonth) * 100).toFixed(1) : 0;

  // Phản hồi chưa xử lý (assuming feedback with pending status)
  const pendingFeedback = 5; // Placeholder - adjust based on your feedback model

  // Yêu cầu bảo trì (apartments in maintenance status)
  const maintenanceRequests = await Apartment.count({
    where: { status: 'maintenance' }
  });

  return {
    occupancyRate: {
      percentage: parseFloat(occupancyRate),
      text: 'Tỷ lệ lấp đầy'
    },
    paymentRate: {
      percentage: parseFloat(paymentRate),
      text: 'Tỷ lệ thu phí đúng hạn'
    },
    pendingFeedback: {
      count: pendingFeedback,
      text: 'Phản hồi chưa xử lý'
    },
    maintenanceRequests: {
      count: maintenanceRequests,
      text: 'Yêu cầu bảo trì'
    }
  };
};

/**
 * Get dashboard recent activities
 * @param {number} limit - Number of activities to return
 * @return {Array} - Recent activities with Vietnamese messages
 */
const getDashboardRecentActivitiesVN = async (limit = 10) => {
  const activities = [];

  // Recent payments (Thanh toán hóa đơn)
  const recentPayments = await Invoice.findAll({
    include: [{
      model: Apartment,
      as: 'apartment',
      attributes: ['apartmentId']
    }],
    where: {
      status: 'Paid'
    },
    order: [['updatedAt', 'DESC']],
    limit: Math.ceil(limit * 0.4), // 40% of activities
    raw: true
  });

  recentPayments.forEach(payment => {
    const totalAmount = (payment.rentFee || 0) + (payment.serviceFee || 0);
    const paymentTime = new Date(payment.updatedAt);
    const timeString = paymentTime.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    activities.push({
      type: 'payment',
      message: `Thanh toán hóa đơn`,
      detail: `Căn hộ ${payment['apartment.apartmentId']} - ${Math.floor(totalAmount / 1000000)}${totalAmount % 1000000 > 0 ? '.' + Math.floor((totalAmount % 1000000) / 100000) : ''}tr - ${timeString}`,
      timestamp: payment.updatedAt
    });
  });

  // Maintenance requests (Yêu cầu bảo trì)
  const maintenanceApartments = await Apartment.findAll({
    where: { status: 'maintenance' },
    order: [['updatedAt', 'DESC']],
    limit: Math.ceil(limit * 0.3), // 30% of activities
    raw: true
  });

  maintenanceApartments.forEach(apt => {
    const maintenanceTime = new Date(apt.updatedAt);
    const timeString = maintenanceTime.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    activities.push({
      type: 'maintenance',
      message: `Yêu cầu bảo trì`,
      detail: `Căn hộ ${apt.apartmentId} - ${timeString}`,
      timestamp: apt.updatedAt
    });
  });

  // New residents (Cư dân mới chuyển vào)
  const newResidents = await Apartment.findAll({
    where: { 
      status: 'rented',
      updatedAt: {
        [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
      }
    },
    order: [['updatedAt', 'DESC']],
    limit: Math.ceil(limit * 0.3), // 30% of activities
    raw: true
  });

  newResidents.forEach(apt => {
    const moveInTime = new Date(apt.updatedAt);
    const timeString = moveInTime.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    activities.push({
      type: 'new_resident',
      message: `Cư dân mới chuyển vào`,
      detail: `Căn hộ ${apt.apartmentId} - ${timeString}`,
      timestamp: apt.updatedAt
    });
  });

  // Sort by timestamp and limit
  return activities
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, limit);
};

/**
 * Get complete dashboard data with Vietnamese interface
 * @param {Object} filter - Filter object
 * @return {Object} - Complete dashboard data
 */
const getDashboardVN = async (filter = {}) => {
  const [
    mainStats,
    quickOverview,
    recentActivities
  ] = await Promise.all([
    getDashboardMainStats(filter),
    getDashboardQuickOverview(),
    getDashboardRecentActivitiesVN(10)
  ]);

  return {
    mainStats,
    quickOverview,
    recentActivities,
    generatedAt: new Date().toISOString()
  };
};

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

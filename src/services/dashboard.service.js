const { Op, literal, fn, col } = require('sequelize');
const { 
  Invoice, 
  Apartment, 
  User, 
  ServiceRegistration, 
  ServiceType,
  Feedback 
} = require('../models');
const ApiError = require('../utils/apiError');

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

  try {
    // Total revenue
    const totalRevenue = await Invoice.sum('totalAmount', {
      where: {
        status: 'paid',
        ...dateFilter
      }
    }) || 0;

    // Total apartments
    const totalApartments = await Apartment.count();

    // Total residents
    const totalResidents = await User.count({
      where: {
        role: 'user'
      }
    });

    // Maintenance requests (using feedback as proxy for maintenance requests)
    const maintenanceRequests = await Feedback.count({
      where: {
        type: 'maintenance',
        ...dateFilter
      }
    });

    return {
      totalRevenue,
      totalApartments,
      totalResidents,
      maintenanceRequests
    };
  } catch (error) {
    throw new ApiError(500, 'Error getting dashboard overview: ' + error.message);
  }
};

/**
 * Get monthly revenue trend
 * @param {Object} filter - Filter object with year
 * @return {Array} - Monthly revenue data
 */
const getMonthlyRevenueTrend = async (filter = {}) => {
  const { year = new Date().getFullYear() } = filter;
  
  try {
    const monthlyRevenue = await Invoice.findAll({
      attributes: [
        [fn('MONTH', col('createdAt')), 'month'],
        [fn('SUM', col('totalAmount')), 'revenue']
      ],
      where: {
        status: 'paid',
        createdAt: {
          [Op.between]: [
            new Date(year, 0, 1), // January 1st
            new Date(year, 11, 31, 23, 59, 59) // December 31st
          ]
        }
      },
      group: [fn('MONTH', col('createdAt'))],
      order: [[fn('MONTH', col('createdAt')), 'ASC']],
      raw: true
    });

    // Fill missing months with 0
    const result = [];
    for (let month = 1; month <= 12; month++) {
      const monthData = monthlyRevenue.find(item => item.month === month);
      result.push({
        month,
        monthName: new Date(year, month - 1).toLocaleString('vi-VN', { month: 'short' }),
        revenue: monthData ? parseFloat(monthData.revenue) || 0 : 0
      });
    }

    return result;
  } catch (error) {
    throw new ApiError(500, 'Error getting monthly revenue trend: ' + error.message);
  }
};

/**
 * Get service distribution statistics
 * @return {Array} - Service distribution data
 */
const getServiceDistribution = async () => {
  try {
    const serviceStats = await ServiceRegistration.findAll({
      attributes: [
        'serviceTypeId',
        [fn('COUNT', col('ServiceRegistration.serviceRegistrationId')), 'registrationCount']
      ],
      include: [{
        model: ServiceType,
        attributes: ['serviceName']
      }],
      where: {
        status: 'Active'
      },
      group: ['serviceTypeId', 'ServiceType.serviceTypeId'],
      raw: true
    });

    // Calculate total registrations for percentage
    const totalRegistrations = serviceStats.reduce((sum, item) => sum + parseInt(item.registrationCount), 0);

    return serviceStats.map(item => ({
      serviceName: item['ServiceType.serviceName'],
      registrationCount: parseInt(item.registrationCount),
      percentage: totalRegistrations > 0 ? Math.round((parseInt(item.registrationCount) / totalRegistrations) * 100) : 0
    }));
  } catch (error) {
    throw new ApiError(500, 'Error getting service distribution: ' + error.message);
  }
};

/**
 * Get apartment status distribution
 * @return {Object} - Apartment status statistics
 */
const getApartmentStatusDistribution = async () => {
  try {
    const statusStats = await Apartment.findAll({
      attributes: [
        'status',
        [fn('COUNT', col('apartmentId')), 'count']
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
  } catch (error) {
    throw new ApiError(500, 'Error getting apartment status distribution: ' + error.message);
  }
};

/**
 * Get recent activities
 * @param {number} limit - Number of recent activities to return
 * @return {Array} - Recent activities
 */
const getRecentActivities = async (limit = 10) => {
  try {
    const activities = [];

    // Recent service registrations
    const recentRegistrations = await ServiceRegistration.findAll({
      include: [
        {
          model: ServiceType,
          attributes: ['serviceName']
        },
        {
          model: Apartment,
          attributes: ['apartmentId']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: limit / 2,
      raw: true
    });

    recentRegistrations.forEach(reg => {
      activities.push({
        type: 'service_registration',
        message: `Apartment ${reg['Apartment.apartmentId']} registered for ${reg['ServiceType.serviceName']}`,
        timestamp: reg.createdAt,
        icon: 'service'
      });
    });

    // Recent payments
    const recentPayments = await Invoice.findAll({
      include: [{
        model: Apartment,
        attributes: ['apartmentId']
      }],
      where: {
        status: 'paid'
      },
      order: [['updatedAt', 'DESC']],
      limit: limit / 2,
      raw: true
    });

    recentPayments.forEach(payment => {
      activities.push({
        type: 'payment',
        message: `Apartment ${payment['Apartment.apartmentId']} paid ${payment.totalAmount.toLocaleString('vi-VN')} VND`,
        timestamp: payment.updatedAt,
        icon: 'payment'
      });
    });

    // Sort by timestamp and limit
    return activities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  } catch (error) {
    throw new ApiError(500, 'Error getting recent activities: ' + error.message);
  }
};

/**
 * Get complete dashboard data
 * @param {Object} filter - Filter object
 * @return {Object} - Complete dashboard data
 */
const getDashboardData = async (filter = {}) => {
  try {
    const [
      overview,
      monthlyTrend,
      serviceDistribution,
      apartmentStatus,
      recentActivities
    ] = await Promise.all([
      getDashboardOverview(filter),
      getMonthlyRevenueTrend(filter),
      getServiceDistribution(),
      getApartmentStatusDistribution(),
      getRecentActivities(10)
    ]);

    return {
      overview,
      monthlyTrend,
      serviceDistribution,
      apartmentStatus,
      recentActivities,
      generatedAt: new Date().toISOString()
    };
  } catch (error) {
    throw new ApiError(500, 'Error getting dashboard data: ' + error.message);
  }
};

module.exports = {
  getDashboardOverview,
  getMonthlyRevenueTrend,
  getServiceDistribution,
  getApartmentStatusDistribution,
  getRecentActivities,
  getDashboardData
};

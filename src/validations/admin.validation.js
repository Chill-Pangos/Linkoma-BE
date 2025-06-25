const Joi = require("joi");
const { pick } = require("lodash");

const getMonthlyRevenue = {
  query: Joi.object().keys({
    year: Joi.number().integer().min(2000).max(new Date().getFullYear() + 1).optional()
  })
};

const getDetailedMonthlyRevenue = {
  params: Joi.object().keys({
    year: Joi.number().integer().min(2000).max(new Date().getFullYear() + 1).required(),
    month: Joi.number().integer().min(1).max(12).required()
  })
};

const getRevenueByServiceType = {
  query: Joi.object().keys({
    year: Joi.number().integer().min(2000).max(new Date().getFullYear() + 1).optional()
  })
};

const getApartmentCountByServiceType = {
  query: Joi.object().keys({
    year: Joi.number().integer().min(2000).max(new Date().getFullYear() + 1).optional()
  })
};

const getApartmentsByServiceType = {
  params: Joi.object().keys({
    serviceTypeId: Joi.number().integer().positive().required()
  }),
  query: Joi.object().keys({
    year: Joi.number().integer().min(2000).max(new Date().getFullYear() + 1).optional()
  })
};

const getDashboardOverview = {
  query: Joi.object().keys({
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional()
  })
};

const getDashboardMonthlyTrend = {
  query: Joi.object().keys({
    year: Joi.number().integer().min(2000).max(new Date().getFullYear() + 1).optional()
  })
};

const getDashboardRecentActivities = {
  query: Joi.object().keys({
    limit: Joi.number().integer().min(1).max(50).optional()
  })
};

const getReportData = {
  query: Joi.object().keys({
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional(),
    year: Joi.number().integer().min(2000).max(new Date().getFullYear() + 1).optional()
  })
};

const getDashboardMainStats = {
  query: Joi.object().keys({
    year: Joi.number().integer().min(2000).max(new Date().getFullYear() + 1).optional(),
    month: Joi.number().integer().min(1).max(12).optional()
  })
};

const getDashboardVN = {
  query: Joi.object().keys({
    year: Joi.number().integer().min(2000).max(new Date().getFullYear() + 1).optional(),
    month: Joi.number().integer().min(1).max(12).optional()
  })
};

module.exports = {
  getMonthlyRevenue,
  getDetailedMonthlyRevenue,
  getRevenueByServiceType,
  getApartmentCountByServiceType,
  getApartmentsByServiceType,
  getDashboardOverview,
  getDashboardMonthlyTrend,
  getDashboardRecentActivities,
  getReportData,
  getDashboardMainStats,
  getDashboardVN
};

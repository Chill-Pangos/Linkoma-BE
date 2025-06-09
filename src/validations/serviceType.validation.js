const Joi = require('joi');

const createServiceType = {
  body: Joi.object().keys({
    serviceName: Joi.string().max(100).required(),
    unit: Joi.string().max(20).required(),
    unitPrice: Joi.number().positive().precision(2).required(),
  }),
};

const getServiceTypes = {
  query: Joi.object().keys({
    serviceName: Joi.string(),
    unit: Joi.string(),
    minUnitPrice: Joi.number().positive(),
    maxUnitPrice: Joi.number().positive(),
    sortBy: Joi.string(),
    limit: Joi.number().integer().min(1).max(100).default(10),
    page: Joi.number().integer().min(1).default(1),
  }),
};

const getServiceType = {
  params: Joi.object().keys({
    serviceTypeId: Joi.number().integer().required(),
  }),
};

const updateServiceType = {
  params: Joi.object().keys({
    serviceTypeId: Joi.number().integer().required(),
  }),
  body: Joi.object()
    .keys({
      serviceName: Joi.string().max(100),
      unit: Joi.string().max(20),
      unitPrice: Joi.number().positive().precision(2),
    })
    .min(1),
};

const deleteServiceType = {
  params: Joi.object().keys({
    serviceTypeId: Joi.number().integer().required(),
  }),
};

module.exports = {
  createServiceType,
  getServiceTypes,
  getServiceType,
  updateServiceType,
  deleteServiceType,
};

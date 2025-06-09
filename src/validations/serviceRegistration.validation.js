const Joi = require('joi');

const createServiceRegistration = {
  body: Joi.object().keys({
    apartmentId: Joi.number().integer().positive().required(),
    serviceTypeId: Joi.number().integer().positive().required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().greater(Joi.ref('startDate')),
    status: Joi.string().valid('Active', 'Inactive', 'Cancelled').default('Active'),
    note: Joi.string().max(500).allow(''),
  }),
};

const getServiceRegistrations = {
  query: Joi.object().keys({
    apartmentId: Joi.number().integer().positive(),
    serviceTypeId: Joi.number().integer().positive(),
    status: Joi.string().valid('Active', 'Inactive', 'Cancelled'),
    startDate: Joi.date(),
    endDate: Joi.date(),
    sortBy: Joi.string(),
    limit: Joi.number().integer().min(1).max(100).default(10),
    page: Joi.number().integer().min(1).default(1),
  }),
};

const getServiceRegistration = {
  params: Joi.object().keys({
    serviceRegistrationId: Joi.number().integer().required(),
  }),
};

const updateServiceRegistration = {
  params: Joi.object().keys({
    serviceRegistrationId: Joi.number().integer().required(),
  }),
  body: Joi.object()
    .keys({
      apartmentId: Joi.number().integer().positive(),
      serviceTypeId: Joi.number().integer().positive(),
      startDate: Joi.date(),
      endDate: Joi.date(),
      status: Joi.string().valid('Active', 'Inactive', 'Cancelled'),
      note: Joi.string().max(500).allow(''),
    })
    .min(1),
};

const deleteServiceRegistration = {
  params: Joi.object().keys({
    serviceRegistrationId: Joi.number().integer().required(),
  }),
};

module.exports = {
  createServiceRegistration,
  getServiceRegistrations,
  getServiceRegistration,
  updateServiceRegistration,
  deleteServiceRegistration,
};

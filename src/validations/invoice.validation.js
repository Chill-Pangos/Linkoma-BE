const Joi = require('joi');

const createInvoice = {
  body: Joi.object().keys({
    apartmentId: Joi.number().integer().positive().required(),
    rentFee: Joi.number().positive().precision(2),
    dueDate: Joi.date().required(),
    status: Joi.string().valid('Unpaid', 'Paid').default('Unpaid'),
    serviceUsages: Joi.array().items(
      Joi.object().keys({
        serviceTypeId: Joi.number().integer().positive().required(),
        usage: Joi.number().positive().required(),
      })
    ).optional(),
  }),
};

const createInvoiceWithDetails = {
  body: Joi.object().keys({
    apartmentId: Joi.number().integer().positive().required(),
    dueDate: Joi.date().required(),
    serviceUsages: Joi.array().items(
      Joi.object().keys({
        serviceTypeId: Joi.number().integer().positive().required(),
        usage: Joi.number().positive().required(),
      })
    ).required().min(1),
  }),
};

const getInvoices = {
  query: Joi.object().keys({
    apartmentId: Joi.number().integer().positive(),
    status: Joi.string().valid('Unpaid', 'Paid'),
    minRentFee: Joi.number().positive(),
    maxRentFee: Joi.number().positive(),
    minServiceFee: Joi.number().positive(),
    maxServiceFee: Joi.number().positive(),
    dueDate: Joi.date(),
    sortBy: Joi.string(),
    limit: Joi.number().integer().min(1).max(100).default(10),
    page: Joi.number().integer().min(1).default(1),
  }),
};

const getInvoice = {
  params: Joi.object().keys({
    invoiceId: Joi.number().integer().required(),
  }),
};

const updateInvoice = {
  params: Joi.object().keys({
    invoiceId: Joi.number().integer().required(),
  }),
  body: Joi.object()
    .keys({
      apartmentId: Joi.number().integer().positive(),
      rentFee: Joi.number().positive().precision(2),
      serviceFee: Joi.number().positive().precision(2),
      dueDate: Joi.date(),
      status: Joi.string().valid('Unpaid', 'Paid'),
    })
    .min(1),
};

const deleteInvoice = {
  params: Joi.object().keys({
    invoiceId: Joi.number().integer().required(),
  }),
};

module.exports = {
  createInvoice,
  createInvoiceWithDetails,
  getInvoices,
  getInvoice,
  updateInvoice,
  deleteInvoice,
};

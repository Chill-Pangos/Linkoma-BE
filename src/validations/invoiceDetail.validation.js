const Joi = require('joi');

const createInvoiceDetail = {
  body: Joi.object().keys({
    invoiceId: Joi.number().integer().positive().required(),
    serviceTypeId: Joi.number().integer().positive().required(),
    usage: Joi.number().positive().required(),
    totalAmount: Joi.number().positive().precision(2).required(),
  }),
};

const getInvoiceDetails = {
  query: Joi.object().keys({
    invoiceId: Joi.number().integer().positive(),
    serviceTypeId: Joi.number().integer().positive(),
    minUsage: Joi.number().positive(),
    maxUsage: Joi.number().positive(),
    minTotalAmount: Joi.number().positive(),
    maxTotalAmount: Joi.number().positive(),
    sortBy: Joi.string(),
    limit: Joi.number().integer().min(1).max(100).default(10),
    page: Joi.number().integer().min(1).default(1),
  }),
};

const getInvoiceDetail = {
  params: Joi.object().keys({
    invoiceDetailId: Joi.number().integer().required(),
  }),
};

const updateInvoiceDetail = {
  params: Joi.object().keys({
    invoiceDetailId: Joi.number().integer().required(),
  }),
  body: Joi.object()
    .keys({
      invoiceId: Joi.number().integer().positive(),
      serviceTypeId: Joi.number().integer().positive(),
      usage: Joi.number().positive(),
      totalAmount: Joi.number().positive().precision(2),
    })
    .min(1),
};

const deleteInvoiceDetail = {
  params: Joi.object().keys({
    invoiceDetailId: Joi.number().integer().required(),
  }),
};

const getInvoiceDetailsByInvoice = {
  params: Joi.object().keys({
    invoiceId: Joi.number().integer().required(),
  }),
};

module.exports = {
  createInvoiceDetail,
  getInvoiceDetails,
  getInvoiceDetail,
  updateInvoiceDetail,
  deleteInvoiceDetail,
  getInvoiceDetailsByInvoice,
};

const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createFeedback = {
  body: Joi.object().keys({
    userId: Joi.number().integer().required(),
    category: Joi.string().valid('Maintenance', 'Service', 'Complaint').required(),
    description: Joi.string().required(),
    status: Joi.string().valid('Pending', 'In Progress', 'Resolved', 'Rejected').default('Pending'),
    response: Joi.string().optional(),
    responseDate: Joi.date().optional(),
  }),
};

const getFeedbacks = {
  query: Joi.object().keys({
    userId: Joi.number().integer(),
    category: Joi.string().valid('Maintenance', 'Service', 'Complaint'),
    status: Joi.string().valid('Pending', 'In Progress', 'Resolved', 'Rejected'),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getFeedback = {
  params: Joi.object().keys({
    feedbackId: Joi.number().integer().required(),
  }),
};

const updateFeedbackByAdmin = {
  params: Joi.object().keys({
    feedbackId: Joi.number().integer().required(),
  }),
  body: Joi.object()
    .keys({
      status: Joi.string().valid('Pending', 'In Progress', 'Resolved', 'Rejected'),
      response: Joi.string(),
    })
    .min(1),
};

const updateFeedbackByResident = {
  params: Joi.object().keys({
    feedbackId: Joi.number().integer().required(),
  }),
  body: Joi.object()
    .keys({
      category: Joi.string().valid('Maintenance', 'Service', 'Complaint'),
      description: Joi.string(),
    })
    .min(1),
};

const deleteFeedback = {
  params: Joi.object().keys({
    feedbackId: Joi.number().integer().required(),
  }),
};

const getUserFeedbacks = {
  params: Joi.object().keys({
    userId: Joi.number().integer().required(),
  }),
  query: Joi.object().keys({
    category: Joi.string().valid('Maintenance', 'Service', 'Complaint'),
    status: Joi.string().valid('Pending', 'In Progress', 'Resolved', 'Rejected', 'Cancelled'),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

module.exports = {
  createFeedback,
  getFeedbacks,
  getFeedback,
  updateFeedbackByAdmin,
  updateFeedbackByResident,
  deleteFeedback,
  getUserFeedbacks,
};

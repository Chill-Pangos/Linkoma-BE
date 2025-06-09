const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createAnnouncement = {
  body: Joi.object().keys({
    type: Joi.string().valid('General', 'Urgent', 'Maintenance', 'Event').required(),
    priority: Joi.string().valid('Low', 'Medium', 'High', 'Critical').required(),
    title: Joi.string().max(200).required(),
    content: Joi.string().required(),
    author: Joi.number().integer().required(),
  }),
};

const getAnnouncements = {
  query: Joi.object().keys({
    type: Joi.string().valid('General', 'Urgent', 'Maintenance', 'Event'),
    priority: Joi.string().valid('Low', 'Medium', 'High', 'Critical'),
    author: Joi.number().integer(),
    sortBy: Joi.string(),
    limit: Joi.number().integer().min(1).max(100).default(10),
    page: Joi.number().integer().min(1).default(1),
  }),
};

const getAnnouncement = {
  params: Joi.object().keys({
    announcementId: Joi.number().integer().required(),
  }),
};

const updateAnnouncement = {
  params: Joi.object().keys({
    announcementId: Joi.number().integer().required(),
  }),
  body: Joi.object()
    .keys({
      type: Joi.string().valid('General', 'Urgent', 'Maintenance', 'Event'),
      priority: Joi.string().valid('Low', 'Medium', 'High', 'Critical'),
      title: Joi.string().max(200),
      content: Joi.string(),
    })
    .min(1),
};

const deleteAnnouncement = {
  params: Joi.object().keys({
    announcementId: Joi.number().integer().required(),
  }),
};

const getUserAnnouncements = {
  params: Joi.object().keys({
    userId: Joi.number().integer().required(),
  }),
  query: Joi.object().keys({
    type: Joi.string().valid('General', 'Urgent', 'Maintenance', 'Event'),
    priority: Joi.string().valid('Low', 'Medium', 'High', 'Critical'),
    sortBy: Joi.string(),
    limit: Joi.number().integer().min(1).max(100).default(10),
    page: Joi.number().integer().min(1).default(1),
  }),
};

module.exports = {
  createAnnouncement,
  getAnnouncements,
  getAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getUserAnnouncements,
};

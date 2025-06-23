const Joi = require('joi');

const savePushToken = {
  body: Joi.object().keys({
    pushToken: Joi.string().required(),
    platform: Joi.string().valid('ios', 'android').optional()
  })
};

const sendNotification = {
  body: Joi.object().keys({
    userIds: Joi.array().items(Joi.number().integer().positive()).required(),
    title: Joi.string().required().max(100),
    body: Joi.string().required().max(500),
    data: Joi.object().optional()
  })
};

const removePushToken = {
  body: Joi.object().keys({
    pushToken: Joi.string().required()
  })
};

module.exports = {
  savePushToken,
  sendNotification,
  removePushToken
};

const Joi = require('joi');
const { roles } = require('../config/roles');

const getRolePermissions = {
  params: Joi.object().keys({
    role: Joi.string().valid(...roles).required(),
  }),
};

const checkRolePermission = {
  params: Joi.object().keys({
    role: Joi.string().valid(...roles).required(),
    permission: Joi.string().required(),
  }),
};

const assignRoleToUser = {
  params: Joi.object().keys({
    userId: Joi.number().integer().required(),
  }),
  body: Joi.object().keys({
    role: Joi.string().valid(...roles).required(),
  }),
};

module.exports = {
  getRolePermissions,
  checkRolePermission,
  assignRoleToUser,
};

const Joi = require('joi');
const { password, objectId } = require('./custom.validation');
const { roles } = require('../config/roles');

const createUser = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    name: Joi.string().optional(),
    dateOfBirth: Joi.date().optional(),
    phoneNumber: Joi.string().optional(),
    citizenId: Joi.string().optional(),
    address: Joi.string().optional(),
    licensePlate: Joi.string().optional(),
    apartmentId: Joi.number().integer().optional(),
    role: Joi.string().valid(...roles).optional(),
    status: Joi.string().valid('active', 'inactive', 'pending').optional(),
  }),
};

const getUsers = {
  query: Joi.object().keys({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
  }),
};

const getUser = {
  params: Joi.object().keys({
    userId: Joi.number().integer().required(),
  }),
};

const getUserByEmail = {
  params: Joi.object().keys({
    email: Joi.string().required().email(),
  }),
};

const updateUser = {
  params: Joi.object().keys({
    userId: Joi.number().integer().required(),
  }),
  body: Joi.object()
    .keys({
      email: Joi.string().email().optional(),
      password: Joi.string().custom(password).optional(),
      name: Joi.string().optional(),
      dateOfBirth: Joi.date().optional(),
      phoneNumber: Joi.string().optional(),
      citizenId: Joi.string().optional(),
      address: Joi.string().optional(),
      licensePlate: Joi.string().optional(),
      apartmentId: Joi.number().integer().optional(),
      role: Joi.string().valid(...roles).optional(),
      status: Joi.string().valid('active', 'inactive', 'pending').optional(),
    })
    .min(1),
};

const deleteUser = {
  params: Joi.object().keys({
    userId: Joi.number().integer().required(),
  }),
};

const createUserWithEmail = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
  }),
};

module.exports = {
  createUser,
  getUsers,
  getUser,
  getUserByEmail,
  updateUser,
  deleteUser,
  createUserWithEmail,
};

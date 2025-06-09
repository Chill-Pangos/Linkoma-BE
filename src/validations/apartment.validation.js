const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createApartment = {
  body: Joi.object().keys({
    apartmentTypeId: Joi.number().integer().required(),
    floor: Joi.number().integer().min(1).max(50),
    status: Joi.string().valid('available', 'rented', 'maintenance').default('available'),
  }),
};

const getApartments = {
  query: Joi.object().keys({
    apartmentTypeId: Joi.number().integer(),
    floor: Joi.number().integer().min(1).max(50),
    status: Joi.string().valid('available', 'rented', 'maintenance'),
    sortBy: Joi.string(),
    limit: Joi.number().integer().min(1).max(100).default(10),
    page: Joi.number().integer().min(1).default(1),
  }),
};

const getApartment = {
  params: Joi.object().keys({
    apartmentId: Joi.number().integer().required(),
  }),
};

const updateApartment = {
  params: Joi.object().keys({
    apartmentId: Joi.number().integer().required(),
  }),
  body: Joi.object()
    .keys({
      apartmentTypeId: Joi.number().integer(),
      floor: Joi.number().integer().min(1).max(50),
      status: Joi.string().valid('available', 'rented', 'maintenance'),
    })
    .min(1),
};

const deleteApartment = {
  params: Joi.object().keys({
    apartmentId: Joi.number().integer().required(),
  }),
};

const createApartmentType = {
  body: Joi.object().keys({
    typeName: Joi.string().max(100).required(),
    area: Joi.number().positive().required(),
    numBedrooms: Joi.number().integer().min(0).max(10).required(),
    numBathrooms: Joi.number().integer().min(0).max(10).required(),
    rentFee: Joi.number().positive().required(),
    description: Joi.string().allow(''),
  }),
};

const getApartmentTypes = {
  query: Joi.object().keys({
    typeName: Joi.string(),
    minArea: Joi.number().positive(),
    maxArea: Joi.number().positive(),
    numBedrooms: Joi.number().integer().min(0).max(10),
    numBathrooms: Joi.number().integer().min(0).max(10),
    minRentFee: Joi.number().positive(),
    maxRentFee: Joi.number().positive(),
    sortBy: Joi.string(),
    limit: Joi.number().integer().min(1).max(100).default(10),
    page: Joi.number().integer().min(1).default(1),
  }),
};

const getApartmentType = {
  params: Joi.object().keys({
    apartmentTypeId: Joi.number().integer().required(),
  }),
};

const updateApartmentType = {
  params: Joi.object().keys({
    apartmentTypeId: Joi.number().integer().required(),
  }),
  body: Joi.object()
    .keys({
      typeName: Joi.string().max(100),
      area: Joi.number().positive(),
      numBedrooms: Joi.number().integer().min(0).max(10),
      numBathrooms: Joi.number().integer().min(0).max(10),
      rentFee: Joi.number().positive(),
      description: Joi.string().allow(''),
    })
    .min(1),
};

const deleteApartmentType = {
  params: Joi.object().keys({
    apartmentTypeId: Joi.number().integer().required(),
  }),
};

module.exports = {
  createApartment,
  getApartments,
  getApartment,
  updateApartment,
  deleteApartment,
  createApartmentType,
  getApartmentTypes,
  getApartmentType,
  updateApartmentType,
  deleteApartmentType,
};

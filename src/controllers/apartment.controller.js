const httpStatus = require('http-status');
const pick = require('../utils/pick');
const apiError = require('../utils/apiError');
const catchAsync = require('../utils/catchAsync');
const apartmentService = require('../services/apartment.service');

/**
 * @description Create apartment
 */
const createApartment = catchAsync(async (req, res) => {
  const apartment = await apartmentService.createApartment(req.body);
  res.status(201).send(apartment);
});

/**
 * @description Get apartments with filtering and pagination
 */
const getApartments = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['apartmentTypeId', 'floor', 'status']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  
  // Set default values
  options.limit = parseInt(options.limit) || 10;
  options.page = parseInt(options.page) || 1;
  
  const result = await apartmentService.getApartments(filter, options);
  res.send(result);
});

/**
 * @description Get apartment by ID
 */
const getApartment = catchAsync(async (req, res) => {
  const apartment = await apartmentService.getApartmentById(req.params.apartmentId);
  res.send(apartment);
});

/**
 * @description Update apartment
 */
const updateApartment = catchAsync(async (req, res) => {
  const apartment = await apartmentService.updateApartmentById(req.params.apartmentId, req.body);
  res.send(apartment);
});

/**
 * @description Delete apartment
 */
const deleteApartment = catchAsync(async (req, res) => {
  await apartmentService.deleteApartmentById(req.params.apartmentId);
  res.status(204).send();
});

module.exports = {
  createApartment,
  getApartments,
  getApartment,
  updateApartment,
  deleteApartment,
};

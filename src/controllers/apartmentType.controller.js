const httpStatus = require('http-status');
const pick = require('../utils/pick');
const apiError = require('../utils/apiError');
const catchAsync = require('../utils/catchAsync');
const apartmentService = require('../services/apartment.service');

/**
 * @description Create apartment type
 */
const createApartmentType = catchAsync(async (req, res) => {
  const apartmentType = await apartmentService.createApartmentType(req.body);
  res.status(201).send(apartmentType);
});

/**
 * @description Get apartment types with filtering and pagination
 */
const getApartmentTypes = catchAsync(async (req, res) => {
  const filter = pick(req.query, [
    'typeName', 
    'minArea', 
    'maxArea', 
    'numBedrooms', 
    'numBathrooms', 
    'minRentFee', 
    'maxRentFee'
  ]);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  
  // Set default values
  options.limit = parseInt(options.limit) || 10;
  options.page = parseInt(options.page) || 1;
  
  const result = await apartmentService.getApartmentTypes(filter, options);
  res.send(result);
});

/**
 * @description Get apartment type by ID
 */
const getApartmentType = catchAsync(async (req, res) => {
  const apartmentType = await apartmentService.getApartmentTypeById(req.params.apartmentTypeId);
  res.send(apartmentType);
});

/**
 * @description Update apartment type
 */
const updateApartmentType = catchAsync(async (req, res) => {
  const apartmentType = await apartmentService.updateApartmentTypeById(req.params.apartmentTypeId, req.body);
  res.send(apartmentType);
});

/**
 * @description Delete apartment type
 */
const deleteApartmentType = catchAsync(async (req, res) => {
  await apartmentService.deleteApartmentTypeById(req.params.apartmentTypeId);
  res.status(204).send();
});

module.exports = {
  createApartmentType,
  getApartmentTypes,
  getApartmentType,
  updateApartmentType,
  deleteApartmentType,
};

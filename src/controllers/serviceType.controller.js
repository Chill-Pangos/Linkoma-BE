const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/apiError');
const catchAsync = require('../utils/catchAsync');
const { serviceTypeService } = require('../services');

const createServiceType = catchAsync(async (req, res) => {
  const serviceType = await serviceTypeService.createServiceType(req.body);
  res.status(201).send(serviceType);
});

const getServiceTypes = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['serviceName', 'unit', 'minUnitPrice', 'maxUnitPrice']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await serviceTypeService.queryServiceTypes(filter, options);
  res.send(result);
});

const getServiceType = catchAsync(async (req, res) => {
  const serviceType = await serviceTypeService.getServiceTypeById(req.params.serviceTypeId);
  if (!serviceType) {
    throw new ApiError(404, 'Service type not found');
  }
  res.send(serviceType);
});

const updateServiceType = catchAsync(async (req, res) => {
  const serviceType = await serviceTypeService.updateServiceType(req.params.serviceTypeId, req.body);
  res.send(serviceType);
});

const deleteServiceType = catchAsync(async (req, res) => {
  await serviceTypeService.deleteServiceType(req.params.serviceTypeId);
  res.status(204).send();
});

module.exports = {
  createServiceType,
  getServiceTypes,
  getServiceType,
  updateServiceType,
  deleteServiceType,
};

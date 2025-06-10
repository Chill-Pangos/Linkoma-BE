const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/apiError');
const catchAsync = require('../utils/catchAsync');
const { serviceRegistrationService } = require('../services');

const createServiceRegistration = catchAsync(async (req, res) => {
  const serviceRegistration = await serviceRegistrationService.createServiceRegistration(req.body);
  res.status(201).send(serviceRegistration);
});

const getServiceRegistrations = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['apartmentId', 'serviceTypeId', 'status', 'startDate', 'endDate']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await serviceRegistrationService.queryServiceRegistrations(filter, options);
  res.send(result);
});

const getServiceRegistration = catchAsync(async (req, res) => {
  const serviceRegistration = await serviceRegistrationService.getServiceRegistrationById(req.params.serviceRegistrationId);
  if (!serviceRegistration) {
    throw new ApiError(404, 'Service registration not found');
  }
  res.send(serviceRegistration);
});

const updateServiceRegistration = catchAsync(async (req, res) => {
  const serviceRegistration = await serviceRegistrationService.updateServiceRegistration(req.params.serviceRegistrationId, req.body);
  res.send(serviceRegistration);
});

const deleteServiceRegistration = catchAsync(async (req, res) => {
  await serviceRegistrationService.deleteServiceRegistration(req.params.serviceRegistrationId);
  res.status(204).send();
});

module.exports = {
  createServiceRegistration,
  getServiceRegistrations,
  getServiceRegistration,
  updateServiceRegistration,
  deleteServiceRegistration,
};

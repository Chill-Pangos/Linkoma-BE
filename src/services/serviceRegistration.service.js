const ServiceRegistration = require("../models/serviceRegistration.model");
const serviceRegistrationFieldConfig = require("../config/fieldConfig/serviceRegistration.fieldconfig");
const apiError = require("../utils/apiError");
const { Op } = require("sequelize");
const filterValidFields = require("../utils/filterValidFields");

/**
 * Create a new service registration in the database
 * @param {Object} serviceRegistrationData - The service registration data to be inserted
 * @return {Object} - The result of the insertion
 * @throws {apiError} - If there is an error during the insertion
 */
const createServiceRegistration = async (serviceRegistrationData) => {
  const fields = filterValidFields.filterValidFieldsFromObject(
    serviceRegistrationData,
    serviceRegistrationFieldConfig.insertableFields
  );

  const entries = Object.entries(fields);

  if (entries.length === 0) {
    throw new apiError(400, "No valid fields provided");
  }

  const result = await ServiceRegistration.create(fields);

  if (!result) {
    throw new apiError(500, "Service registration creation failed");
  }

  return {
    message: "Service registration created successfully",
    serviceRegistrationId: result.serviceRegistrationId,
  };
};

/**
 * Get a service registration by Id
 * @param {number} serviceRegistrationId - The Id of the service registration to be retrieved
 * @return {Object} - The service registration data
 * @throws {apiError} - If there is an error during the retrieval
 */
const getServiceRegistrationById = async (serviceRegistrationId) => {
  if (!serviceRegistrationId) {
    throw new apiError(400, "Service registration Id is required");
  }

  const serviceRegistration = await ServiceRegistration.findByPk(serviceRegistrationId);

  if (!serviceRegistration) {
    throw new apiError(404, "Service registration not found");
  }

  return serviceRegistration;
};

/**
 * Get all service registrations of an apartment
 * @param {number} apartmentId - The Id of the apartment whose service registrations are to be retrieved
 * @return {Array} - An array of service registrations
 * @throws {apiError} - If there is an error during the retrieval
 */
const getServiceRegistrationByApartmentId = async (apartmentId) => {
  if (!apartmentId) {
    throw new apiError(400, "Apartment Id is required");
  }

  const serviceRegistrations = await ServiceRegistration.findAll({
    where: { apartmentId: apartmentId }
  });

  if (serviceRegistrations.length === 0) {
    throw new apiError(404, "Service registration not found");
  }

  return serviceRegistrations;
};

/**
 * Update a service registration in the database
 * @param {number} serviceRegistrationId - The Id of the service registration to be updated
 * @param {Object} serviceRegistrationData - The updated service registration data
 * @return {Object} - The result of the update
 * @throws {apiError} - If there is an error during the update
 */
const updateServiceRegistration = async (
  serviceRegistrationId,
  serviceRegistrationData
) => {
  if (!serviceRegistrationId) {
    throw new apiError(400, "Service registration Id is required");
  }

  const fields = filterValidFields.filterValidFieldsFromObject(
    serviceRegistrationData,
    serviceRegistrationFieldConfig.updatableFields
  );

  const entries = Object.entries(fields);

  if (entries.length === 0) {
    throw new apiError(400, "No valid fields provided");
  }

  const [affectedRows] = await ServiceRegistration.update(fields, {
    where: { serviceRegistrationId: serviceRegistrationId }
  });

  if (affectedRows === 0) {
    throw new apiError(404, "Service registration not found");
  }

  return {
    message: "Service registration updated successfully",
    serviceRegistrationId: serviceRegistrationId,
  };
};

/**
 * Delete a service registration by Id
 * @param {number} serviceRegistrationId - The Id of the service registration to be deleted
 * @return {Object} - The result of the deletion
 * @throws {apiError} - If there is an error during the deletion
 */
const deleteServiceRegistration = async (serviceRegistrationId) => {
  if (!serviceRegistrationId) {
    throw new apiError(400, "Service registration Id is required");
  }

  const affectedRows = await ServiceRegistration.destroy({
    where: { serviceRegistrationId: serviceRegistrationId }
  });

  if (affectedRows === 0) {
    throw new apiError(404, "Service registration not found");
  }

  return {
    message: "Service registration deleted successfully",
  };
};

/**
 * Query service registrations with filtering and pagination
 * @param {Object} filter - Filter object with apartmentId, serviceTypeId, status, startDate, endDate
 * @param {Object} options - Options object with sortBy, limit, page
 * @return {Object} - Paginated service registrations with total count
 * @throws {apiError} - If there is an error during the query
 */
const queryServiceRegistrations = async (filter, options) => {
  const { apartmentId, serviceTypeId, status, startDate, endDate } = filter;
  const { sortBy, limit = 10, page = 1 } = options;

  // Build where clause
  const where = {};
  if (apartmentId) where.apartmentId = apartmentId;
  if (serviceTypeId) where.serviceTypeId = serviceTypeId;
  if (status) where.status = status;
  if (startDate) where.startDate = { [Op.gte]: startDate };
  if (endDate) where.endDate = { [Op.lte]: endDate };

  // Build order clause
  let order = [];
  if (sortBy) {
    const [field, direction] = sortBy.split(':');
    order = [[field, direction?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']];
  } else {
    order = [['createdAt', 'DESC']];
  }

  const offset = (page - 1) * limit;

  const { count, rows } = await ServiceRegistration.findAndCountAll({
    where,
    order,
    limit: parseInt(limit),
    offset,
  });

  const totalPages = Math.ceil(count / limit);

  return {
    results: rows,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages,
    totalResults: count,
  };
};

module.exports = {
  createServiceRegistration,
  getServiceRegistrationById,
  getServiceRegistrationByApartmentId,
  queryServiceRegistrations,
  updateServiceRegistration,
  deleteServiceRegistration,
};

const ServiceRegistration = require("../models/serviceRegistration.model");
const serviceRegistrationFieldConfig = require("../config/fieldConfig/serviceRegistration.fieldconfig");
const ApiError = require("../utils/apiError");
const { status } = require("http-status");
const filterValidFields = require("../utils/filterValidFields");

/**
 * @description Create a new service registration in the database
 *
 * @param {Object} serviceRegistrationData - The service registration data to be inserted
 * @return {Object} - The result of the insertion
 * @throws {ApiError} - If there is an error during the insertion
 * */

const createServiceRegistration = async (serviceRegistrationData) => {
  try {
    const fields = filterValidFields.filterValidFieldsFromObject(
      serviceRegistrationData,
      serviceRegistrationFieldConfig.insertableFields
    );

    const entries = Object.entries(fields);

    if (entries.length === 0) {
      throw new ApiError(status.BAD_REQUEST, "No valid fields provided");
    }

    const result = await ServiceRegistration.create(fields);

    if (!result) {
      throw new ApiError(
        status.INTERNAL_SERVER_ERROR,
        "Service registration creation failed"
      );
    }

    return {
      message: "Service registration created successfully",
      serviceRegistrationId: result.serviceRegistrationID,
    };
  } catch (error) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, error.message);
  }
};

/**
 * @description Get a service registration by ID
 * @param {number} serviceRegistrationId - The ID of the service registration to be retrieved
 * @return {Object} - The service registration data
 * @throws {ApiError} - If there is an error during the retrieval
 * */

const getServiceRegistrationById = async (serviceRegistrationId) => {
  try {
    if (!serviceRegistrationId) {
      throw new ApiError(
        status.BAD_REQUEST,
        "Service registration ID is required"
      );
    }

    const serviceRegistration = await ServiceRegistration.findByPk(serviceRegistrationId);

    if (!serviceRegistration) {
      throw new ApiError(status.NOT_FOUND, "Service registration not found");
    }

    return serviceRegistration;
  } catch (error) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, error.message);
  }
};

/**
 * @description Get all service registrations of an apartment
 * @param {number} apartmentId - The ID of the apartment whose service registrations are to be retrieved
 * @return {Array} - An array of service registrations
 * @throws {ApiError} - If there is an error during the retrieval
 * */

const getServiceRegistrationByApartmentId = async (apartmentId) => {
  try {
    if (!apartmentId) {
      throw new ApiError(status.BAD_REQUEST, "Apartment ID is required");
    }

    const serviceRegistrations = await ServiceRegistration.findAll({
      where: { apartmentID: apartmentId }
    });

    if (serviceRegistrations.length === 0) {
      throw new ApiError(status.NOT_FOUND, "Service registration not found");
    }

    return serviceRegistrations;
  } catch (error) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, error.message);
  }
};

/**
 * @description Update a service registration in the database
 * @param {number} serviceRegistrationId - The ID of the service registration to be updated
 * @param {Object} serviceRegistrationData - The updated service registration data
 * @return {Object} - The result of the update
 * @throws {ApiError} - If there is an error during the update
 * */

const updateServiceRegistration = async (
  serviceRegistrationId,
  serviceRegistrationData
) => {
  try {
    if (!serviceRegistrationId) {
      throw new ApiError(
        status.BAD_REQUEST,
        "Service registration ID is required"
      );
    }

    const fields = filterValidFields.filterValidFieldsFromObject(
      serviceRegistrationData,
      serviceRegistrationFieldConfig.updatableFields
    );

    const entries = Object.entries(fields);

    if (entries.length === 0) {
      throw new ApiError(status.BAD_REQUEST, "No valid fields provided");
    }

    const [affectedRows] = await ServiceRegistration.update(fields, {
      where: { serviceRegistrationID: serviceRegistrationId }
    });

    if (affectedRows === 0) {
      throw new ApiError(
        status.NOT_FOUND,
        "Service registration not found"
      );
    }

    return {
      message: "Service registration updated successfully",
      serviceRegistrationId: serviceRegistrationId,
    };
  } catch (error) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, error.message);
  }
};

/**
 * @description Delete a service registration by ID
 * @param {number} serviceRegistrationId - The ID of the service registration to be deleted
 * @return {Object} - The result of the deletion
 * @throws {ApiError} - If there is an error during the deletion
 * */

const deleteServiceRegistration = async (serviceRegistrationId) => {
  try {
    if (!serviceRegistrationId) {
      throw new ApiError(
        status.BAD_REQUEST,
        "Service registration ID is required"
      );
    }

    const affectedRows = await ServiceRegistration.destroy({
      where: { serviceRegistrationID: serviceRegistrationId }
    });

    if (affectedRows === 0) {
      throw new ApiError(status.NOT_FOUND, "Service registration not found");
    }

    return {
      message: "Service registration deleted successfully",
    };
  } catch (error) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, error.message);
  }
};

module.exports = {
  createServiceRegistration,
  getServiceRegistrationById,
  getServiceRegistrationByApartmentId,
  updateServiceRegistration,
  deleteServiceRegistration,
};

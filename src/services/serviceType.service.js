const ServiceType = require("../models/serviceType.model");
const serviceTypeFieldConfig = require("../config/fieldConfig/serviceType.fieldconfig");
const ApiError = require("../utils/apiError");
const { status } = require("http-status");
const filterValidFields = require("../utils/filterValidFields");

/**
 * @description Create a new service type in the database
 *
 * @param {Object} serviceTypeData - The service type data to be inserted
 * @return {Object} - The result of the insertion
 * @throws {ApiError} - If there is an error during the insertion
 * */

const createServiceType = async (serviceTypeData) => {
  try {
    const fields = filterValidFields.filterValidFieldsFromObject(
      serviceTypeData,
      serviceTypeFieldConfig.insertableFields
    );

    const entries = Object.entries(fields);

    if (entries.length === 0) {
      throw new ApiError(status.BAD_REQUEST, "No valid fields provided");
    }

    const result = await ServiceType.create(fields);

    if (!result) {
      throw new ApiError(
        status.INTERNAL_SERVER_ERROR,
        "Service type creation failed"
      );
    }

    return {
      message: "Service type created successfully",
      serviceTypeId: result.serviceTypeID,
    };
  } catch (error) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, error.message);
  }
};

/**
 * @description Get a service type by ID
 * @param {number} serviceTypeId - The ID of the service type to be retrieved
 * @return {Object} - The service type data
 * @throws {ApiError} - If there is an error during the retrieval
 * */

const getServiceTypeById = async (serviceTypeId) => {
  try {
    if (!serviceTypeId) {
      throw new ApiError(status.BAD_REQUEST, "Service type ID is required");
    }

    const serviceType = await ServiceType.findByPk(serviceTypeId);

    if (!serviceType) {
      throw new ApiError(status.NOT_FOUND, "Service type not found");
    }

    return serviceType;
  } catch (error) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, error.message);
  }
};

/**
 * @description Get all service types from the database
 *
 * @param {number} limit - The maximum number of service types to retrieve
 * @param {number} offset - The number of service types to skip before starting to collect the result set
 * @return {Array} - An array of service types
 * @throws {ApiError} - If there is an error during the retrieval
 * */

const getServiceTypes = async (limit, offset) => {
  try {
    const serviceTypes = await ServiceType.findAll({
      limit: limit,
      offset: offset,
      order: [['serviceTypeID', 'ASC']]
    });

    if (serviceTypes.length === 0) {
      throw new ApiError(status.NOT_FOUND, "No service types found");
    }

    return serviceTypes;
  } catch (error) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, error.message);
  }
};

/**
 * @description Delete a service type by ID
 * @param {number} serviceTypeId - The ID of the service type to be deleted
 * @return {Object} - The result of the deletion
 * @throws {ApiError} - If there is an error during the deletion
 * */

const updateServiceType = async (serviceTypeId, serviceTypeData) => {
  try {
    if (!serviceTypeId) {
      throw new ApiError(status.BAD_REQUEST, "Service type ID is required");
    }

    const fields = filterValidFields.filterValidFieldsFromObject(
      serviceTypeData,
      serviceTypeFieldConfig.updatableFields
    );

    const entries = Object.entries(fields);

    if (entries.length === 0) {
      throw new ApiError(status.BAD_REQUEST, "No valid fields provided");
    }

    const [affectedRows] = await ServiceType.update(fields, {
      where: { serviceTypeID: serviceTypeId }
    });

    if (affectedRows === 0) {
      throw new ApiError(status.NOT_FOUND, "Service type not found");
    }

    return {
      message: "Service type updated successfully",
      serviceTypeId,
    };
  } catch (error) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, error.message);
  }
};

/**
 * @description Delete a service type by ID
 * @param {number} serviceTypeId - The ID of the service type to be deleted
 * @return {Object} - The result of the deletion
 * @throws {ApiError} - If there is an error during the deletion
 * */

const deleteServiceType = async (serviceTypeId) => {
  try {
    if (!serviceTypeId) {
      throw new ApiError(status.BAD_REQUEST, "Service type ID is required");
    }

    const affectedRows = await ServiceType.destroy({
      where: { serviceTypeID: serviceTypeId }
    });

    if (affectedRows === 0) {
      throw new ApiError(status.NOT_FOUND, "Service type not found");
    }

    return {
      message: "Service type deleted successfully",
      serviceTypeId,
    };
  } catch (error) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, error.message);
  }
};

module.exports = {
  createServiceType,
  getServiceTypeById,
  getServiceTypes,
  updateServiceType,
  deleteServiceType,
};

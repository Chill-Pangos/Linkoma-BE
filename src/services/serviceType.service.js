const ServiceType = require("../models/serviceType.model");
const serviceTypeFieldConfig = require("../config/fieldConfig/serviceType.fieldconfig");
const apiError = require("../utils/apiError");
const httpStatus= require("http-status");
const { Op } = require("sequelize");
const filterValidFields = require("../utils/filterValidFields");

/**
 * @description Create a new service type in the database
 *
 * @param {Object} serviceTypeData - The service type data to be inserted
 * @return {Object} - The result of the insertion
 * @throws {apiError} - If there is an error during the insertion
 * */

const createServiceType = async (serviceTypeData) => {
  try {
    const fields = filterValidFields.filterValidFieldsFromObject(
      serviceTypeData,
      serviceTypeFieldConfig.insertableFields
    );

    const entries = Object.entries(fields);

    if (entries.length === 0) {
      throw new apiError(400, "No valid fields provided");
    }

    const result = await ServiceType.create(fields);

    if (!result) {
      throw new apiError(
        500,
        "Service type creation failed"
      );
    }

    return {
      message: "Service type created successfully",
      serviceTypeId: result.serviceTypeId,
    };
  } catch (error) {
    throw new apiError(500, error.message);
  }
};

/**
 * @description Get a service type by Id
 * @param {number} serviceTypeId - The Id of the service type to be retrieved
 * @return {Object} - The service type data
 * @throws {apiError} - If there is an error during the retrieval
 * */

const getServiceTypeById = async (serviceTypeId) => {
  try {
    if (!serviceTypeId) {
      throw new apiError(400, "Service type Id is required");
    }

    const serviceType = await ServiceType.findByPk(serviceTypeId);

    if (!serviceType) {
      throw new apiError(404, "Service type not found");
    }

    return serviceType;
  } catch (error) {
    throw new apiError(500, error.message);
  }
};

/**
 * @description Get all service types from the database
 *
 * @param {number} limit - The maximum number of service types to retrieve
 * @param {number} offset - The number of service types to skip before starting to collect the result set
 * @return {Array} - An array of service types
 * @throws {apiError} - If there is an error during the retrieval
 * */

const getServiceTypes = async (limit, offset) => {
  try {
    const serviceTypes = await ServiceType.findAll({
      limit: limit,
      offset: offset,
      order: [['serviceTypeId', 'ASC']]
    });

    if (serviceTypes.length === 0) {
      throw new apiError(404, "No service types found");
    }

    return serviceTypes;
  } catch (error) {
    throw new apiError(500, error.message);
  }
};

/**
 * @description Delete a service type by Id
 * @param {number} serviceTypeId - The Id of the service type to be deleted
 * @return {Object} - The result of the deletion
 * @throws {apiError} - If there is an error during the deletion
 * */

const updateServiceType = async (serviceTypeId, serviceTypeData) => {
  try {
    if (!serviceTypeId) {
      throw new apiError(400, "Service type Id is required");
    }

    const fields = filterValidFields.filterValidFieldsFromObject(
      serviceTypeData,
      serviceTypeFieldConfig.updatableFields
    );

    const entries = Object.entries(fields);

    if (entries.length === 0) {
      throw new apiError(400, "No valid fields provided");
    }

    const [affectedRows] = await ServiceType.update(fields, {
      where: { serviceTypeId: serviceTypeId }
    });

    if (affectedRows === 0) {
      throw new apiError(404, "Service type not found");
    }

    return {
      message: "Service type updated successfully",
      serviceTypeId,
    };
  } catch (error) {
    throw new apiError(500, error.message);
  }
};

/**
 * @description Delete a service type by Id
 * @param {number} serviceTypeId - The Id of the service type to be deleted
 * @return {Object} - The result of the deletion
 * @throws {apiError} - If there is an error during the deletion
 * */

const deleteServiceType = async (serviceTypeId) => {
  try {
    if (!serviceTypeId) {
      throw new apiError(400, "Service type Id is required");
    }

    const affectedRows = await ServiceType.destroy({
      where: { serviceTypeId: serviceTypeId }
    });

    if (affectedRows === 0) {
      throw new apiError(404, "Service type not found");
    }

    return {
      message: "Service type deleted successfully",
      serviceTypeId,
    };
  } catch (error) {
    throw new apiError(500, error.message);
  }
};

/**
 * @description Query service types with filtering and pagination
 * @param {Object} filter - Filter object with serviceName, unit, minUnitPrice, maxUnitPrice
 * @param {Object} options - Options object with sortBy, limit, page
 * @return {Object} - Paginated service types with total count
 * @throws {apiError} - If there is an error during the query
 */
const queryServiceTypes = async (filter, options) => {
  try {
    const { serviceName, unit, minUnitPrice, maxUnitPrice } = filter;
    const { sortBy, limit = 10, page = 1 } = options;

    // Build where clause
    const where = {};
    if (serviceName) where.serviceName = { [Op.like]: `%${serviceName}%` };
    if (unit) where.unit = { [Op.like]: `%${unit}%` };
    if (minUnitPrice || maxUnitPrice) {
      where.unitPrice = {};
      if (minUnitPrice) where.unitPrice[Op.gte] = minUnitPrice;
      if (maxUnitPrice) where.unitPrice[Op.lte] = maxUnitPrice;
    }

    // Build order clause
    let order = [];
    if (sortBy) {
      const [field, direction] = sortBy.split(':');
      order = [[field, direction?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']];
    } else {
      order = [['createdAt', 'DESC']];
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await ServiceType.findAndCountAll({
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
  } catch (error) {
    throw new apiError(500, error.message);
  }
};

module.exports = {
  createServiceType,
  getServiceTypeById,
  getServiceTypes,
  queryServiceTypes,
  updateServiceType,
  deleteServiceType,
};

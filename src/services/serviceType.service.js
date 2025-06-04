const db = require("../config/database");
const serviceTypeFieldConfig = require("../config/fieldConfig/serviceType.fieldconfig");
const ApiError = require("../utils/ApiError");
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
  const connection = await db.getConnection();

  try {
    const fields = filterValidFields.filterValidFieldsFromObject(
      serviceTypeData,
      serviceTypeFieldConfig.insertableFields
    );

    const entries = Object.entries(fields);

    if (entries.length === 0) {
      throw new ApiError(status.BAD_REQUEST, "No valid fields provided");
    }

    const query = `INSERT INTO servicetype (${entries
      .map(([key]) => key)
      .join(", ")}) VALUES (${entries.map(() => "?").join(", ")})`;

    const values = entries.map(([_, value]) => value);

    const [result] = await connection.execute(query, values);

    if (result.affectedRows === 0) {
      throw new ApiError(
        status.INTERNAL_SERVER_ERROR,
        "Service type creation failed"
      );
    }

    return {
      message: "Service type created successfully",
      serviceTypeId: result.insertId,
    };
  } catch (error) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, error.message);
  } finally {
    connection.release();
  }
};

/**
 * @description Get a service type by ID
 * @param {number} serviceTypeId - The ID of the service type to be retrieved
 * @return {Object} - The service type data
 * @throws {ApiError} - If there is an error during the retrieval
 * */

const getServiceTypeById = async (serviceTypeId) => {
  const connection = await db.getConnection();

  try {
    if (!serviceTypeId) {
      throw new ApiError(status.BAD_REQUEST, "Service type ID is required");
    }

    const query = `SELECT * FROM servicetype WHERE serviceTypeID = ?`;
    const [rows] = await connection.execute(query, [serviceTypeId]);

    if (rows.length === 0) {
      throw new ApiError(status.NOT_FOUND, "Service type not found");
    }

    return rows[0];
  } catch (error) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, error.message);
  } finally {
    connection.release();
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
  const connection = await db.getConnection();

  try {
    const query = `SELECT * FROM servicetype ORDER BY serviceTypeID LIMIT ? OFFSET ?`;
    const [rows] = await connection.execute(query, [limit, offset]);

    if (rows.length === 0) {
      throw new ApiError(status.NOT_FOUND, "No service types found");
    }

    return rows;
  } catch (error) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, error.message);
  } finally {
    connection.release();
  }
};

/**
 * @description Delete a service type by ID
 * @param {number} serviceTypeId - The ID of the service type to be deleted
 * @return {Object} - The result of the deletion
 * @throws {ApiError} - If there is an error during the deletion
 * */

const updateServiceType = async (serviceTypeId, serviceTypeData) => {
  const connection = await db.getConnection();

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

    const query = `UPDATE servicetype SET ${entries
      .map(([key]) => `${key} = ?`)
      .join(", ")} WHERE serviceTypeID = ?`;

    const values = [...entries.map(([_, value]) => value), serviceTypeId];

    const [result] = await connection.execute(query, values);

    if (result.affectedRows === 0) {
      throw new ApiError(status.NOT_FOUND, "Service type not found");
    }

    return {
      message: "Service type updated successfully",
      serviceTypeId,
    };
  } catch (error) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, error.message);
  } finally {
    connection.release();
  }
};

/**
 * @description Delete a service type by ID
 * @param {number} serviceTypeId - The ID of the service type to be deleted
 * @return {Object} - The result of the deletion
 * @throws {ApiError} - If there is an error during the deletion
 * */

const deleteServiceType = async (serviceTypeId) => {
  const connection = await db.getConnection();

  try {
    if (!serviceTypeId) {
      throw new ApiError(status.BAD_REQUEST, "Service type ID is required");
    }

    const query = `DELETE FROM servicetype WHERE serviceTypeID = ?`;
    const [result] = await connection.execute(query, [serviceTypeId]);

    if (result.affectedRows === 0) {
      throw new ApiError(status.NOT_FOUND, "Service type not found");
    }

    return {
      message: "Service type deleted successfully",
      serviceTypeId,
    };
  } catch (error) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, error.message);
  } finally {
    connection.release();
  }
};

module.exports = {
  createServiceType,
  getServiceTypeById,
  getServiceTypes,
  updateServiceType,
  deleteServiceType,
};

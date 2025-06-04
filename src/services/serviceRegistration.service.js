const db = require("../config/database");
const serviceRegistrationFieldConfig = require("../config/fieldConfig/serviceRegistration.fieldconfig");
const ApiError = require("../utils/ApiError");
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
  const connection = await db.getConnection();

  try {
    const fields = filterValidFields.filterValidFieldsFromObject(
      serviceRegistrationData,
      serviceRegistrationFieldConfig.insertableFields
    );

    const entries = Object.entries(fields);

    if (entries.length === 0) {
      throw new ApiError(status.BAD_REQUEST, "No valid fields provided");
    }

    const query = `INSERT INTO serviceregistration (${entries
      .map(([key]) => key)
      .join(", ")}) VALUES (${entries.map(() => "?").join(", ")})`;

    const values = entries.map(([_, value]) => value);

    const [result] = await connection.execute(query, values);

    if (result.affectedRows === 0) {
      throw new ApiError(
        status.INTERNAL_SERVER_ERROR,
        "Service registration creation failed"
      );
    }

    return {
      message: "Service registration created successfully",
      serviceRegistrationId: result.insertId,
    };
  } catch (error) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, error.message);
  } finally {
    connection.release();
  }
};

/**
 * @description Get a service registration by ID
 * @param {number} serviceRegistrationId - The ID of the service registration to be retrieved
 * @return {Object} - The service registration data
 * @throws {ApiError} - If there is an error during the retrieval
 * */

const getServiceRegistrationById = async (serviceRegistrationId) => {
  const connection = await db.getConnection();

  try {
    if (!serviceRegistrationId) {
      throw new ApiError(
        status.BAD_REQUEST,
        "Service registration ID is required"
      );
    }

    const query = `SELECT * FROM serviceregistration WHERE serviceRegistrationID = ?`;
    const [rows] = await connection.execute(query, [serviceRegistrationId]);

    if (rows.length === 0) {
      throw new ApiError(status.NOT_FOUND, "Service registration not found");
    }

    return rows[0];
  } catch (error) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, error.message);
  } finally {
    connection.release();
  }
};

/**
 * @description Get all service registrations of an apartment
 * @param {number} apartmentId - The ID of the apartment whose service registrations are to be retrieved
 * @return {Array} - An array of service registrations
 * @throws {ApiError} - If there is an error during the retrieval
 * */

const getServiceRegistrationByApartmentId = async (apartmentId) => {
  const connection = await db.getConnection();

  try {
    if (!apartmentId) {
      throw new ApiError(status.BAD_REQUEST, "Apartment ID is required");
    }

    const query = `SELECT * FROM serviceregistration WHERE apartmentID = ?`;
    const [rows] = await connection.execute(query, [apartmentId]);

    if (rows.length === 0) {
      throw new ApiError(status.NOT_FOUND, "Service registration not found");
    }

    return rows[0];
  } catch (error) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, error.message);
  } finally {
    connection.release();
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
  const connection = await db.getConnection();

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

    const query = `UPDATE serviceregistration SET ${entries
      .map(([key]) => `${key} = ?`)
      .join(", ")} WHERE serviceRegistrationID = ?`;

    const values = [
      ...entries.map(([_, value]) => value),
      serviceRegistrationId,
    ];

    const [result] = await connection.execute(query, values);

    if (result.affectedRows === 0) {
      throw new ApiError(
        status.INTERNAL_SERVER_ERROR,
        "Service registration update failed"
      );
    }

    return {
      message: "Service registration updated successfully",
      serviceRegistrationId: result.insertId,
    };
  } catch (error) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, error.message);
  } finally {
    connection.release();
  }
};

/**
 * @description Delete a service registration by ID
 * @param {number} serviceRegistrationId - The ID of the service registration to be deleted
 * @return {Object} - The result of the deletion
 * @throws {ApiError} - If there is an error during the deletion
 * */

const deleteServiceRegistration = async (serviceRegistrationId) => {
  const connection = await db.getConnection();

  try {
    if (!serviceRegistrationId) {
      throw new ApiError(
        status.BAD_REQUEST,
        "Service registration ID is required"
      );
    }

    const query = `DELETE FROM serviceregistration WHERE serviceRegistrationID = ?`;
    const [result] = await connection.execute(query, [serviceRegistrationId]);

    if (result.affectedRows === 0) {
      throw new ApiError(status.NOT_FOUND, "Service registration not found");
    }

    return {
      message: "Service registration deleted successfully",
    };
  } catch (error) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, error.message);
  } finally {
    connection.release();
  }
};

module.exports = {
  createServiceRegistration,
  getServiceRegistrationById,
  getServiceRegistrationByApartmentId,
  updateServiceRegistration,
  deleteServiceRegistration,
};

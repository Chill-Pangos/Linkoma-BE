const db = require("../config/database");
const apartmentFieldConfig = require("../config/fieldConfig/apartment.fieldconfig");
const ApiError = require("../utils/ApiError");
const { status } = require("http-status");
const filterValidFields = require("../utils/filterValidFields");

/**
 * @description Create a new apartment in the database
 * @param {Object} apartmentData - The apartment data to be inserted
 * @return {Object} - The result of the insertion
 * @throws {ApiError} - If there is an error during the insertion
 *
 */

const createApartment = async (apartmentData) => {
  const connection = await db.getConnection();

  try {
    const fields = filterValidFields.filterValidFieldsFromObject(
      apartmentData,
      apartmentFieldConfig.insertableFields
    );

    const entries = Object.entries(fields);

    if (entries.length === 0) {
      throw new ApiError(status.BAD_REQUEST, "No valid fields provided");
    }

    const query = `INSERT INTO apartment (${entries
      .map(([key]) => key)
      .join(", ")}) VALUES (${entries.map(() => "?").join(", ")})`;

    const values = entries.map(([_, value]) => value);

    const [result] = await connection.execute(query, values);

    if (result.affectedRows === 0) {
      throw new ApiError(
        status.INTERNAL_SERVER_ERROR,
        "Apartment creation failed"
      );
    }

    return {
      message: "Apartment created successfully",
      apartmentId: result.insertId,
    };
  } catch (error) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, error.message);
  } finally {
    connection.release();
  }
};

/**
 * @description Get an apartment by ID
 * @param {number} apartmentId - The ID of the apartment to be retrieved
 * @return {Object} - The apartment data
 * @throws {ApiError} - If there is an error during the retrieval
 *
 */

const getApartmentById = async (apartmentId) => {
  const connection = await db.getConnection();

  try {
    const query = `SELECT * FROM apartment WHERE apartmentID = ?`;
    const [rows] = await connection.execute(query, [apartmentId]);

    if (rows.length === 0) {
      throw new ApiError(status.NOT_FOUND, "Apartment not found");
    }

    return rows[0];
  } catch (error) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, error.message);
  } finally {
    connection.release();
  }
};

/**
 * @description Update an apartment in the database
 * @param {number} apartmentId - The ID of the apartment to be updated
 * @param {Object} apartmentData - The apartment data to be updated
 * @return {Object} - The result of the update
 * @throws {ApiError} - If there is an error during the update
 *
 */

const getApartments = async (limit, offset) => {
  const connection = await db.getConnection();

  try {
    const [rows] = await connection.execute(
      "SELECT * FROM apartment ORDER BY apartmentID LIMIT ? OFFSET ?",
      [limit, offset]
    );

    if (rows.length === 0) {
      throw new ApiError(status.NOT_FOUND, "No apartments found");
    }

    const [[{ totalCount }]] = await connection.execute(
      "SELECT COUNT(*) AS totalCount FROM apartment"
    );

    return {
      data: rows,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: Math.ceil(offset / limit) + 1,
    };
  } catch (error) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, error.message);
  } finally {
    connection.release();
  }
};

/**
 * @description Update an apartment by ID
 * @param {number} apartmentId - The ID of the apartment to be updated
 * @param {Object} apartmentData - The apartment data to be updated
 * @return {Object} - The result of the update
 * @throws {ApiError} - If there is an error during the update
 *
 */

const updateApartment = async (apartmentId, apartmentData) => {
  const connection = await db.getConnection();

  try {
    if (!apartmentId) {
      throw new ApiError(status.BAD_REQUEST, "Apartment ID is required");
    }
    const fields = filterValidFields.filterValidFieldsFromObject(
      apartmentData,
      apartmentFieldConfig.updatableFields
    );

    const entries = Object.entries(fields);

    if (entries.length === 0) {
      throw new ApiError(status.BAD_REQUEST, "No valid fields provided");
    }

    const query = `UPDATE apartment SET ${entries
      .map(([key]) => `${key} = ?`)
      .join(", ")} WHERE apartmentID = ?`;

    const values = [...entries.map(([_, value]) => value), apartmentId];

    const [result] = await connection.execute(query, values);

    if (result.affectedRows === 0) {
      throw new ApiError(
        status.INTERNAL_SERVER_ERROR,
        "Apartment update failed"
      );
    }

    return {
      message: "Apartment updated successfully",
      apartmentId: apartmentId,
    };
  } catch (error) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, error.message);
  } finally {
    connection.release();
  }
};

/**
 * @description Delete an apartment by ID
 * @param {number} apartmentId - The ID of the apartment to be deleted
 * @return {Object} - The result of the deletion
 * @throws {ApiError} - If there is an error during the deletion
 *
 */

const deleteApartment = async (apartmentId) => {
  const connection = await db.getConnection();

  try {
    if (!apartmentId) {
      throw new ApiError(status.BAD_REQUEST, "Apartment ID is required");
    }

    const query = `DELETE FROM apartment WHERE apartmentID = ?`;
    const [result] = await connection.execute(query, [apartmentId]);

    if (result.affectedRows === 0) {
      throw new ApiError(
        status.INTERNAL_SERVER_ERROR,
        "Apartment deletion failed"
      );
    }

    return { message: "Apartment deleted successfully" };
  } catch (error) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, error.message);
  } finally {
    connection.release();
  }
};

module.exports = {
  createApartment,
  getApartmentById,
  getApartments,
  updateApartment,
  deleteApartment,
};

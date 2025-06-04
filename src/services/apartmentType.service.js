const db = require("../config/database");
const apartmentTypeFieldConfig = require("../config/fieldConfig/apartmentType.fieldconfig");
const ApiError = require("../utils/ApiError");
const { status } = require("http-status");
const filterValidFields = require("../utils/filterValidFields");

/**
 * @description Create a new apartment type in the database
 *
 * @param {Object} apartmentTypeData - The apartment type data to be inserted
 * @return {Object} - The result of the insertion
 * @throws {ApiError} - If there is an error during the insertion
 */

const createApartmentType = async (apartmentTypeData) => {
  const connection = await db.getConnection();

  try {
    const fields = filterValidFields.filterValidFieldsFromObject(
      apartmentTypeData,
      apartmentTypeFieldConfig.insertableFields
    );

    const entries = Object.entries(fields);

    if (entries.length === 0) {
      throw new ApiError(status.BAD_REQUEST, "No valid fields provided");
    }

    const query = `INSERT INTO apartmenttype (${entries
      .map(([key]) => key)
      .join(", ")}) VALUES (${entries.map(() => "?").join(", ")})`;

    const values = entries.map(([_, value]) => value);

    const [rows] = await connection.execute(query, values);

    if (rows.affectedRows === 0) {
      throw new ApiError(
        status.INTERNAL_SERVER_ERROR,
        "Apartment type creation failed"
      );
    }

    return {
      message: "Apartment type created successfully",
      apartmentTypeId: rows.insertId,
    };
  } catch (error) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, error.message);
  } finally {
    connection.release();
  }
};

/**
 * @description Get an apartment type by ID
 *
 * @param {number} apartmentTypeId - The ID of the apartment type to be retrieved
 * @return {Object} - The apartment type data
 * @throws {ApiError} - If there is an error during the retrieval
 */

const getApartmentTypeById = async (apartmentTypeId) => {
  const connection = await db.getConnection();

  try {
    if (!apartmentTypeId) {
      throw new ApiError(status.BAD_REQUEST, "Apartment type ID is required");
    }

    const [rows] = await connection.execute(
      "SELECT * FORM apartmettype WHERE appartmentTypeID = ?",
      [apartmentTypeId]
    );

    if (rows.length === 0) {
      throw new ApiError(status.NOT_FOUND, "Apartment type not found");
    }

    return rows[0];
  } catch (error) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, error.message);
  } finally {
    connection.release();
  }
};

/**
 * @description Get all apartment types with pagination
 *
 * @param {number} limit - The number of apartment types to retrieve
 * @param {number} offset - The offset for pagination
 * @return {Object} - The paginated list of apartment types
 * @throws {ApiError} - If there is an error during the retrieval
 */

const getApartmentTypes = async (limit, offset) => {
  const connection = await db.getConnection();

  try {
    const [rows] = await connection.execute(
      "SELECT * FROM apartmenttype ORDER BY apartmentTypeID LIMIT ? OFFSET ?",
      [limit, offset]
    );

    if (rows.length === 0) {
      throw new ApiError(status.NOT_FOUND, "No apartment types found");
    }

    const [[{ totalCount }]] = await connection.execute(
      "SELECT COUNT(*) as totalCount FROM apartmenttype"
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
 * @description Get all apartment types
 *
 * @param {number} apartmentTypeId - The ID of the apartment type to be retrieved
 * @param {Object} apartmentTypeData - The apartment type data to be updated
 * @return {Array} - The list of apartment types
 * @throws {ApiError} - If there is an error during the retrieval
 */

const updateApartmentType = async (apartmentTypeId, apartmentTypeData) => {
  const connection = await db.getConnection();

  try {
    if (!apartmentTypeId) {
      throw new ApiError(status.BAD_REQUEST, "Apartment type ID is required");
    }

    const fields = filterValidFields.filterValidFieldsFromObject(
      apartmentTypeData,
      apartmentTypeFieldConfig.updatableFields
    );

    const entries = Object.entries(fields);

    if (entries.length === 0) {
      throw new ApiError(status.BAD_REQUEST, "No valid fields provided");
    }

    const query = `UPDATE apartmenttype SET ${entries
      .map(([key]) => `${key} = ?`)
      .join(", ")} WHERE apartmentTypeID = ?`;

    const values = entries.map(([_, value]) => value);

    const [rows] = await connection.execute(query, [
      ...values,
      apartmentTypeId,
    ]);

    if (rows.affectedRows === 0) {
      throw new ApiError(
        status.INTERNAL_SERVER_ERROR,
        "Apartment type update failed"
      );
    }

    return {
      message: "Apartment type updated successfully",
      apartmentTypeId: apartmentTypeId,
    };
  } catch (error) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, error.message);
  } finally {
    connection.release();
  }
};

/**
 * @description Get all apartment types
 *
 * @param {number} apartmentTypeId - The ID of the apartment type to be retrieved
 * @return {Array} - The list of apartment types
 * @throws {ApiError} - If there is an error during the retrieval
 */

const deleteApartmentType = async (apartmentTypeId) => {
    const connection = await db.getConnection();
    
    try {
        if (!apartmentTypeId) {
        throw new ApiError(status.BAD_REQUEST, "Apartment type ID is required");
        }
    
        const [rows] = await connection.execute(
        "DELETE FROM apartmenttype WHERE apartmentTypeID = ?",
        [apartmentTypeId]
        );
    
        if (rows.affectedRows === 0) {
        throw new ApiError(status.NOT_FOUND, "Apartment type not found");
        }
    
        return { message: "Apartment type deleted successfully" };
    } catch (error) {
        throw new ApiError(status.INTERNAL_SERVER_ERROR, error.message);
    } finally {
        connection.release();
    }
    }

module.exports = {
  createApartmentType,
  getApartmentTypeById,
  getApartmentTypes,
  updateApartmentType,
  deleteApartmentType,
};

const db = require("../config/database");
const contractFieldConfig = require("../config/fieldConfig/contract.fieldconfig");
const ApiError = require("../utils/ApiError");
const { status } = require("http-status");
const filterValidFields = require("../utils/filterValidFields");

/**
 * @description Create a new contract in the database
 *
 * @param {Object} contractData - The contract data to be inserted
 * @return {Object} - The result of the insertion
 * @throws {ApiError} - If there is an error during the insertion
 *
 * */

const createContract = async (contractData) => {
  const connection = await db.getConnection();

  try {
    const fields = filterValidFields.filterValidFieldsFromObject(
      contractData,
      contractFieldConfig.insertableFields
    );

    const entries = Object.entries(fields);

    if (entries.length === 0) {
      throw new ApiError(status.BAD_REQUEST, "No valid fields provided");
    }

    const query = `INSERT INTO contract (${entries
      .map(([key]) => key)
      .join(", ")}) VALUES (${entries.map(() => "?").join(", ")})`;

    const values = entries.map(([_, value]) => value);

    const [result] = await connection.execute(query, values);

    if (result.affectedRows === 0) {
      throw new ApiError(
        status.INTERNAL_SERVER_ERROR,
        "Contract creation failed"
      );
    }

    return {
      message: "Contract created successfully",
      contractId: result.insertId,
    };
  } catch (error) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, error.message);
  } finally {
    connection.release();
  }
};

/**
 * @description Get a contract by ID
 * @param {number} contractId - The ID of the contract to be retrieved
 * @return {Object} - The contract data
 * @throws {ApiError} - If there is an error during the retrieval
 *
 */

const getContractById = async (contractId) => {
  const connection = await db.getConnection();

  try {
    if (!contractId) {
      throw new ApiError(status.BAD_REQUEST, "Contract ID is required");
    }

    const query = "SELECT * FROM contract WHERE contractID = ?";
    const [rows] = await connection.execute(query, [contractId]);

    if (rows.length === 0) {
      throw new ApiError(status.NOT_FOUND, "Contract not found");
    }

    return rows[0];
  } catch (error) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, error.message);
  } finally {
    connection.release();
  }
};

/**
 * @description Get all contracts
 * @param {number} limit - The maximum number of contracts to retrieve
 * @param {number} offset - The number of contracts to skip
 * @return {Array} - The list of contracts
 * @throws {ApiError} - If there is an error during the retrieval
 *
 */

const getContracts = async (limit, offset) => {
  const connection = await db.getConnection();

  try {
    const query =
      "SELECT * FROM contract ORDER BY apartmentID LIMIT ? OFFSET ?";
    const [rows] = await connection.execute(query, [limit, offset]);

    if (rows.length === 0) {
      throw new ApiError(status.NOT_FOUND, "No contracts found");
    }

    return rows;
  } catch (error) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, error.message);
  } finally {
    connection.release();
  }
};

/**
 * @description Update a contract in the database
 * @param {number} contractId - The ID of the contract to be updated
 * @param {Object} contractData - The contract data to be updated
 * @return {Object} - The result of the update
 * @throws {ApiError} - If there is an error during the update
 *
 */

const updateContract = async (contractId, contractData) => {
  const connection = await db.getConnection();

  try {
    if (!contractId) {
      throw new ApiError(status.BAD_REQUEST, "Contract ID is required");
    }
    
    const fields = filterValidFields.filterValidFieldsFromObject(
      contractData,
      contractFieldConfig.updatableFields
    );

    const entries = Object.entries(fields);

    if (entries.length === 0) {
      throw new ApiError(status.BAD_REQUEST, "No valid fields provided");
    }

    const query = `UPDATE contract SET ${entries
      .map(([key]) => `${key} = ?`)
      .join(", ")} WHERE contractID = ?`;

    const values = [...entries.map(([_, value]) => value), contractId];

    const [result] = await connection.execute(query, values);

    if (result.affectedRows === 0) {
      throw new ApiError(
        status.INTERNAL_SERVER_ERROR,
        "Contract update failed"
      );
    }

    return {
      message: "Contract updated successfully",
      contractId: result.insertId,
    };
  } catch (error) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, error.message);
  } finally {
    connection.release();
  }
};

/**
 * @description Delete a contract by ID
 * @param {number} contractId - The ID of the contract to be deleted
 * @return {Object} - The result of the deletion
 * @throws {ApiError} - If there is an error during the deletion
 *
 */

const deleteContract = async (contractId) => {
  const connection = await db.getConnection();

  try {
    if (!contractId) {
      throw new ApiError(status.BAD_REQUEST, "Contract ID is required");
    }

    const query = "DELETE FROM contract WHERE contractID = ?";
    const [result] = await connection.execute(query, [contractId]);

    if (result.affectedRows === 0) {
      throw new ApiError(status.NOT_FOUND, "Contract not found");
    }

    return {
      message: "Contract deleted successfully",
      contractId: contractId,
    };
  } catch (error) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, error.message);
  } finally {
    connection.release();
  }
};

module.exports = {
  createContract,
  getContractById,
  getContracts,
  updateContract,
  deleteContract,
};

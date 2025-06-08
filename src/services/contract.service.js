const Contract = require("../models/contract.model");
const contractFieldConfig = require("../config/fieldConfig/contract.fieldconfig");
const apiError = require("../utils/apiError");
const { status } = require("http-status");
const filterValidFields = require("../utils/filterValidFields");

/**
 * @description Create a new contract in the database
 *
 * @param {Object} contractData - The contract data to be inserted
 * @return {Object} - The result of the insertion
 * @throws {apiError} - If there is an error during the insertion
 *
 * */

const createContract = async (contractData) => {
  try {
    const fields = filterValidFields.filterValidFieldsFromObject(
      contractData,
      contractFieldConfig.insertableFields
    );

    const entries = Object.entries(fields);

    if (entries.length === 0) {
      throw new apiError(status.BAD_REQUEST, "No valid fields provided");
    }

    const contract = await Contract.create(fields);

    if (!contract) {
      throw new apiError(
        status.INTERNAL_SERVER_ERROR,
        "Contract creation failed"
      );
    }

    return {
      message: "Contract created successfully",
      contractId: contract.contractId,
    };
  } catch (error) {
    throw new apiError(status.INTERNAL_SERVER_ERROR, error.message);
  }
};

/**
 * @description Get a contract by ID
 * @param {number} contractId - The ID of the contract to be retrieved
 * @return {Object} - The contract data
 * @throws {apiError} - If there is an error during the retrieval
 *
 */

const getContractById = async (contractId) => {
  try {
    if (!contractId) {
      throw new apiError(status.BAD_REQUEST, "Contract ID is required");
    }

    const contract = await Contract.findByPk(contractId);

    if (!contract) {
      throw new apiError(status.NOT_FOUND, "Contract not found");
    }

    return contract;
  } catch (error) {
    throw new apiError(status.INTERNAL_SERVER_ERROR, error.message);
  }
};

/**
 * @description Get all contracts
 * @param {number} limit - The maximum number of contracts to retrieve
 * @param {number} offset - The number of contracts to skip
 * @return {Array} - The list of contracts
 * @throws {apiError} - If there is an error during the retrieval
 *
 */

const getContracts = async (limit, offset) => {
  try {
    const contracts = await Contract.findAll({
      limit: limit,
      offset: offset,
      order: [['apartmentId', 'ASC']]
    });

    if (contracts.length === 0) {
      throw new apiError(status.NOT_FOUND, "No contracts found");
    }

    return contracts;
  } catch (error) {
    throw new apiError(status.INTERNAL_SERVER_ERROR, error.message);
  }
};

/**
 * @description Update a contract in the database
 * @param {number} contractId - The ID of the contract to be updated
 * @param {Object} contractData - The contract data to be updated
 * @return {Object} - The result of the update
 * @throws {apiError} - If there is an error during the update
 *
 */

const updateContract = async (contractId, contractData) => {
  try {
    if (!contractId) {
      throw new apiError(status.BAD_REQUEST, "Contract ID is required");
    }
    
    const fields = filterValidFields.filterValidFieldsFromObject(
      contractData,
      contractFieldConfig.updatableFields
    );

    const entries = Object.entries(fields);

    if (entries.length === 0) {
      throw new apiError(status.BAD_REQUEST, "No valid fields provided");
    }

    const [affectedRows] = await Contract.update(fields, {
      where: { contractId: contractId }
    });

    if (affectedRows === 0) {
      throw new apiError(
        status.INTERNAL_SERVER_ERROR,
        "Contract update failed"
      );
    }

    return {
      message: "Contract updated successfully",
      contractId: contractId,
    };
  } catch (error) {
    throw new apiError(status.INTERNAL_SERVER_ERROR, error.message);
  }
};

/**
 * @description Delete a contract by ID
 * @param {number} contractId - The ID of the contract to be deleted
 * @return {Object} - The result of the deletion
 * @throws {apiError} - If there is an error during the deletion
 *
 */

const deleteContract = async (contractId) => {
  try {
    if (!contractId) {
      throw new apiError(status.BAD_REQUEST, "Contract ID is required");
    }

    const deletedRows = await Contract.destroy({
      where: { contractId: contractId }
    });

    if (deletedRows === 0) {
      throw new apiError(status.NOT_FOUND, "Contract not found");
    }

    return {
      message: "Contract deleted successfully",
      contractId: contractId,
    };
  } catch (error) {
    throw new apiError(status.INTERNAL_SERVER_ERROR, error.message);
  }
};

module.exports = {
  createContract,
  getContractById,
  getContracts,
  updateContract,
  deleteContract,
};

const Apartment = require("../models/apartment.model");
const apartmentFieldConfig = require("../config/fieldConfig/apartment.fieldconfig");
const apiError = require("../utils/apiError");
const { status } = require("http-status");
const filterValidFields = require("../utils/filterValidFields");

/**
 * @description Create a new apartment in the database
 * @param {Object} apartmentData - The apartment data to be inserted
 * @return {Object} - The result of the insertion
 * @throws {apiError} - If there is an error during the insertion
 *
 */

const createApartment = async (apartmentData) => {
  try {
    const fields = filterValidFields.filterValidFieldsFromObject(
      apartmentData,
      apartmentFieldConfig.insertableFields
    );

    const entries = Object.entries(fields);

    if (entries.length === 0) {
      throw new apiError(status.BAD_REQUEST, "No valid fields provided");
    }

    const apartment = await Apartment.create(fields);

    if (!apartment) {
      throw new apiError(
        status.INTERNAL_SERVER_ERROR,
        "Apartment creation failed"
      );
    }

    return {
      message: "Apartment created successfully",
      apartmentId: apartment.apartmentId,
    };
  } catch (error) {
    throw new apiError(status.INTERNAL_SERVER_ERROR, error.message);
  }
};

/**
 * @description Get an apartment by Id
 * @param {number} apartmentId - The Id of the apartment to be retrieved
 * @return {Object} - The apartment data
 * @throws {apiError} - If there is an error during the retrieval
 *
 */

const getApartmentById = async (apartmentId) => {
  try {
    if (!apartmentId) {
      throw new apiError(status.BAD_REQUEST, "Apartment Id is required");
    }

    const apartment = await Apartment.findByPk(apartmentId);

    if (!apartment) {
      throw new apiError(status.NOT_FOUND, "Apartment not found");
    }

    return apartment;
  } catch (error) {
    throw new apiError(status.INTERNAL_SERVER_ERROR, error.message);
  }
};

/**
 * @description Update an apartment in the database
 * @param {number} apartmentId - The Id of the apartment to be updated
 * @param {Object} apartmentData - The apartment data to be updated
 * @return {Object} - The result of the update
 * @throws {apiError} - If there is an error during the update
 *
 */

const getApartments = async (limit, offset) => {
  try {
    const { count, rows } = await Apartment.findAndCountAll({
      order: [["apartmentId", "ASC"]],
      limit: limit,
      offset: offset,
    });

    if (rows.length === 0) {
      throw new apiError(status.NOT_FOUND, "No apartments found");
    }

    return {
      data: rows,
      totalPages: Math.ceil(count / limit),
      currentPage: Math.ceil(offset / limit) + 1,
    };
  } catch (error) {
    throw new apiError(status.INTERNAL_SERVER_ERROR, error.message);
  }
};

/**
 * @description Update an apartment by Id
 * @param {number} apartmentId - The Id of the apartment to be updated
 * @param {Object} apartmentData - The apartment data to be updated
 * @return {Object} - The result of the update
 * @throws {apiError} - If there is an error during the update
 *
 */

const updateApartment = async (apartmentId, apartmentData) => {
  try {
    if (!apartmentId) {
      throw new apiError(status.BAD_REQUEST, "Apartment Id is required");
    }
    const fields = filterValidFields.filterValidFieldsFromObject(
      apartmentData,
      apartmentFieldConfig.updatableFields
    );

    const entries = Object.entries(fields);

    if (entries.length === 0) {
      throw new apiError(status.BAD_REQUEST, "No valid fields provided");
    }

    const [affectedRows] = await Apartment.update(fields, {
      where: { apartmentId: apartmentId },
    });

    if (affectedRows === 0) {
      throw new apiError(
        status.INTERNAL_SERVER_ERROR,
        "Apartment update failed"
      );
    }

    return {
      message: "Apartment updated successfully",
      apartmentId: apartmentId,
    };
  } catch (error) {
    throw new apiError(status.INTERNAL_SERVER_ERROR, error.message);
  }
};

/**
 * @description Delete an apartment by Id
 * @param {number} apartmentId - The Id of the apartment to be deleted
 * @return {Object} - The result of the deletion
 * @throws {apiError} - If there is an error during the deletion
 *
 */

const deleteApartment = async (apartmentId) => {
  try {
    if (!apartmentId) {
      throw new apiError(status.BAD_REQUEST, "Apartment Id is required");
    }

    const deletedRows = await Apartment.destroy({
      where: { apartmentId: apartmentId },
    });

    if (deletedRows === 0) {
      throw new apiError(
        status.INTERNAL_SERVER_ERROR,
        "Apartment deletion failed"
      );
    }

    return { message: "Apartment deleted successfully" };
  } catch (error) {
    throw new apiError(status.INTERNAL_SERVER_ERROR, error.message);
  }
};

module.exports = {
  createApartment,
  getApartmentById,
  getApartments,
  updateApartment,
  deleteApartment,
};

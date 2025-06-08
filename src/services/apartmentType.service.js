const ApartmentType = require("../models/apartmentType.model");
const apartmentTypeFieldConfig = require("../config/fieldConfig/apartmentType.fieldconfig");
const apiError = require("../utils/apiError");
const { status } = require("http-status");
const filterValidFields = require("../utils/filterValidFields");

/**
 * @description Create a new apartment type in the database
 *
 * @param {Object} apartmentTypeData - The apartment type data to be inserted
 * @return {Object} - The result of the insertion
 * @throws {apiError} - If there is an error during the insertion
 */

const createApartmentType = async (apartmentTypeData) => {
  try {
    const fields = filterValidFields.filterValidFieldsFromObject(
      apartmentTypeData,
      apartmentTypeFieldConfig.insertableFields
    );

    const entries = Object.entries(fields);

    if (entries.length === 0) {
      throw new apiError(status.BAD_REQUEST, "No valid fields provided");
    }

    const result = await ApartmentType.create(fields);

    if (!result) {
      throw new apiError(
        status.INTERNAL_SERVER_ERROR,
        "Apartment type creation failed"
      );
    }

    return {
      message: "Apartment type created successfully",
      apartmentTypeId: result.apartmentTypeID,
    };
  } catch (error) {
    throw new apiError(status.INTERNAL_SERVER_ERROR, error.message);
  }
};

/**
 * @description Get an apartment type by ID
 *
 * @param {number} apartmentTypeId - The ID of the apartment type to be retrieved
 * @return {Object} - The apartment type data
 * @throws {apiError} - If there is an error during the retrieval
 */

const getApartmentTypeById = async (apartmentTypeId) => {
  try {
    if (!apartmentTypeId) {
      throw new apiError(status.BAD_REQUEST, "Apartment type ID is required");
    }

    const apartmentType = await ApartmentType.findByPk(apartmentTypeId);

    if (!apartmentType) {
      throw new apiError(status.NOT_FOUND, "Apartment type not found");
    }

    return apartmentType;
  } catch (error) {
    throw new apiError(status.INTERNAL_SERVER_ERROR, error.message);
  }
};

/**
 * @description Get all apartment types with pagination
 *
 * @param {number} limit - The number of apartment types to retrieve
 * @param {number} offset - The offset for pagination
 * @return {Object} - The paginated list of apartment types
 * @throws {apiError} - If there is an error during the retrieval
 */

const getApartmentTypes = async (limit, offset) => {
  try {
    const apartmentTypes = await ApartmentType.findAll({
      limit: limit,
      offset: offset,
      order: [['apartmentTypeID', 'ASC']]
    });

    if (apartmentTypes.length === 0) {
      throw new apiError(status.NOT_FOUND, "No apartment types found");
    }

    const totalCount = await ApartmentType.count();

    return {
      data: apartmentTypes,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: Math.ceil(offset / limit) + 1,
    };
  } catch (error) {
    throw new apiError(status.INTERNAL_SERVER_ERROR, error.message);
  }
};

/**
 * @description Get all apartment types
 *
 * @param {number} apartmentTypeId - The ID of the apartment type to be retrieved
 * @param {Object} apartmentTypeData - The apartment type data to be updated
 * @return {Array} - The list of apartment types
 * @throws {apiError} - If there is an error during the retrieval
 */

const updateApartmentType = async (apartmentTypeId, apartmentTypeData) => {
  try {
    if (!apartmentTypeId) {
      throw new apiError(status.BAD_REQUEST, "Apartment type ID is required");
    }

    const fields = filterValidFields.filterValidFieldsFromObject(
      apartmentTypeData,
      apartmentTypeFieldConfig.updatableFields
    );

    const entries = Object.entries(fields);

    if (entries.length === 0) {
      throw new apiError(status.BAD_REQUEST, "No valid fields provided");
    }

    const [affectedRows] = await ApartmentType.update(fields, {
      where: { apartmentTypeID: apartmentTypeId }
    });

    if (affectedRows === 0) {
      throw new apiError(
        status.NOT_FOUND,
        "Apartment type not found"
      );
    }

    return {
      message: "Apartment type updated successfully",
      apartmentTypeId: apartmentTypeId,
    };
  } catch (error) {
    throw new apiError(status.INTERNAL_SERVER_ERROR, error.message);
  }
};

/**
 * @description Get all apartment types
 *
 * @param {number} apartmentTypeId - The ID of the apartment type to be retrieved
 * @return {Array} - The list of apartment types
 * @throws {apiError} - If there is an error during the retrieval
 */

const deleteApartmentType = async (apartmentTypeId) => {
    try {
        if (!apartmentTypeId) {
        throw new apiError(status.BAD_REQUEST, "Apartment type ID is required");
        }
    
        const affectedRows = await ApartmentType.destroy({
            where: { apartmentTypeID: apartmentTypeId }
        });
    
        if (affectedRows === 0) {
        throw new apiError(status.NOT_FOUND, "Apartment type not found");
        }
    
        return { message: "Apartment type deleted successfully" };
    } catch (error) {
        throw new apiError(status.INTERNAL_SERVER_ERROR, error.message);
    }
}

module.exports = {
  createApartmentType,
  getApartmentTypeById,
  getApartmentTypes,
  updateApartmentType,
  deleteApartmentType,
};

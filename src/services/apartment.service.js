const Apartment = require("../models/apartment.model");
const ApartmentType = require("../models/apartmentType.model");
const apartmentFieldConfig = require("../config/fieldConfig/apartment.fieldconfig");
const apartmentTypeFieldConfig = require("../config/fieldConfig/apartmentType.fieldconfig");
const apiError = require("../utils/apiError");
const httpStatus= require("http-status");
const { Op } = require("sequelize");
const filterValidFields = require("../utils/filterValidFields");
const pick = require("../utils/pick");

/**
 * @description Create a new apartment in the database
 *
 * @param {Object} apartmentData - The apartment data to be inserted
 * @return {Object} - The result of the insertion
 * @throws {apiError} - If there is an error during the insertion
 */
const createApartment = async (apartmentData) => {
  try {
    const fields = filterValidFields.filterValidFieldsFromObject(
      apartmentData,
      apartmentFieldConfig.insertableFields
    );

    const entries = Object.entries(fields);

    if (entries.length === 0) {
      throw new apiError(400, "No valid fields provided");
    }

    // Check if apartment type exists
    if (fields.apartmentTypeId) {
      const apartmentType = await ApartmentType.findByPk(fields.apartmentTypeId);
      if (!apartmentType) {
        throw new apiError(400, "Apartment type not found");
      }
    }

    const apartment = await Apartment.create(fields);

    if (!apartment) {
      throw new apiError(500, "Failed to create apartment");
    }

    return apartment;
  } catch (error) {
    throw error;
  }
};

/**
 * @description Get all apartments with optional filtering and pagination
 *
 * @param {Object} filter - Filter options
 * @param {Object} options - Query options (sorting, pagination)
 * @return {Object} - Paginated results
 * @throws {apiError} - If there is an error during the query
 */
const getApartments = async (filter, options) => {
  try {
    const { limit, page, sortBy } = options;

    // Build where clause from filter
    const where = {};
    if (filter.apartmentTypeId) where.apartmentTypeId = filter.apartmentTypeId;
    if (filter.floor) where.floor = filter.floor;
    if (filter.status) where.status = filter.status;

    // Build order clause
    let order = [];
    if (sortBy) {
      const [field, direction] = sortBy.split(':');
      order = [[field, direction?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']];
    } else {
      order = [['createdAt', 'DESC']];
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Apartment.findAndCountAll({
      where,
      include: [
        {
          model: ApartmentType,
          as: 'apartmentType',
          attributes: ['apartmentTypeId', 'typeName', 'area', 'numBedrooms', 'numBathrooms', 'rentFee']
        }
      ],
      order,
      limit,
      offset,
    });

    const totalPages = Math.ceil(count / limit);

    return {
      apartments: rows,
      pagination: {
        page,
        limit,
        totalPages,
        totalResults: count,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  } catch (error) {
    throw error;
  }
};

/**
 * @description Get apartment by ID
 *
 * @param {number} apartmentId - The apartment ID
 * @return {Object} - The apartment data
 * @throws {apiError} - If apartment not found
 */
const getApartmentById = async (apartmentId) => {
  try {
    const apartment = await Apartment.findByPk(apartmentId, {
      include: [
        {
          model: ApartmentType,
          as: 'apartmentType',
          attributes: ['apartmentTypeId', 'typeName', 'area', 'numBedrooms', 'numBathrooms', 'rentFee', 'description']
        }
      ]
    });

    if (!apartment) {
      throw new apiError(404, "Apartment not found");
    }

    return apartment;
  } catch (error) {
    throw error;
  }
};

/**
 * @description Update apartment by ID
 *
 * @param {number} apartmentId - The apartment ID
 * @param {Object} updateData - The data to update
 * @return {Object} - The updated apartment
 * @throws {apiError} - If apartment not found or update fails
 */
const updateApartmentById = async (apartmentId, updateData) => {
  try {
    const fields = filterValidFields.filterValidFieldsFromObject(
      updateData,
      apartmentFieldConfig.updatableFields
    );

    const entries = Object.entries(fields);

    if (entries.length === 0) {
      throw new apiError(400, "No valid fields provided");
    }

    // Check if apartment type exists (if being updated)
    if (fields.apartmentTypeId) {
      const apartmentType = await ApartmentType.findByPk(fields.apartmentTypeId);
      if (!apartmentType) {
        throw new apiError(400, "Apartment type not found");
      }
    }

    const apartment = await Apartment.findByPk(apartmentId);
    if (!apartment) {
      throw new apiError(404, "Apartment not found");
    }

    await apartment.update(fields);

    // Return updated apartment with apartment type
    const updatedApartment = await Apartment.findByPk(apartmentId, {
      include: [
        {
          model: ApartmentType,
          as: 'apartmentType',
          attributes: ['apartmentTypeId', 'typeName', 'area', 'numBedrooms', 'numBathrooms', 'rentFee', 'description']
        }
      ]
    });

    return updatedApartment;
  } catch (error) {
    throw error;
  }
};

/**
 * @description Delete apartment by ID
 *
 * @param {number} apartmentId - The apartment ID
 * @return {boolean} - Success status
 * @throws {apiError} - If apartment not found or delete fails
 */
const deleteApartmentById = async (apartmentId) => {
  try {
    const apartment = await Apartment.findByPk(apartmentId);
    if (!apartment) {
      throw new apiError(404, "Apartment not found");
    }

    await apartment.destroy();
    return true;
  } catch (error) {
    throw error;
  }
};

// ================ APARTMENT TYPE SERVICES ================

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
      throw new apiError(400, "No valid fields provided");
    }

    const apartmentType = await ApartmentType.create(fields);

    if (!apartmentType) {
      throw new apiError(500, "Failed to create apartment type");
    }

    return apartmentType;
  } catch (error) {
    throw error;
  }
};

/**
 * @description Get all apartment types with optional filtering and pagination
 *
 * @param {Object} filter - Filter options
 * @param {Object} options - Query options (sorting, pagination)
 * @return {Object} - Paginated results
 * @throws {apiError} - If there is an error during the query
 */
const getApartmentTypes = async (filter, options) => {
  try {
    const { limit, page, sortBy } = options;

    // Build where clause from filter
    const where = {};
    if (filter.typeName) where.typeName = { [Op.iLike]: `%${filter.typeName}%` };
    if (filter.minArea) where.area = { ...where.area, [Op.gte]: filter.minArea };
    if (filter.maxArea) where.area = { ...where.area, [Op.lte]: filter.maxArea };
    if (filter.numBedrooms) where.numBedrooms = filter.numBedrooms;
    if (filter.numBathrooms) where.numBathrooms = filter.numBathrooms;
    if (filter.minRentFee) where.rentFee = { ...where.rentFee, [Op.gte]: filter.minRentFee };
    if (filter.maxRentFee) where.rentFee = { ...where.rentFee, [Op.lte]: filter.maxRentFee };

    // Build order clause
    let order = [];
    if (sortBy) {
      const [field, direction] = sortBy.split(':');
      order = [[field, direction?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']];
    } else {
      order = [['createdAt', 'DESC']];
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await ApartmentType.findAndCountAll({
      where,
      order,
      limit,
      offset,
    });

    const totalPages = Math.ceil(count / limit);

    return {
      apartmentTypes: rows,
      pagination: {
        page,
        limit,
        totalPages,
        totalResults: count,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  } catch (error) {
    throw error;
  }
};

/**
 * @description Get apartment type by ID
 *
 * @param {number} apartmentTypeId - The apartment type ID
 * @return {Object} - The apartment type data
 * @throws {apiError} - If apartment type not found
 */
const getApartmentTypeById = async (apartmentTypeId) => {
  try {
    const apartmentType = await ApartmentType.findByPk(apartmentTypeId);

    if (!apartmentType) {
      throw new apiError(404, "Apartment type not found");
    }

    return apartmentType;
  } catch (error) {
    throw error;
  }
};

/**
 * @description Update apartment type by ID
 *
 * @param {number} apartmentTypeId - The apartment type ID
 * @param {Object} updateData - The data to update
 * @return {Object} - The updated apartment type
 * @throws {apiError} - If apartment type not found or update fails
 */
const updateApartmentTypeById = async (apartmentTypeId, updateData) => {
  try {
    const fields = filterValidFields.filterValidFieldsFromObject(
      updateData,
      apartmentTypeFieldConfig.updatableFields
    );

    const entries = Object.entries(fields);

    if (entries.length === 0) {
      throw new apiError(400, "No valid fields provided");
    }

    const apartmentType = await ApartmentType.findByPk(apartmentTypeId);
    if (!apartmentType) {
      throw new apiError(404, "Apartment type not found");
    }

    await apartmentType.update(fields);

    return apartmentType;
  } catch (error) {
    throw error;
  }
};

/**
 * @description Delete apartment type by ID
 *
 * @param {number} apartmentTypeId - The apartment type ID
 * @return {boolean} - Success status
 * @throws {apiError} - If apartment type not found or delete fails
 */
const deleteApartmentTypeById = async (apartmentTypeId) => {
  try {
    // Check if any apartments are using this type
    const apartmentsUsingType = await Apartment.count({
      where: { apartmentTypeId }
    });

    if (apartmentsUsingType > 0) {
      throw new apiError(400, "Cannot delete apartment type that is being used by apartments");
    }

    const apartmentType = await ApartmentType.findByPk(apartmentTypeId);
    if (!apartmentType) {
      throw new apiError(404, "Apartment type not found");
    }

    await apartmentType.destroy();
    return true;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createApartment,
  getApartments,
  getApartmentById,
  updateApartmentById,
  deleteApartmentById,
  createApartmentType,
  getApartmentTypes,
  getApartmentTypeById,
  updateApartmentTypeById,
  deleteApartmentTypeById,
};

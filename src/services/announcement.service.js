const Announcement = require("../models/announcement.model");
const announcementFieldConfig = require("../config/fieldConfig/announcement.fieldconfig");
const apiError = require("../utils/apiError");
const { status } = require("http-status");
const filterValidFields = require("../utils/filterValidFields");

/**
 * @description Create a new announcement in the database
 *
 *  @param {Object} announcementData - The announcement data to be inserted
 * @return {Object} - The result of the insertion
 * @throws {apiError} - If there is an error during the insertion
 *
 * */

const createAnnouncement = async (announcementData) => {
  try {
    const fields = filterValidFields.filterValidFieldsFromObject(
      announcementData,
      announcementFieldConfig.insertableFields
    );

    const entries = Object.entries(fields);

    if (entries.length === 0) {
      throw new apiError(status.BAD_REQUEST, "No valid fields provided");
    }

    const announcement = await Announcement.create(fields);

    if (!announcement) {
      throw new apiError(
        status.INTERNAL_SERVER_ERROR,
        "Announcement creation failed"
      );
    }

    return {
      message: "Announcement created successfully",
      announcementId: announcement.announcementId,
    };
  } catch (error) {
    throw new apiError(status.INTERNAL_SERVER_ERROR, error.message);
  }
};

/**
 * @description Get an announcement by Id
 *
 * @param {number} announcementId - The Id of the announcement to be retrieved
 * @return {Object} - The announcement data
 * @throws {apiError} - If there is an error during the retrieval
 *
 * */

const getAnnouncementById = async (announcementId) => {
  try {
    if (!announcementId) {
      throw new apiError(status.BAD_REQUEST, "Announcement Id is required");
    }

    const announcement = await Announcement.findByPk(announcementId);

    if (!announcement) {
      throw new apiError(status.NOT_FOUND, "Announcement not found");
    }

    return announcement;
  } catch (error) {
    throw new apiError(status.INTERNAL_SERVER_ERROR, error.message);
  }
};

/**
 * @description Get all announcements with pagination and filtering
 *
 * @param {number} limit - The number of announcements to retrieve
 * @param {number} offset - The offset for pagination
 * @param {Object} filters - Filtering options (type, priority, author)
 * @param {string} sortBy - Sort criteria in format "field:direction"
 * @return {Object} - Object containing announcements and pagination info
 * @throws {apiError} - If there is an error during the retrieval
 *
 */

const getAnnouncements = async (limit, offset, filters = {}, sortBy = 'createdAt:desc') => {
  try {
    const where = {};
    
    // Apply filters
    if (filters.type) {
      where.type = filters.type;
    }
    if (filters.priority) {
      where.priority = filters.priority;
    }
    if (filters.author) {
      where.author = filters.author;
    }

    // Parse sort criteria
    const [sortField, sortDirection] = sortBy.split(':');
    const order = [[sortField || 'createdAt', sortDirection?.toUpperCase() || 'DESC']];

    const { count, rows } = await Announcement.findAndCountAll({
      where,
      order,
      limit: limit,
      offset: offset,
    });

    return {
      results: rows,
      totalResults: count,
    };
  } catch (error) {
    throw new apiError(status.INTERNAL_SERVER_ERROR, error.message);
  }
};

/**
 * @description Update an announcement in the database
 *
 * @param {number} announcementId - The Id of the announcement to be updated
 * @param {Object} announcementData - The announcement data to be updated
 * @return {Object} - The result of the update
 * @throws {apiError} - If there is an error during the update
 *
 */

const updateAnnouncement = async (announcementId, announcementData) => {
  try {
    if (!announcementId) {
      throw new apiError(status.BAD_REQUEST, "Announcement Id is required");
    }

    const fields = filterValidFields.filterValidFieldsFromObject(
      announcementData,
      announcementFieldConfig.updatableFields
    );

    const entries = Object.entries(fields);

    if (entries.length === 0) {
      throw new apiError(status.BAD_REQUEST, "No valid fields provided");
    }

    const [affectedRows] = await Announcement.update(fields, {
      where: { announcementId: announcementId },
    });

    if (affectedRows === 0) {
      throw new apiError(
        status.INTERNAL_SERVER_ERROR,
        "Announcement update failed"
      );
    }

    return {
      message: "Announcement updated successfully",
      announcementId: announcementId,
    };
  } catch (error) {
    throw new apiError(status.INTERNAL_SERVER_ERROR, error.message);
  }
};

/**
 * @description Delete an announcement by Id
 *
 * @param {number} announcementId - The Id of the announcement to be deleted
 * @return {Object} - The result of the deletion
 * @throws {apiError} - If there is an error during the deletion
 *
 */

const deleteAnnouncement = async (announcementId) => {
  try {
    if (!announcementId) {
      throw new apiError(status.BAD_REQUEST, "Announcement Id is required");
    }

    const deletedRows = await Announcement.destroy({
      where: { announcementId: announcementId },
    });

    if (deletedRows === 0) {
      throw new apiError(status.NOT_FOUND, "Announcement not found");
    }

    return {
      message: "Announcement deleted successfully",
    };
  } catch (error) {
    throw new apiError(status.INTERNAL_SERVER_ERROR, error.message);
  }
};

module.exports = {
  createAnnouncement,
  getAnnouncementById,
  getAnnouncements,
  updateAnnouncement,
  deleteAnnouncement,
};

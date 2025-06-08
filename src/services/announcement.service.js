const Announcement = require("../models/announcement.model");
const announcementFieldConfig = require("../config/fieldConfig/announcement.fieldconfig");
const ApiError = require("../utils/apiError");
const { status } = require("http-status");
const filterValidFields = require("../utils/filterValidFields");

/**
 * @description Create a new announcement in the database
 *
 *  @param {Object} announcementData - The announcement data to be inserted
 * @return {Object} - The result of the insertion
 * @throws {ApiError} - If there is an error during the insertion
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
      throw new ApiError(status.BAD_REQUEST, "No valid fields provided");
    }

    const announcement = await Announcement.create(fields);

    if (!announcement) {
      throw new ApiError(
        status.INTERNAL_SERVER_ERROR,
        "Announcement creation failed"
      );
    }

    return {
      message: "Announcement created successfully",
      announcementId: announcement.announcementId,
    };
  } catch (error) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, error.message);
  }
};

/**
 * @description Get an announcement by ID
 *
 * @param {number} announcementId - The ID of the announcement to be retrieved
 * @return {Object} - The announcement data
 * @throws {ApiError} - If there is an error during the retrieval
 *
 * */

const getAnnouncementById = async (announcementId) => {
  try {
    if (!announcementId) {
      throw new ApiError(status.BAD_REQUEST, "Announcement ID is required");
    }

    const announcement = await Announcement.findByPk(announcementId);

    if (!announcement) {
      throw new ApiError(status.NOT_FOUND, "Announcement not found");
    }

    return announcement;
  } catch (error) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, error.message);
  }
};

/**
 * @description Get all announcements with pagination
 *
 * @param {number} limit - The number of announcements to retrieve
 * @param {number} offset - The offset for pagination
 * @return {Array} - An array of announcements
 * @throws {ApiError} - If there is an error during the retrieval
 *
 */

  const getAnnouncements = async (limit, offset) => {
    try {
      const announcements = await Announcement.findAll({
      order: [["createdAt", "DESC"]],
        
      limit: limit,
      offset: offset,
    });

    if (announcements.length === 0) {
      throw new ApiError(status.NOT_FOUND, "No announcements found");
    }

    return announcements;
  } catch (error) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, error.message);
  }
};

/**
 * @description Update an announcement in the database
 *
 * @param {number} announcementId - The ID of the announcement to be updated
 * @param {Object} announcementData - The announcement data to be updated
 * @return {Object} - The result of the update
 * @throws {ApiError} - If there is an error during the update
 *
 */

const updateAnnouncement = async (announcementId, announcementData) => {
  try {
    if (!announcementId) {
      throw new ApiError(status.BAD_REQUEST, "Announcement ID is required");
    }

    const fields = filterValidFields.filterValidFieldsFromObject(
      announcementData,
      announcementFieldConfig.updatableFields
    );

    const entries = Object.entries(fields);

    if (entries.length === 0) {
      throw new ApiError(status.BAD_REQUEST, "No valid fields provided");
    }

    const [affectedRows] = await Announcement.update(fields, {
      where: { announcementId: announcementId },
    });

    if (affectedRows === 0) {
      throw new ApiError(
        status.INTERNAL_SERVER_ERROR,
        "Announcement update failed"
      );
    }

    return {
      message: "Announcement updated successfully",
      announcementId: announcementId,
    };
  } catch (error) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, error.message);
  }
};

/**
 * @description Delete an announcement by ID
 *
 * @param {number} announcementId - The ID of the announcement to be deleted
 * @return {Object} - The result of the deletion
 * @throws {ApiError} - If there is an error during the deletion
 *
 */

const deleteAnnouncement = async (announcementId) => {
  try {
    if (!announcementId) {
      throw new ApiError(status.BAD_REQUEST, "Announcement ID is required");
    }

    const deletedRows = await Announcement.destroy({
      where: { announcementId: announcementId },
    });

    if (deletedRows === 0) {
      throw new ApiError(status.NOT_FOUND, "Announcement not found");
    }

    return {
      message: "Announcement deleted successfully",
    };
  } catch (error) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, error.message);
  }
};

module.exports = {
  createAnnouncement,
  getAnnouncementById,
  getAnnouncements,
  updateAnnouncement,
  deleteAnnouncement,
};

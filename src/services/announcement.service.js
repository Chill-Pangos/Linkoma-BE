const db = require("../config/database");
const announcementFieldConfig = require("../config/fieldConfig/announcement.fieldconfig");
const ApiError = require("../utils/ApiError");
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

const CreateAnnouncement = async (announcementData) => {
  const connection = await db.getConnection();

  try {
    const fields = filterValidFields.filterValidFieldsFromObject(
      announcementData,
      announcementFieldConfig.insertableFields
    );

    const entries = Object.entries(fields);

    if (entries.length === 0) {
      throw new ApiError(status.BAD_REQUEST, "No valid fields provided");
    }

    const query = `INSERT INTO anouncement (${entries
      .map(([key]) => key)
      .join(", ")}) VALUES (${entries.map(() => "?").join(", ")})`;

    const values = entries.map(([_, value]) => value);

    const [result] = await connection.execute(query, values);

    if (result.affectedRows === 0) {
      throw new ApiError(
        status.INTERNAL_SERVER_ERROR,
        "Announcement creation failed"
      );
    }

    return {
      message: "Announcement created successfully",
      announcementId: result.insertId,
    };
  } catch (error) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, error.message);
  } finally {
    connection.release();
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

const GetAnnouncementById = async (announcementId) => {
  const connection = await db.getConnection();

  try {
    if (!announcementId) {
      throw new ApiError(status.BAD_REQUEST, "Announcement ID is required");
    }

    const query = "SELECT * FROM announcement WHERE announcementID = ?";
    const [rows] = await connection.execute(query, [announcementId]);

    if (rows.length === 0) {
      throw new ApiError(status.NOT_FOUND, "Announcement not found");
    }

    return rows[0];
  } catch (error) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, error.message);
  } finally {
    connection.release();
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

const GetAnnouncements = async (limit, offset) => {
  const connection = await db.getConnection();

  try {
    const query =
      "SELECT * FROM announcement ORDER BY createdAt DESC LIMIT ? OFFSET ?";

    const values = [limit, offset];

    const [rows] = await connection.execute(query, values);

    if (rows.length === 0) {
      throw new ApiError(status.NOT_FOUND, "No announcements found");
    }

    return rows;
  } catch (error) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, error.message);
  } finally {
    connection.release();
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

const UpdateAnnouncement = async (announcementId, announcementData) => {
  const connection = await db.getConnection();

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

    const query = `UPDATE announcement SET ${entries
      .map(([key]) => `${key} = ?`)
      .join(", ")} WHERE announcementID = ?`;

    const values = [...entries.map(([_, value]) => value), announcementId];

    const [result] = connection.execute(query, values);

    if (result.affectedRows === 0) {
      throw new ApiError(
        status.INTERNAL_SERVER_ERROR,
        "Announcement update failed"
      );
    }

    return {
      message: "Announcement updated successfully",
      announcementId: result.insertId,
    };
  } catch (error) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, error.message);
  } finally {
    connection.release();
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

const DeleteAnnouncement = async (announcementId) => {
  const connection = await db.getConnection();

  try {
    if (!announcementId) {
      throw new ApiError(status.BAD_REQUEST, "Announcement ID is required");
    }

    const query = "DELETE FROM announcement WHERE announcementID = ?";
    const [result] = await connection.execute(query, [announcementId]);

    if (result.affectedRows === 0) {
      throw new ApiError(status.NOT_FOUND, "Announcement not found");
    }

    return {
      message: "Announcement deleted successfully",
    };
  } catch (error) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, error.message);
  } finally {
    connection.release();
  }
};

module.exports = {
  CreateAnnouncement,
  GetAnnouncementById,
  GetAnnouncements,
  UpdateAnnouncement,
  DeleteAnnouncement
};

const db = require("../config/database");
const feedbackFieldConfig = require("../config/fieldConfig/feedback.fieldconfig");
const ApiError = require("../utils/ApiError");
const { status } = require("http-status");
const filterValidFields = require("../utils/filterValidFields");

/**
 * @description Create a new feedback in the database
 *
 * @param {Object} feedbackData - The feedback data to be inserted
 * @return {Object} - The result of the insertion
 *  * @throws {ApiError} - If there is an error during the insertion
 *  * */

const createFeedback = async (feedbackData) => {
  const connection = await db.getConnection();

  try {
    const fields = filterValidFields.filterValidFieldsFromObject(
      feedbackData,
      feedbackFieldConfig.insertableFields
    );

    const entries = Object.entries(fields);

    if (entries.length === 0) {
      throw new ApiError(status.BAD_REQUEST, "No valid fields provided");
    }

    const query = `INSERT INTO feedback (${entries
      .map(([key]) => key)
      .join(", ")}) VALUES (${entries.map(() => "?").join(", ")})`;

    const values = entries.map(([_, value]) => value);

    const [result] = await connection.execute(query, values);

    if (result.affectedRows === 0) {
      throw new ApiError(
        status.INTERNAL_SERVER_ERROR,
        "Feedback creation failed"
      );
    }

    return {
      message: "Feedback created successfully",
      feedbackId: result.insertId,
    };
  } catch (error) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, error.message);
  } finally {
    connection.release();
  }
};

/**
 * @description Get a feedback by ID
 * @param {number} feedbackId - The ID of the feedback to be retrieved
 * @return {Object} - The feedback data
 * @throws {ApiError} - If there is an error during the retrieval
 * */

const getFeedbackById = async (feedbackId) => {
  const connection = await db.getConnection();

  try {
    if (!feedbackId) {
      throw new ApiError(status.BAD_REQUEST, "Feedback ID is required");
    }

    const query = "SELECT * FROM feedback WHERE feedbackID = ?";
    const [rows] = await connection.execute(query, [feedbackId]);

    if (rows.length === 0) {
      throw new ApiError(status.NOT_FOUND, "Feedback not found");
    }

    return rows[0];
  } catch (error) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, error.message);
  } finally {
    connection.release();
  }
};

/**
 * @description Get feedbacks with pagination
 * @param {number} limit - The number of feedbacks to retrieve
 * @param {number} offset - The offset for pagination
 * @return {Array} - The list of feedbacks
 * @throws {ApiError} - If there is an error during the retrieval
 * */

const getFeedbacks = async (limit, offset) => {
  const connection = await db.getConnection();

  try {
    const query = "SELECT * FROM feedback ORDER BY createdAt LIMIT ? OFFSET ?";

    const [rows] = await connection.execute(query, [limit, offset]);

    if (rows.length === 0) {
      throw new ApiError(status.NOT_FOUND, "No feedback found");
    }

    return rows;
  } catch (error) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, error.message);
  } finally {
    connection.release();
  }
};

/**
 * @description Update feedback by ID
 * @param {number} feedbackId - The ID of the feedback to be updated
 * @param {Object} feedbackData - The new feedback data
 * @return {Object} - The result of the update
 * @throws {ApiError} - If there is an error during the update
 * */

const updateFeedback = async (feedbackId, feedbackData) => {
  const connection = await db.getConnection();

  try {
    if (!feedbackId) {
      throw new ApiError(status.BAD_REQUEST, "Feedback ID is required");
    }

    const fields = filterValidFields.filterValidFieldsFromObject(
      feedbackData,
      feedbackFieldConfig.updatableFields
    );

    const entries = Object.entries(fields);

    if (entries.length === 0) {
      throw new ApiError(status.BAD_REQUEST, "No valid fields provided");
    }

    const query = `UPDATE feedback SET ${entries
      .map(([key]) => `${key} = ?`)
      .join(", ")} WHERE feedbackID = ?`;

    const values = [...entries.map(([_, value]) => value), feedbackId];

    const [result] = await connection.execute(query, values);

    if (result.affectedRows === 0) {
      throw new ApiError(
        status.INTERNAL_SERVER_ERROR,
        "Feedback update failed"
      );
    }

    return {
      message: "Feedback updated successfully",
      feedbackId: feedbackId,
    };
  } catch (error) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, error.message);
  } finally {
    connection.release();
  }
};

/**
 * @description Delete feedback by ID
 * @param {number} feedbackId - The ID of the feedback to be deleted
 * @return {Object} - The result of the deletion
 * @throws {ApiError} - If there is an error during the deletion
 * */

const deleteFeedback = async (feedbackId) => {
  const connection = await db.getConnection();

  try {
    if (!feedbackId) {
      throw new ApiError(status.BAD_REQUEST, "Feedback ID is required");
    }

    const query = "DELETE FROM feedback WHERE feedbackID = ?";
    const [result] = await connection.execute(query, [feedbackId]);

    if (result.affectedRows === 0) {
      throw new ApiError(status.NOT_FOUND, "Feedback not found");
    }

    return {
      message: "Feedback deleted successfully",
      feedbackId: feedbackId,
    };
  } catch (error) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, error.message);
  } finally {
    connection.release();
  }
};

module.exports = {
  createFeedback,
  getFeedbackById,
  getFeedbacks,
  updateFeedback,
  deleteFeedback,
};

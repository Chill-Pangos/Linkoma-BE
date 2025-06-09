const Feedback = require("../models/feedback.model");
const feedbackFieldConfig = require("../config/fieldConfig/feedback.fieldconfig");
const apiError = require("../utils/apiError");
const { status } = require("http-status");
const filterValidFields = require("../utils/filterValidFields");

/**
 * @description Create a new feedback in the database
 *
 * @param {Object} feedbackData - The feedback data to be inserted
 * @return {Object} - The result of the insertion
 *  * @throws {apiError} - If there is an error during the insertion
 *  * */

const createFeedback = async (feedbackData) => {
  try {
    const fields = filterValidFields.filterValidFieldsFromObject(
      feedbackData,
      feedbackFieldConfig.insertableFields
    );

    const entries = Object.entries(fields);

    if (entries.length === 0) {
      throw new apiError(status.BAD_REQUEST, "No valid fields provided");
    }

    const feedback = await Feedback.create(fields);

    if (!feedback) {
      throw new apiError(
        status.INTERNAL_SERVER_ERROR,
        "Feedback creation failed"
      );
    }

    return {
      message: "Feedback created successfully",
      feedbackId: feedback.feedbackId,
    };
  } catch (error) {
    throw new apiError(status.INTERNAL_SERVER_ERROR, error.message);
  }
};

/**
 * @description Get a feedback by Id
 * @param {number} feedbackId - The Id of the feedback to be retrieved
 * @return {Object} - The feedback data
 * @throws {apiError} - If there is an error during the retrieval
 * */

const getFeedbackById = async (feedbackId) => {
  try {
    if (!feedbackId) {
      throw new apiError(status.BAD_REQUEST, "Feedback Id is required");
    }

    const feedback = await Feedback.findByPk(feedbackId);

    if (!feedback) {
      throw new apiError(status.NOT_FOUND, "Feedback not found");
    }

    return feedback;
  } catch (error) {
    throw new apiError(status.INTERNAL_SERVER_ERROR, error.message);
  }
};

/**
 * @description Get feedbacks with pagination
 * @param {number} limit - The number of feedbacks to retrieve
 * @param {number} offset - The offset for pagination
 * @return {Array} - The list of feedbacks
 * @throws {apiError} - If there is an error during the retrieval
 * */

const getFeedbacks = async (limit, offset) => {
  try {
    const feedbacks = await Feedback.findAll({
      limit: limit,
      offset: offset,
      order: [['createdAt', 'ASC']]
    });

    if (feedbacks.length === 0) {
      throw new apiError(status.NOT_FOUND, "No feedback found");
    }

    return feedbacks;
  } catch (error) {
    throw new apiError(status.INTERNAL_SERVER_ERROR, error.message);
  }
};

/**
 * @description Update feedback by Id
 * @param {number} feedbackId - The Id of the feedback to be updated
 * @param {Object} feedbackData - The new feedback data
 * @return {Object} - The result of the update
 * @throws {apiError} - If there is an error during the update
 * */

const updateFeedback = async (feedbackId, feedbackData) => {
  try {
    if (!feedbackId) {
      throw new apiError(status.BAD_REQUEST, "Feedback Id is required");
    }

    const fields = filterValidFields.filterValidFieldsFromObject(
      feedbackData,
      feedbackFieldConfig.updatableFields
    );

    const entries = Object.entries(fields);

    if (entries.length === 0) {
      throw new apiError(status.BAD_REQUEST, "No valid fields provided");
    }

    const [affectedRows] = await Feedback.update(fields, {
      where: { feedbackId: feedbackId }
    });

    if (affectedRows === 0) {
      throw new apiError(
        status.INTERNAL_SERVER_ERROR,
        "Feedback update failed"
      );
    }

    return {
      message: "Feedback updated successfully",
      feedbackId: feedbackId,
    };
  } catch (error) {
    throw new apiError(status.INTERNAL_SERVER_ERROR, error.message);
  }
};

/**
 * @description Delete feedback by Id
 * @param {number} feedbackId - The Id of the feedback to be deleted
 * @return {Object} - The result of the deletion
 * @throws {apiError} - If there is an error during the deletion
 * */

const deleteFeedback = async (feedbackId) => {
  try {
    if (!feedbackId) {
      throw new apiError(status.BAD_REQUEST, "Feedback Id is required");
    }

    const deletedRows = await Feedback.destroy({
      where: { feedbackId: feedbackId }
    });

    if (deletedRows === 0) {
      throw new apiError(status.NOT_FOUND, "Feedback not found");
    }

    return {
      message: "Feedback deleted successfully",
      feedbackId: feedbackId,
    };
  } catch (error) {
    throw new apiError(status.INTERNAL_SERVER_ERROR, error.message);
  }
};

module.exports = {
  createFeedback,
  getFeedbackById,
  getFeedbacks,
  updateFeedback,
  deleteFeedback,
};

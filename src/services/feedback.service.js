const Feedback = require("../models/feedback.model");
const feedbackFieldConfig = require("../config/fieldConfig/feedback.fieldconfig");
const apiError = require("../utils/apiError");
const httpStatus= require("http-status");
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
      throw new apiError(400, "No valid fields provided");
    }

    const feedback = await Feedback.create(fields);

    if (!feedback) {
      throw new apiError(
        500,
        "Feedback creation failed"
      );
    }

    return {
      message: "Feedback created successfully",
      feedbackId: feedback.feedbackId,
    };
  } catch (error) {
    throw new apiError(500, error.message);
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
      throw new apiError(400, "Feedback Id is required");
    }

    const feedback = await Feedback.findByPk(feedbackId);

    if (!feedback) {
      throw new apiError(404, "Feedback not found");
    }

    return feedback;
  } catch (error) {
    throw new apiError(500, error.message);
  }
};

/**
 * @description Get feedbacks with pagination and filters
 * @param {number} limit - Number of items per page  
 * @param {number} offset - Number of items to skip
 * @param {Object} filters - Filter criteria {userId, category, status}
 * @param {string} sortBy - Sort field and direction (e.g., 'createdAt:desc')
 * @return {Object} - Paginated feedbacks with metadata
 * @throws {apiError} - If there is an error during the retrieval
 * */

const getFeedbacks = async (limit = 10, offset = 0, filters = {}, sortBy = 'createdAt:desc') => {
  try {
    
    // Build where clause from filters
    const where = {};
    if (filters.userId) where.userId = filters.userId;
    if (filters.category) where.category = filters.category;
    if (filters.status) where.status = filters.status;
    
    // Parse sortBy (e.g., 'createdAt:desc' -> ['createdAt', 'DESC'])
    let order = [['createdAt', 'DESC']];
    if (sortBy) {
      const [field, direction = 'ASC'] = sortBy.split(':');
      order = [[field, direction.toUpperCase()]];
    }

    const { count, rows: feedbacks } = await Feedback.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order
    });

    const totalPages = Math.ceil(count / limit);
    const currentPage = Math.floor(offset / limit) + 1;

    return {
      results: feedbacks,
      totalResults: count,
      totalPages,
      page: currentPage,
      limit: parseInt(limit)
    };
  } catch (error) {
    throw new apiError(500, error.message);
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
      throw new apiError(400, "Feedback Id is required");
    }

    const fields = filterValidFields.filterValidFieldsFromObject(
      feedbackData,
      feedbackFieldConfig.updatableFields
    );

    const entries = Object.entries(fields);

    if (entries.length === 0) {
      throw new apiError(400, "No valid fields provided");
    }

    const [affectedRows] = await Feedback.update(fields, {
      where: { feedbackId: feedbackId }
    });

    if (affectedRows === 0) {
      throw new apiError(
        500,
        "Feedback update failed"
      );
    }

    return {
      message: "Feedback updated successfully",
      feedbackId: feedbackId,
    };
  } catch (error) {
    throw new apiError(500, error.message);
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
      throw new apiError(400, "Feedback Id is required");
    }

    const deletedRows = await Feedback.destroy({
      where: { feedbackId: feedbackId }
    });

    if (deletedRows === 0) {
      throw new apiError(404, "Feedback not found");
    }

    return {
      message: "Feedback deleted successfully",
      feedbackId: feedbackId,
    };
  } catch (error) {
    throw new apiError(500, error.message);
  }
};

module.exports = {
  createFeedback,
  getFeedbackById,
  getFeedbacks,
  updateFeedback,
  deleteFeedback,
};

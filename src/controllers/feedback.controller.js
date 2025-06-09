const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { feedbackService } = require('../services');

/**
 * Create a feedback
 */
const createFeedback = catchAsync(async (req, res) => {
  const feedback = await feedbackService.createFeedback(req.body);
  res.status(httpStatus.CREATED).send(feedback);
});

/**
 * Get all feedbacks
 */
const getFeedbacks = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, sortBy, userId, category, status } = req.query;
  const offset = (page - 1) * limit;
  
  const filters = {};
  if (userId) filters.userId = userId;
  if (category) filters.category = category;
  if (status) filters.status = status;
  
  const result = await feedbackService.getFeedbacks(
    parseInt(limit),
    parseInt(offset), 
    filters,
    sortBy
  );
  res.send(result);
});

/**
 * Get feedback by id
 */
const getFeedback = catchAsync(async (req, res) => {
  const feedback = await feedbackService.getFeedbackById(req.params.feedbackId);
  res.send(feedback);
});

/**
 * Update feedback
 */
const updateFeedback = catchAsync(async (req, res) => {
  const feedback = await feedbackService.updateFeedback(req.params.feedbackId, req.body);
  res.send(feedback);
});

/**
 * Delete feedback
 */
const deleteFeedback = catchAsync(async (req, res) => {
  const result = await feedbackService.deleteFeedback(req.params.feedbackId);
  res.send(result);
});

/**
 * Get feedbacks by user ID
 */
const getUserFeedbacks = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, sortBy, category, status } = req.query;
  const offset = (page - 1) * limit;
  
  const filters = { userId: req.params.userId };
  if (category) filters.category = category;
  if (status) filters.status = status;
  
  const result = await feedbackService.getFeedbacks(
    parseInt(limit),
    parseInt(offset),
    filters,
    sortBy
  );
  res.send(result);
});

module.exports = {
  createFeedback,
  getFeedbacks,
  getFeedback,
  updateFeedback,
  deleteFeedback,
  getUserFeedbacks,
};
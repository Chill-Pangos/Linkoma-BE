const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { userService } = require('../services');

/**
 * Create a user
 */
const createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(201).send(user);
});

/**
 * Get all users with optional role filter
 */
const getUsers = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, role } = req.query;
  const offset = (page - 1) * limit;
  
  const result = await userService.getUsers(parseInt(limit), parseInt(offset), role);
  res.send(result);
});

/**
 * Get user by id
 */
const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  res.send(user);
});

/**
 * Update user
 */
const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUser(req.params.userId, req.body);
  res.send(user);
});

/**
 * Delete user
 */
const deleteUser = catchAsync(async (req, res) => {
  const result = await userService.deleteUser(req.params.userId);
  res.send(result);
});

/**
 * Get user by email
 */
const getUserByEmail = catchAsync(async (req, res) => {
  const user = await userService.getUserByEmail(req.params.email);
  res.send(user);
});

/**
 * Create user with email
 */
const createUserWithEmail = catchAsync(async (req, res) => {
  const user = await userService.createUserWithEmail(req.body.email);
  res.status(201).send(user);
});

/**
 * Get users by role
 */
const getUsersByRole = catchAsync(async (req, res) => {
  const { role } = req.params;
  const { page, limit } = req.query;
  
  let offset = null;
  let parsedLimit = null;
  
  if (page && limit) {
    parsedLimit = parseInt(limit);
    offset = (parseInt(page) - 1) * parsedLimit;
  }
  
  const result = await userService.getUsersByRole(role, parsedLimit, offset);
  res.send(result);
});

/**
 * Get user count by role
 */
const getUserCountByRole = catchAsync(async (req, res) => {
  const result = await userService.getUserCountByRole();
  res.send(result);
});

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getUserByEmail,
  createUserWithEmail,
  getUsersByRole,
  getUserCountByRole,
};

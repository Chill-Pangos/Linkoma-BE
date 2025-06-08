const User = require("../models/user.model");
const userFieldConfig = require("../config/fieldConfig/user.fieldconfig");
const apiError = require("../utils/apiError");
const { status } = require("http-status");
const filterValidFields = require("../utils/filterValidFields");
const bcrypt = require("bcryptjs");

/**
 * @description Create a new user in the database
 *
 * @param {Object} userData - The user data to be inserted
 * @return {Object} - The result of the insertion
 * @throws {apiError} - If there is an error during the insertion
 */

const createUser = async (userData) => {
  try {
    const fields = filterValidFields.filterValidFieldsFromObject(
      userData,
      userFieldConfig.insertableFields
    );

    if (fields.password) {
      const salt = await bcrypt.genSalt(10);
      fields.password = await bcrypt.hash(fields.password, salt);
    }

    const entries = Object.entries(fields);

    if (entries.length === 0) {
      throw new apiError(status.BAD_REQUEST, "No valid fields provided");
    }

    const user = await User.create(fields);

    if (!user) {
      throw new apiError(status.INTERNAL_SERVER_ERROR, "User creation failed");
    }

    return { message: "User created successfully", userId: user.userId };
  } catch (error) {
    throw new apiError(status.INTERNAL_SERVER_ERROR, error.message);
  }
};

/**
 * @description Get a user by ID
 *
 * @param {number} userId - The ID of the user to be retrieved
 * @return {Object} - The user data
 * @throws {apiError} - If there is an error during the retrieval
 */

const getUserById = async (userId) => {
  try {
    if (!userId) {
      throw new apiError(status.BAD_REQUEST, "User ID is required");
    }

    const user = await User.findByPk(userId);
    
    if (!user) {
      throw new apiError(status.NOT_FOUND, "User not found");
    }

    return user;
  } catch (error) {
    throw new apiError(status.INTERNAL_SERVER_ERROR, error.message);
  }
};

/**
 * @description Get all users with pagination
 *
 * @param {number} limit - The number of users to retrieve
 * @param {number} offset - The offset for pagination
 * @return {Array} - The list of users
 * @throws {apiError} - If there is an error during the retrieval
 */

const getUsers = async (limit, offset) => {
  try {
    const users = await User.findAll({
      limit: limit,
      offset: offset,
      order: [['userId', 'ASC']]
    });

    if (users.length === 0) {
      throw new apiError(status.NOT_FOUND, "No users found");
    }

    const totalCount = await User.count();

    return {
      data: users,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: Math.ceil(offset / limit) + 1,
    };
  } catch (error) {
    throw new apiError(status.INTERNAL_SERVER_ERROR, error.message);
  }
};

/**
 * @description Update a user by ID
 *
 * @param {number} userId - The ID of the user to be updated
 * @param {Object} userData  - The user data to be updated
 * @return {Object} - The result of the update
 * @throws {apiError} - If there is an error during the update
 */

const updateUser = async (userId, userData) => {
  try {
    if (!userId) {
      throw new apiError(status.BAD_REQUEST, "User ID is required");
    }

    const fields = filterValidFields.filterValidFieldsFromObject(
      userData,
      userFieldConfig.updatableFields
    );

    if (fields.password) {
      const salt = await bcrypt.genSalt(10);
      fields.password = await bcrypt.hash(fields.password, salt);
    }

    const entries = Object.entries(fields);

    if (entries.length === 0) {
      throw new apiError(status.BAD_REQUEST, "No valid fields provided");
    }

    const [affectedRows] = await User.update(fields, {
      where: { userId: userId }
    });

    if (affectedRows === 0) {
      throw new apiError(status.INTERNAL_SERVER_ERROR, "User update failed");
    }

    return { message: "User updated successfully", userId: userId };
  } catch (error) {
    throw new apiError(status.INTERNAL_SERVER_ERROR, error.message);
  }
};

/**
 * @description Delete a user by ID
 *
 * @param {number} userId - The ID of the user to be deleted
 * @return {Object} - The result of the deletion
 * @throws {apiError} - If there is an error during the deletion
 */

const deleteUser = async (userId) => {
  try {
    if (!userId) {
      throw new apiError(status.BAD_REQUEST, "User ID is required");
    }

    const deletedRows = await User.destroy({
      where: { userId: userId }
    });

    if (deletedRows === 0) {
      throw new apiError(status.NOT_FOUND, "User not found");
    }

    return { message: "User deleted successfully" };
  } catch (error) {
    throw new apiError(status.INTERNAL_SERVER_ERROR, error.message);
  }
};

/**
 * @description Get a user by email
 *
 * @param {string} email - The email of the user to be retrieved
 * @return {Object} - The user data
 * @throws {apiError} - If there is an error during the retrieval
 */

const getUserByEmail = async (email) => {
  try {
    if(!email) {
      throw new apiError(status.BAD_REQUEST, "Email is required");
    }

    const user = await User.findOne({
      where: { email: email }
    });

    if (!user) {
      throw new apiError(status.NOT_FOUND, "User not found");
    }

    return user;
  } catch (error) {
    throw new apiError(status.INTERNAL_SERVER_ERROR, error.message);
  }
}

module.exports = {
  createUser,
  getUserById,
  getUsers,
  updateUser,
  deleteUser,
  getUserByEmail
};

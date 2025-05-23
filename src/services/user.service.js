const db = require("../config/database");
const userFieldConfig = require("../config/fieldConfig/user.fieldconfig");
const ApiError = require("../utils/ApiError");
const { status } = require("http-status");
const filterValidFields = require("../utils/filterValidFields");
const bcrypt = require("bcryptjs");

/**
 * @description Create a new user in the database
 *
 * @param {Object} userData - The user data to be inserted
 * @return {Object} - The result of the insertion
 * @throws {ApiError} - If there is an error during the insertion
 */

const CreateUser = async (userData) => {
  const connection = await db.getConnection();
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
      throw new ApiError(status.BAD_REQUEST, "No valid fields provided");
    }

    const query = `INSERT INTO user (${entries
      .map(([key]) => key)
      .join(", ")}) VALUES (${entries.map(() => "?").join(", ")})`;

    const values = entries.map(([_, value]) => value);

    const [result] = await connection.execute(query, values);

    if (result.affectedRows === 0) {
      throw new ApiError(status.INTERNAL_SERVER_ERROR, "User creation failed");
    }

    return { message: "User created successfully", userId: result.insertId };
  } catch (error) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, error.message);
  } finally {
    connection.release();
  }
};

/**
 * @description Get a user by ID
 *
 * @param {number} userId - The ID of the user to be retrieved
 * @return {Object} - The user data
 * @throws {ApiError} - If there is an error during the retrieval
 */

const GetUserById = async (userId) => {
  const connection = await db.getConnection();

  try {
    if (!userId) {
      throw new ApiError(status.BAD_REQUEST, "User ID is required");
    }

    const [rows] = await connection.execute(
      "SELECT * FROM user WHERE userID = ?",
      [userId]
    );
    if (rows.length === 0) {
      throw new ApiError(status.NOT_FOUND, "User not found");
    }

    return rows[0];
  } catch (error) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, error.message);
  } finally {
    connection.release();
  }
};

/**
 * @description Get all users with pagination
 *
 * @param {number} limit - The number of users to retrieve
 * @param {number} offset - The offset for pagination
 * @return {Array} - The list of users
 * @throws {ApiError} - If there is an error during the retrieval
 */

const GetUsers = async (limit, offset) => {
  const connection = await db.getConnection();

  try {
    const [rows] = await connection.execute(
      "SELECT * FROM user ORDER BY userID LIMIT ? OFFSET ?",
      [limit, offset]
    );

    if (rows.length === 0) {
      throw new ApiError(status.NOT_FOUND, "No users found");
    }

    const [[{ totalCount }]] = await connection.execute(
      "SELECT COUNT(*) as total FROM user"
    );

    return {
      data: rows,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: Math.ceil(offset / limit) + 1,
    };
  } catch (error) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, error.message);
  } finally {
    connection.release();
  }
};

/**
 * @description Update a user by ID
 *
 * @param {number} userId - The ID of the user to be updated
 * @param {Object} userData  - The user data to be updated
 * @return {Object} - The result of the update
 * @throws {ApiError} - If there is an error during the update
 */

const UpdateUser = async (userId, userData) => {
  const connection = await db.getConnection();

  try {
    if (!userId) {
      throw new ApiError(status.BAD_REQUEST, "User ID is required");
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
      throw new ApiError(status.BAD_REQUEST, "No valid fields provided");
    }

    const query = `UPDATE user SET ${entries
      .map(([key]) => `${key} = ?`)
      .join(", ")} WHERE userID = ?`;

    const values = [...entries.map(([_, value]) => value), userId];

    const [result] = await connection.execute(query, values);

    if (result.affectedRows === 0) {
      throw new ApiError(status.INTERNAL_SERVER_ERROR, "User update failed");
    }

    return { message: "User updated successfully", userId: userId };
  } catch (error) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, error.message);
  } finally {
    connection.release();
  }
};

/**
 * @description Delete a user by ID
 *
 * @param {number} userId - The ID of the user to be deleted
 * @return {Object} - The result of the deletion
 * @throws {ApiError} - If there is an error during the deletion
 */

const DeleteUser = async (userId) => {
  const connection = await db.getConnection();

  try {
    if (!userId) {
      throw new ApiError(status.BAD_REQUEST, "User ID is required");
    }

    const [rows] = await connection.execute(
      "DELETE FROM user WHERE userID = ?",
      [userId]
    );

    if (rows.affectedRows === 0) {
      throw new ApiError(status.NOT_FOUND, "User not found");
    }

    return { message: "User deleted successfully" };
  } catch (error) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, error.message);
  } finally {
    connection.release();
  }
};

module.exports = {
  CreateUser,
  GetUserById,
  GetUsers,
  UpdateUser,
  DeleteUser,
};

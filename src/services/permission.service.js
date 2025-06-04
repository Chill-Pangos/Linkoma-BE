const db = require("../config/database");
const ApiError = require("../utils/ApiError");
const { status } = require("http-status");

/**
 * @description Create a new role in the database
 *
 * @param {Object} permissionData - The role data to be inserted
 * @return {Object} - The result of the insertion
 * @throws {ApiError} - If there is an error during the insertion
 */

const createPermission = async (permissionData) => {
  const connection = await db.getConnection();

  try {
    const query = "INSERT INTO permissions (role, permissionKey) VALUES (?, ?)";
    const values = [permissionData.role, permissionData.permissionKey];

    const [result] = await connection.execute(query, values);

    if (result.affectedRows === 0) {
      throw new ApiError(status.INTERNAL_SERVER_ERROR, "Permission creation failed");
    }

    return {
      message: "Permission created successfully",
      permissionId: result.insertId,
    };
  } catch (error) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, error.message);
  } finally {
    connection.release();
  }
}

/**
 * @description Get a permission by ID
 *
 * @param {number} permissionId - The ID of the permission to be retrieved
 * @return {Object} - The permission data
 * @throws {ApiError} - If the permission is not found or if there is an error during the retrieval
 */

const getPermissionById = async (permissionId) => {
  const connection = await db.getConnection();

  try {
    const query = "SELECT * FROM permissions WHERE permissionID = ?";
    const [rows] = await connection.execute(query, [permissionId]);

    if (rows.length === 0) {
      throw new ApiError(status.NOT_FOUND, "Permission not found");
    }

    return rows[0];
  } catch (error) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, error.message);
  } finally {
    connection.release();
  }
}

/**
 * @description Get all permissions from the database
 *
 * @return {Array} - An array of all permissions
 * @throws {ApiError} - If there are no permissions found or if there is an error during the retrieval
 */

const getAllPermissions = async () => {
  const connection = await db.getConnection();

  try {
    const query = "SELECT * FROM permissions";
    const [rows] = await connection.execute(query);

    if (rows.length === 0) {
      throw new ApiError(status.NOT_FOUND, "No permissions found");
    }

    return rows;
  } catch (error) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, error.message);
  } finally {
    connection.release();
  }
}

/**
 * @description Delete permission by ID
 *
 * @param {number} permissionId - The ID of the permission to be deleted
 * @return {Object} - The result of the deletion
 * @throws {ApiError} - If the permission is not found or if there is an error during the deletion
 */

const deletePermission = async (permissionId) => {
  const connection = await db.getConnection();

  try {
    const query = "DELETE FROM permissions WHERE permissionID = ?";
    const [result] = await connection.execute(query, [permissionId]);

    if (result.affectedRows === 0) {
      throw new ApiError(status.NOT_FOUND, "Permission not found");
    }

    return {
      message: "Permission deleted successfully",
    };
  } catch (error) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, error.message);
  } finally {
    connection.release();
  }
}

/**
 * @description Check if a role has a specific permission
 *
 * @param {string} role - The role to check
 * @param {string} permissionKey - The permission key to check
 * @return {boolean} - True if the role has the permission, otherwise throws an error
 * @throws {ApiError} - If the permission is not found or if there is an error during the check
 */

const checkPermission = async (role, permissionKey) => {
  const connection = await db.getConnection();

  try {
    const query = "SELECT * FROM permissions WHERE role = ? AND permissionKey = ?";
    const [rows] = await connection.execute(query, [role, permissionKey]);

    if (rows.length === 0) {
      throw new ApiError(status.FORBIDDEN, "Permission denied");
    }

    return true; 
  } catch (error) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, error.message);
  } finally {
    connection.release();
  }
}

module.exports = {
  createPermission,
  getPermissionById,
  getAllPermissions,
  deletePermission,
  checkPermission
};
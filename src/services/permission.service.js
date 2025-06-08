const Permission = require("../models/permissions.model");
const apiError = require("../utils/apiError");
const { status } = require("http-status");

/**
 * @description Create a new role in the database
 *
 * @param {Object} permissionData - The role data to be inserted
 * @return {Object} - The result of the insertion
 * @throws {apiError} - If there is an error during the insertion
 */

const createPermission = async (permissionData) => {
  try {
    const result = await Permission.create({
      role: permissionData.role,
      permissionKey: permissionData.permissionKey
    });

    if (!result) {
      throw new apiError(status.INTERNAL_SERVER_ERROR, "Permission creation failed");
    }

    return {
      message: "Permission created successfully",
      permissionId: result.permissionID,
    };
  } catch (error) {
    throw new apiError(status.INTERNAL_SERVER_ERROR, error.message);
  }
}

/**
 * @description Get a permission by ID
 *
 * @param {number} permissionId - The ID of the permission to be retrieved
 * @return {Object} - The permission data
 * @throws {apiError} - If the permission is not found or if there is an error during the retrieval
 */

const getPermissionById = async (permissionId) => {
  try {
    const permission = await Permission.findByPk(permissionId);

    if (!permission) {
      throw new apiError(status.NOT_FOUND, "Permission not found");
    }

    return permission;
  } catch (error) {
    throw new apiError(status.INTERNAL_SERVER_ERROR, error.message);
  }
}

/**
 * @description Get all permissions from the database
 *
 * @return {Array} - An array of all permissions
 * @throws {apiError} - If there are no permissions found or if there is an error during the retrieval
 */

const getAllPermissions = async () => {
  try {
    const permissions = await Permission.findAll();

    if (permissions.length === 0) {
      throw new apiError(status.NOT_FOUND, "No permissions found");
    }

    return permissions;
  } catch (error) {
    throw new apiError(status.INTERNAL_SERVER_ERROR, error.message);
  }
}

/**
 * @description Delete permission by ID
 *
 * @param {number} permissionId - The ID of the permission to be deleted
 * @return {Object} - The result of the deletion
 * @throws {apiError} - If the permission is not found or if there is an error during the deletion
 */

const deletePermission = async (permissionId) => {
  try {
    const affectedRows = await Permission.destroy({
      where: { permissionID: permissionId }
    });

    if (affectedRows === 0) {
      throw new apiError(status.NOT_FOUND, "Permission not found");
    }

    return {
      message: "Permission deleted successfully",
    };
  } catch (error) {
    throw new apiError(status.INTERNAL_SERVER_ERROR, error.message);
  }
}

/**
 * @description Check if a role has a specific permission
 *
 * @param {string} role - The role to check
 * @param {string} permissionKey - The permission key to check
 * @return {boolean} - True if the role has the permission, otherwise throws an error
 * @throws {apiError} - If the permission is not found or if there is an error during the check
 */

const checkPermission = async (role, permissionKey) => {
  try {
    const permission = await Permission.findOne({
      where: { 
        role: role, 
        permissionKey: permissionKey 
      }
    });

    if (!permission) {
      throw new apiError(status.FORBIDDEN, "Permission denied");
    }

    return true; 
  } catch (error) {
    throw new apiError(status.INTERNAL_SERVER_ERROR, error.message);
  }
}

module.exports = {
  createPermission,
  getPermissionById,
  getAllPermissions,
  deletePermission,
  checkPermission
};

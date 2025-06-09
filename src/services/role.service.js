const { roles, roleRights } = require('../config/roles');
const apiError = require('../utils/apiError');
const { status } = require('http-status');

/**
 * @description Get all available roles
 * @returns {Array} Array of role names
 */
const getAllRoles = () => {
  return roles;
};

/**
 * @description Get permissions for a specific role
 * @param {string} role - Role name
 * @returns {Array} Array of permissions
 * @throws {apiError} If role doesn't exist
 */
const getRolePermissions = (role) => {
  if (!roleRights.has(role)) {
    throw new apiError(status.BAD_REQUEST, `Role '${role}' does not exist`);
  }
  return roleRights.get(role);
};

/**
 * @description Check if a role has a specific permission
 * @param {string} role - Role name
 * @param {string} permission - Permission to check
 * @returns {boolean} True if role has permission
 */
const hasPermission = (role, permission) => {
  if (!roleRights.has(role)) {
    return false;
  }
  return roleRights.get(role).includes(permission);
};

/**
 * @description Check if a role exists
 * @param {string} role - Role name
 * @returns {boolean} True if role exists
 */
const isValidRole = (role) => {
  return roles.includes(role);
};

/**
 * @description Assign role to user (this would be done through a separate user-role mapping)
 * @param {number} userId - User ID
 * @param {string} role - Role to assign
 * @returns {Object} Success message
 * @throws {apiError} If role doesn't exist
 */
const assignRoleToUser = async (userId, role) => {
  if (!isValidRole(role)) {
    throw new apiError(status.BAD_REQUEST, `Invalid role: ${role}`);
  }
  
  // This would typically update a user-role mapping table or user record
  // For now, we'll just return success (implement based on your user management needs)
  
  return {
    message: `Role '${role}' assigned to user ${userId} successfully`,
    userId,
    role
  };
};

module.exports = {
  getAllRoles,
  getRolePermissions,
  hasPermission,
  isValidRole,
  assignRoleToUser,
};

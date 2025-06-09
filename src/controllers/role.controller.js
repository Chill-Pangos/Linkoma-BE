const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { roleService } = require('../services');

/**
 * Get all roles
 */
const getAllRoles = catchAsync(async (req, res) => {
  const roles = roleService.getAllRoles();
  res.send({ roles });
});

/**
 * Get permissions for a specific role
 */
const getRolePermissions = catchAsync(async (req, res) => {
  const permissions = roleService.getRolePermissions(req.params.role);
  res.send({ 
    role: req.params.role,
    permissions 
  });
});

/**
 * Check if role has specific permission
 */
const checkRolePermission = catchAsync(async (req, res) => {
  const { role, permission } = req.params;
  const hasPermission = roleService.hasPermission(role, permission);
  res.send({ 
    role,
    permission,
    hasPermission 
  });
});

/**
 * Assign role to user
 */
const assignRoleToUser = catchAsync(async (req, res) => {
  const result = await roleService.assignRoleToUser(req.params.userId, req.body.role);
  res.send(result);
});

module.exports = {
  getAllRoles,
  getRolePermissions,
  checkRolePermission,
  assignRoleToUser,
};

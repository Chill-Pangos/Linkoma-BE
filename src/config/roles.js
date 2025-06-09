const allRoles = {
  user: ['getProfile', 'updateProfile'],
  resident: [
    'getProfile', 
    'updateProfile',
    'viewAnnouncements',
    'viewContracts',
    'createFeedback',
    'viewFeedback',
    'viewInvoices',
    'viewServices',
    'registerService'
  ],
  manager: [
    'getProfile',
    'updateProfile', 
    'getUsers',
    'manageAnnouncements',
    'manageContracts',
    'manageFeedback',
    'manageInvoices',
    'manageServices',
    'manageApartments',
    'manageApartmentTypes',
    'viewReports'
  ],
  admin: [
    'getProfile',
    'updateProfile',
    'getUsers',
    'manageUsers',
    'manageAnnouncements',
    'manageContracts',
    'manageFeedback', 
    'manageInvoices',
    'manageServices',
    'manageApartments',
    'manageApartmentTypes',
    'managePermissions',
    'viewReports',
    'systemConfig'
  ],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};

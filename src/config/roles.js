const allRoles = {
  resident: [
    'getProfile', 
    'updateProfile',
    'viewAnnouncements',
    'viewContracts',
    'createFeedbacks',
    'getFeedbacks',
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
    'manageFeedbacks',
    'getFeedbacks',
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
    'manageFeedbacks',
    'getFeedbacks', 
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

const allRoles = {
  resident: [
    'getProfile', 
    'updateProfile',
    'viewAnnouncements',
    'viewContracts',
    'createFeedbacks',
    'getFeedbacks',
    'viewInvoices',
    'getInvoices',
    'getInvoiceDetails',
    'viewServices',
    'registerService',
    'getApartments',
    'getServiceTypes',
    'getServiceRegistrations'
  ],
  manager: [
    'getProfile',
    'updateProfile', 
    'getUsers',
    'manageAnnouncements',
    'manageContracts',
    'manageFeedbacks',
    'getFeedbacks',
    'getInvoices',
    'manageInvoices',
    'getInvoiceDetails',
    'manageInvoiceDetails',
    'manageServices',
    'manageApartments',
    'manageApartmentTypes',
    'getServiceTypes',
    'manageServiceTypes',
    'getServiceRegistrations',
    'manageServiceRegistrations',
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
    'getInvoices',
    'manageInvoices',
    'getInvoiceDetails',
    'manageInvoiceDetails',
    'manageServices',
    'manageApartments',
    'manageApartmentTypes',
    'getServiceTypes',
    'manageServiceTypes',
    'getServiceRegistrations',
    'manageServiceRegistrations',
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

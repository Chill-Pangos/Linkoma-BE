const User = require('./user.model');
const Apartment = require('./apartment.model');
const ApartmentType = require('./apartmentType.model');
const Announcement = require('./announcement.model');
const Feedback = require('./feedback.model');
const Contract = require('./contract.model');
const Invoice = require('./invoice.model');
const InvoiceDetail = require('./invoiceDetail.model');
const ServiceRegistration = require('./serviceRegistration.model');
const ServiceType = require('./serviceType.model');
const Token = require('./tokens.model');

// Define associations
// ApartmentType - Apartment (One-to-Many)
ApartmentType.hasMany(Apartment, {
  foreignKey: 'apartmentTypeId',
  as: 'apartments'
});

Apartment.belongsTo(ApartmentType, {
  foreignKey: 'apartmentTypeId',
  as: 'apartmentType'
});

// User - Announcement (One-to-Many)
User.hasMany(Announcement, {
  foreignKey: 'author',
  as: 'announcements'
});

Announcement.belongsTo(User, {
  foreignKey: 'author',
  as: 'authorUser'
});

// User - Feedback (One-to-Many)
User.hasMany(Feedback, {
  foreignKey: 'userId',
  as: 'feedbacks'
});

Feedback.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// User - Contract (One-to-Many)
User.hasMany(Contract, {
  foreignKey: 'residentId',
  as: 'contracts'
});

Contract.belongsTo(User, {
  foreignKey: 'residentId',
  as: 'resident'
});

// Apartment - Contract (One-to-Many)
Apartment.hasMany(Contract, {
  foreignKey: 'apartmentId',
  as: 'contracts'
});

Contract.belongsTo(Apartment, {
  foreignKey: 'apartmentId',
  as: 'apartment'
});

// Contract - Invoice (One-to-Many)
Contract.hasMany(Invoice, {
  foreignKey: 'contractId',
  as: 'invoices'
});

Invoice.belongsTo(Contract, {
  foreignKey: 'contractId',
  as: 'contract'
});

// Invoice - InvoiceDetail (One-to-Many)
Invoice.hasMany(InvoiceDetail, {
  foreignKey: 'invoiceId',
  as: 'invoiceDetails'
});

InvoiceDetail.belongsTo(Invoice, {
  foreignKey: 'invoiceId',
  as: 'invoice'
});

// ServiceType - InvoiceDetail (One-to-Many)
ServiceType.hasMany(InvoiceDetail, {
  foreignKey: 'serviceTypeId',
  as: 'invoiceDetails'
});

InvoiceDetail.belongsTo(ServiceType, {
  foreignKey: 'serviceTypeId',
  as: 'serviceType'
});

// User - ServiceRegistration (One-to-Many)
User.hasMany(ServiceRegistration, {
  foreignKey: 'userId',
  as: 'serviceRegistrations'
});

ServiceRegistration.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// ServiceType - ServiceRegistration (One-to-Many)
ServiceType.hasMany(ServiceRegistration, {
  foreignKey: 'serviceTypeId',
  as: 'serviceRegistrations'
});

ServiceRegistration.belongsTo(ServiceType, {
  foreignKey: 'serviceTypeId',
  as: 'serviceType'
});

// User - Token (One-to-Many)
User.hasMany(Token, {
  foreignKey: 'userId',
  as: 'tokens'
});

Token.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

module.exports = {
  User,
  Apartment,
  ApartmentType,
  Announcement,
  Feedback,
  Contract,
  Invoice,
  InvoiceDetail,
  ServiceRegistration,
  ServiceType,
  Token,
};
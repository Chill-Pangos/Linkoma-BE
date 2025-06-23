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
const PushToken = require('./pushToken.model');

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

// User - Apartment (One-to-Many) - User can be assigned to apartment
User.belongsTo(Apartment, {
  foreignKey: 'apartmentId',
  as: 'apartment'
});

Apartment.hasMany(User, {
  foreignKey: 'apartmentId',
  as: 'residents'
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

// Apartment - Invoice (One-to-Many)
Apartment.hasMany(Invoice, {
  foreignKey: 'apartmentId',
  as: 'invoices'
});

Invoice.belongsTo(Apartment, {
  foreignKey: 'apartmentId',
  as: 'apartment'
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

// Apartment - ServiceRegistration (One-to-Many)
Apartment.hasMany(ServiceRegistration, {
  foreignKey: 'apartmentId',
  as: 'serviceRegistrations'
});

ServiceRegistration.belongsTo(Apartment, {
  foreignKey: 'apartmentId',
  as: 'apartment'
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

// User - PushToken (One-to-Many)
User.hasMany(PushToken, {
  foreignKey: 'userId',
  as: 'pushTokens'
});

PushToken.belongsTo(User, {
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
  PushToken
};
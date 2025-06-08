const fs = require('fs');
const path = require('path');

// Mapping giữa service và model
const serviceModelMapping = {
  'announcement.service.js': 'announcement.model.js',
  'apartment.service.js': 'apartment.model.js', 
  'apartmentType.service.js': 'apartmentType.model.js',
  'contract.service.js': 'contract.model.js',
  'feedback.service.js': 'feedback.model.js',
  'invoice.service.js': 'invoice.model.js',
  'invoiceDetail.service.js': 'invoiceDetail.model.js',
  'permission.service.js': 'permissions.model.js',
  'serviceRegistration.service.js': 'serviceRegistration.model.js',
  'serviceType.service.js': 'serviceType.model.js'
};

// Mapping tên model
const modelNameMapping = {
  'announcement.model.js': 'Announcement',
  'apartment.model.js': 'Apartment',
  'apartmentType.model.js': 'ApartmentType', 
  'contract.model.js': 'Contract',
  'feedback.model.js': 'Feedback',
  'invoice.model.js': 'Invoice',
  'invoiceDetail.model.js': 'InvoiceDetail',
  'permissions.model.js': 'Permission',
  'serviceRegistration.model.js': 'ServiceRegistration',
  'serviceType.model.js': 'ServiceType'
};

console.log('Danh sách các file service cần chuyển đổi:');
Object.keys(serviceModelMapping).forEach(service => {
  console.log(`- ${service} -> ${serviceModelMapping[service]} (Model: ${modelNameMapping[serviceModelMapping[service]]})`);
});

console.log('\nCác bước chuyển đổi:');
console.log('1. Thay thế import database bằng model import');
console.log('2. Chuyển đổi raw SQL queries thành Sequelize ORM methods');
console.log('3. Loại bỏ connection management');
console.log('4. Cập nhật error handling');

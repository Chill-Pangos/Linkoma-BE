module.exports = {
  insertableFields: [
    "invoiceId",
    "serviceTypeId",
    "usage",
    "totalAmount",
  ],
  updatableFields: ["usage", "totalAmount"],
  searchableFields: ["invoiceDetailId", "invoiceId", "serviceTypeId", "usage", "totalAmount", "createdAt", "updatedAt"],
};

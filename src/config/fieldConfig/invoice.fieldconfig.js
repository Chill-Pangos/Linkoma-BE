module.exports = {
  insertableFields: [
    "apartmentId",
    "rentFee",
    "serviceFee",
    "dueDate",
    "status",
  ],
  updatableFields: ["rentFee", "serviceFee", "status"],
  searchableFields: ["invoiceId", "apartmentId", "dueDate", "status", "createdAt", "updatedAt"],
};

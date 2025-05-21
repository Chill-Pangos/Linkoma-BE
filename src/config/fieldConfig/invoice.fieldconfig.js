module.exports = {
  insertableFields: [
    "apartmentID",
    "rentFee",
    "serviceFee",
    "dueDate",
    "status",
  ],
  updatableFields: ["rentFee", "serviceFee", "status"],
  searchableFields: ["invoiceID", "apartmentID", "dueDate", "status"],
};

module.exports = {
  insertableFields: [
    "invoiceID",
    "serviceTypeID",
    "usage",
    "totalAmount",
    "invoiceDate",
  ],
  updatableFields: ["usage", "totalAmount"],
  searchableFields: ["invoiceDetailID", "invoiceID", "serviceTypeID"],
};

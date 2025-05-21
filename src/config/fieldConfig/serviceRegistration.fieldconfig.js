module.exports = {
  insertableFields: [
    "apartmentID",
    "serviceTypeID",
    "startDate",
    "endDate",
    "status",
    "note",
  ],
  updatableFields: ["status", "endDate", "note"],
  searchableFields: ["serviceRegistrationID", "apartmentID", "serviceTypeID"],
};

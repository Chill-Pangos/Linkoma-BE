module.exports = {
  insertableFields: [
    "apartmentId",
    "serviceTypeId",
    "startDate",
    "endDate",
    "status",
    "note",
  ],
  updatableFields: ["status", "endDate", "note"],
  searchableFields: ["serviceRegistrationId", "apartmentId", "serviceTypeId", "startDate", "endDate", "status", "createdAt", "updatedAt"],
};

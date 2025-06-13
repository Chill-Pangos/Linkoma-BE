module.exports = {
  insertableFields: ["userId", "category", "description", "status"],
  updatableFields: ["status", "response", "responseDate", "category", "description"],
  searchableFields: ["feedbackId", "userId", "category", "status", "description", "responseDate", "createdAt", "updatedAt"],
};

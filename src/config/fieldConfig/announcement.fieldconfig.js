module.exports = {
  insertableFields: [
    "type",
    "priority", 
    "title",
    "content",
    "author",
  ],
  updatableFields: [
    "type",
    "priority", 
    "title", 
    "content"
  ],
  searchableFields: [
    "announcementId", 
    "type", 
    "priority", 
    "title",
    "author",
    "createdAt",
    "updatedAt"
  ],
};

module.exports = {
  insertableFields: [
    "type",
    "priority",
    "title",
    "content",
    "postedDate",
    "author",
  ],
  updatableFields: ["priority", "title", "content"],
  searchableFields: ["announcementID", "type", "priority", "postedDate"],
};

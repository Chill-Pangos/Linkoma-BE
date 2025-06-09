const httpStatus = require('http-status');
const pick = require('../utils/pick');
const apiError = require('../utils/apiError');
const catchAsync = require('../utils/catchAsync');
const { announcementService } = require('../services');

const createAnnouncement = catchAsync(async (req, res) => {
  const result = await announcementService.createAnnouncement(req.body);
  res.status(httpStatus.CREATED).send(result);
});

const getAnnouncements = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['type', 'priority', 'author']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  
  const limit = parseInt(options.limit) || 10;
  const page = parseInt(options.page) || 1;
  const offset = (page - 1) * limit;
  
  const result = await announcementService.getAnnouncements(limit, offset, filter, options.sortBy);
  
  const totalPages = Math.ceil(result.totalResults / limit);
  
  res.send({
    results: result.results,
    page,
    limit,
    totalPages,
    totalResults: result.totalResults,
  });
});

const getAnnouncement = catchAsync(async (req, res) => {
  const announcement = await announcementService.getAnnouncementById(req.params.announcementId);
  res.send(announcement);
});

const updateAnnouncement = catchAsync(async (req, res) => {
  const result = await announcementService.updateAnnouncement(req.params.announcementId, req.body);
  res.send(result);
});

const deleteAnnouncement = catchAsync(async (req, res) => {
  await announcementService.deleteAnnouncement(req.params.announcementId);
  res.status(httpStatus.NO_CONTENT).send();
});

const getUserAnnouncements = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['type', 'priority']);
  filter.author = req.params.userId;
  
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  
  const limit = parseInt(options.limit) || 10;
  const page = parseInt(options.page) || 1;
  const offset = (page - 1) * limit;
  
  const result = await announcementService.getAnnouncements(limit, offset, filter, options.sortBy);
  
  const totalPages = Math.ceil(result.totalResults / limit);
  
  res.send({
    results: result.results,
    page,
    limit,
    totalPages,
    totalResults: result.totalResults,
  });
});

module.exports = {
  createAnnouncement,
  getAnnouncements,
  getAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getUserAnnouncements,
};
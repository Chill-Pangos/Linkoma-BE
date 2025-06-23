const catchAsync = require('../utils/catchAsync');
const { pushTokenService } = require('../services');
const httpStatus = require('http-status');

/**
 * Save push token for user
 */
const savePushToken = catchAsync(async (req, res) => {
  const { pushToken, platform } = req.body;
  const userId = req.user.userId;

  const result = await pushTokenService.savePushToken(userId, pushToken, platform);
  
  res.status(httpStatus.OK).json({
    status: 'success',
    message: result.message
  });
});

/**
 * Send notification to users
 */
const sendNotification = catchAsync(async (req, res) => {
  const { userIds, title, body, data } = req.body;

  const result = await pushTokenService.sendNotificationToUsers(userIds, title, body, data);
  
  res.status(httpStatus.OK).json({
    status: 'success',
    message: result.message,
    data: result
  });
});

/**
 * Remove push token
 */
const removePushToken = catchAsync(async (req, res) => {
  const { pushToken } = req.body;
  const userId = req.user.userId;

  const result = await pushTokenService.removePushToken(userId, pushToken);
  
  res.status(httpStatus.OK).json({
    status: 'success',
    message: result.message
  });
});

/**
 * Remove all push tokens for user
 */
const removeAllTokens = catchAsync(async (req, res) => {
  const userId = req.user.userId;

  const result = await pushTokenService.removeAllUserTokens(userId);
  
  res.status(httpStatus.OK).json({
    status: 'success',
    message: result.message
  });
});

module.exports = {
  savePushToken,
  sendNotification,
  removePushToken,
  removeAllTokens
};

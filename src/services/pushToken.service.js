const { Op } = require('sequelize');
const { PushToken } = require('../models');
const { Expo } = require('expo-server-sdk');
const apiError = require('../utils/apiError');

// Create a new Expo SDK client
const expo = new Expo();

/**
 * Save or update push token for a user
 * @param {number} userId - User ID
 * @param {string} pushToken - Expo push token
 * @param {string} platform - Platform (ios/android)
 * @returns {Object} - Success message
 */
const savePushToken = async (userId, pushToken, platform = null) => {
  try {
    if (!userId || !pushToken) {
      throw new apiError(400, 'User ID and push token are required');
    }

    // Validate if it's a valid Expo push token
    if (!Expo.isExpoPushToken(pushToken)) {
      throw new apiError(400, 'Invalid Expo push token format');
    }

    // Check if token already exists for this user
    const existingToken = await PushToken.findOne({
      where: { userId, pushToken }
    });

    if (existingToken) {
      // Update existing token
      await existingToken.update({
        isActive: true,
        platform: platform || existingToken.platform,
        updatedAt: new Date()
      });
      return { message: 'Push token updated successfully' };
    }

    // Deactivate old tokens for this user
    await PushToken.update(
      { isActive: false },
      { where: { userId } }
    );

    // Create new token
    await PushToken.create({
      userId,
      pushToken,
      platform,
      isActive: true
    });

    return { message: 'Push token saved successfully' };
  } catch (error) {
    throw new apiError(500, error.message);
  }
};

/**
 * Get active push tokens for a user
 * @param {number} userId - User ID
 * @returns {Array} - Array of push tokens
 */
const getUserPushTokens = async (userId) => {
  try {
    const tokens = await PushToken.findAll({
      where: {
        userId,
        isActive: true
      },
      attributes: ['pushToken', 'platform']
    });

    return tokens.map(token => token.pushToken);
  } catch (error) {
    throw new apiError(500, error.message);
  }
};

/**
 * Send push notification to specific users
 * @param {Array} userIds - Array of user IDs
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {Object} data - Additional data
 * @returns {Object} - Send result
 */
const sendNotificationToUsers = async (userIds, title, body, data = {}) => {
  try {
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      throw new apiError(400, 'User IDs array is required');
    }

    if (!title || !body) {
      throw new apiError(400, 'Title and body are required');
    }

    // Get all active push tokens for the users
    const tokens = await PushToken.findAll({
      where: {
        userId: { [Op.in]: userIds },
        isActive: true
      },
      attributes: ['pushToken']
    });

    if (tokens.length === 0) {
      return { message: 'No active push tokens found for specified users' };
    }

    const pushTokens = tokens.map(token => token.pushToken);
    return await sendPushNotifications(pushTokens, title, body, data);
  } catch (error) {
    throw new apiError(500, error.message);
  }
};

/**
 * Send push notification to specific push tokens
 * @param {Array} pushTokens - Array of push tokens
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {Object} data - Additional data
 * @returns {Object} - Send result
 */
const sendPushNotifications = async (pushTokens, title, body, data = {}) => {
  try {
    if (!pushTokens || !Array.isArray(pushTokens) || pushTokens.length === 0) {
      throw new apiError(400, 'Push tokens array is required');
    }

    // Create the messages
    const messages = [];
    for (const pushToken of pushTokens) {
      // Check if token is valid
      if (!Expo.isExpoPushToken(pushToken)) {
        console.warn(`Push token ${pushToken} is not a valid Expo push token`);
        continue;
      }

      messages.push({
        to: pushToken,
        sound: 'default',
        title: title,
        body: body,
        data: data,
      });
    }

    if (messages.length === 0) {
      return { message: 'No valid push tokens to send notifications' };
    }

    // Send notifications in chunks
    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error('Error sending push notification chunk:', error);
      }
    }

    // Handle the tickets to check for errors
    const receiptIds = [];
    for (const ticket of tickets) {
      if (ticket.id) {
        receiptIds.push(ticket.id);
      } else {
        console.error('Push notification ticket error:', ticket);
      }
    }

    return {
      message: 'Push notifications sent successfully',
      totalSent: messages.length,
      ticketIds: receiptIds
    };
  } catch (error) {
    throw new apiError(500, error.message);
  }
};

/**
 * Remove push token for a user
 * @param {number} userId - User ID
 * @param {string} pushToken - Push token to remove
 * @returns {Object} - Success message
 */
const removePushToken = async (userId, pushToken) => {
  try {
    const result = await PushToken.update(
      { isActive: false },
      {
        where: {
          userId,
          pushToken,
          isActive: true
        }
      }
    );

    if (result[0] === 0) {
      throw new apiError(404, 'Push token not found');
    }

    return { message: 'Push token removed successfully' };
  } catch (error) {
    throw new apiError(500, error.message);
  }
};

/**
 * Remove all push tokens for a user
 * @param {number} userId - User ID
 * @returns {Object} - Success message
 */
const removeAllUserTokens = async (userId) => {
  try {
    await PushToken.update(
      { isActive: false },
      { where: { userId } }
    );

    return { message: 'All push tokens removed successfully' };
  } catch (error) {
    throw new apiError(500, error.message);
  }
};

module.exports = {
  savePushToken,
  getUserPushTokens,
  sendNotificationToUsers,
  sendPushNotifications,
  removePushToken,
  removeAllUserTokens
};

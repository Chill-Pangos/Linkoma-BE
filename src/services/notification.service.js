const { pushTokenService } = require('../services');

/**
 * Send notification to all apartment residents
 * @param {number} apartmentId - Apartment ID
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {Object} data - Additional data
 */
const sendToApartmentResidents = async (apartmentId, title, body, data = {}) => {
  try {
    // This would need to be implemented based on your apartment-user relationship
    // For now, this is a placeholder
    const userIds = []; // Get user IDs from apartment
    
    if (userIds.length > 0) {
      return await pushTokenService.sendNotificationToUsers(userIds, title, body, {
        ...data,
        type: 'apartment_notification',
        apartmentId
      });
    }
    
    return { message: 'No residents found in apartment' };
  } catch (error) {
    throw error;
  }
};

/**
 * Send notification for new announcement
 * @param {string} title - Announcement title
 * @param {string} body - Announcement body
 * @param {number} announcementId - Announcement ID
 */
const sendAnnouncementNotification = async (title, body, announcementId) => {
  try {
    // Send to all active users - you might want to filter this
    const allUserIds = []; // Get all user IDs who should receive announcements
    
    return await pushTokenService.sendNotificationToUsers(allUserIds, title, body, {
      type: 'announcement',
      announcementId,
      action: 'view_announcement'
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Send notification for invoice
 * @param {number} userId - User ID
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {number} invoiceId - Invoice ID
 */
const sendInvoiceNotification = async (userId, title, body, invoiceId) => {
  try {
    return await pushTokenService.sendNotificationToUsers([userId], title, body, {
      type: 'invoice',
      invoiceId,
      action: 'view_invoice'
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Send notification for service registration status
 * @param {number} userId - User ID
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {number} serviceRegistrationId - Service registration ID
 * @param {string} status - Status (approved, rejected, etc.)
 */
const sendServiceStatusNotification = async (userId, title, body, serviceRegistrationId, status) => {
  try {
    return await pushTokenService.sendNotificationToUsers([userId], title, body, {
      type: 'service_status',
      serviceRegistrationId,
      status,
      action: 'view_service'
    });
  } catch (error) {
    throw error;
  }
};

module.exports = {
  sendToApartmentResidents,
  sendAnnouncementNotification,
  sendInvoiceNotification,
  sendServiceStatusNotification
};

const Notification = require('../models/Notification');
const Booking = require('../models/Booking');
const User = require('../models/User');
const { logActivity } = require('../helpers/activityLogger');

class NotificationController {
  static async getNotifications(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 50 } = req.query;
      const result = await Notification.getByUserId(userId, parseInt(page), parseInt(limit));

      res.json({
        success: true,
        data: result.notifications,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch notifications',
        message: error.message
      });
    }
  }

  static async getUnreadCount(req, res) {
    try {
      const userId = req.user.id;
      const unreadCount = await Notification.getUnreadCount(userId);

      res.json({
        success: true,
        data: { unread_count: unreadCount }
      });
    } catch (error) {
      console.error('Get unread notification count error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch unread count',
        message: error.message
      });
    }
  }

  static async markAsRead(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const notification = await Notification.markAsRead(id, userId);

      if (!notification) {
        return res.status(404).json({
          success: false,
          error: 'Notification not found'
        });
      }

      res.json({
        success: true,
        data: notification,
        message: 'Notification marked as read'
      });
    } catch (error) {
      console.error('Mark notification as read error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to mark notification as read',
        message: error.message
      });
    }
  }

  static async adminSendNotification(req, res) {
    try {
      const { user_id, booking_id = null, title, message, type = 'admin_message' } = req.body;
      console.log('=== ADMIN SEND NOTIFICATION ===', { user_id, booking_id, title, message, type });

      if (!user_id || !title || !message) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields',
          message: 'user_id, title, and message are required'
        });
      }

      const userId = parseInt(user_id, 10);
      if (Number.isNaN(userId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid user_id',
          message: 'user_id must be a valid number'
        });
      }

      const user = await User.getById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      let adminName = null;
      try {
        const adminUser = await User.getById(req.user.id);
        adminName = adminUser ? adminUser.name : (req.user.name || null);
      } catch (e) {
        adminName = req.user.name || null;
      }

      const notificationPayload = {
        user_id: userId,
        booking_id: booking_id ? parseInt(booking_id, 10) : null,
        title,
        message,
        type,
        created_by: 'ADMIN',
        admin_id: req.user.id,
        admin_name: adminName
      };

      console.log('=== NOTIFICATION PAYLOAD ===', notificationPayload);
      const notification = await Notification.create(notificationPayload);
      console.log('=== NOTIFICATION CREATED ===', notification);

      // Log activity
      try {
        await logActivity(
          req.user.id,
          req.user.name,
          'SEND_MESSAGE',
          'CUSTOMER',
          userId,
          `Sent message to user ${userId}: "${title}"`
        );
      } catch (logError) {
        console.error('Activity log error:', logError);
      }

      res.json({
        success: true,
        data: notification,
        message: 'Notification sent successfully'
      });
    } catch (error) {
      console.error('Admin send notification error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to send notification',
        message: error.message
      });
    }
  }
}

module.exports = NotificationController;

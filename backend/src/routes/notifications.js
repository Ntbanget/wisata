const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/NotificationController');
const { authenticate, authenticateAdmin } = require('../middleware/auth');
const { adminOnly } = require('../middleware/role');

router.get('/', authenticate, NotificationController.getNotifications);
router.get('/unread-count', authenticate, NotificationController.getUnreadCount);
router.put('/:id/read', authenticate, NotificationController.markAsRead);
router.post('/admin-send', authenticateAdmin, adminOnly, NotificationController.adminSendNotification);

module.exports = router;

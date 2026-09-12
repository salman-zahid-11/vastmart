const express = require('express');
const router = express.Router();
const {
  getMyNotifications,
  markNotificationRead,
  createNotification,
} = require('../controllers/notificationController');
const { protect, requireSuperAdmin } = require('../middleware/authMiddleware');

router.get('/mine', protect, getMyNotifications);
router.put('/:id/read', protect, markNotificationRead);
router.post('/', protect, requireSuperAdmin, createNotification);

module.exports = router;

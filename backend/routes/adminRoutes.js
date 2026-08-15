const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  updateUserStatus,
  getAllOrdersAdmin,
  getActivityLog,
} = require('../controllers/adminController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/stats', protect, authorizeRoles('admin'), getDashboardStats);
router.get('/users', protect, authorizeRoles('admin'), getAllUsers);
router.put('/users/:id/status', protect, authorizeRoles('admin'), updateUserStatus);
router.get('/orders', protect, authorizeRoles('admin'), getAllOrdersAdmin);
router.get('/activity', protect, authorizeRoles('admin'), getActivityLog);

module.exports = router;
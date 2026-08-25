const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  updateUserStatus,
  getAllOrdersAdmin,
  getActivityLog,
  updateAdminLevel,
} = require('../controllers/adminController');
const { protect, authorizeRoles, requireSuperAdmin } = require('../middleware/authMiddleware');

router.get('/stats', protect, authorizeRoles('admin'), getDashboardStats);
router.get('/users', protect, authorizeRoles('admin'), getAllUsers);
router.put('/users/:id/status', protect, authorizeRoles('admin'), requireSuperAdmin, updateUserStatus);
router.get('/orders', protect, authorizeRoles('admin'), getAllOrdersAdmin);
router.get('/activity', protect, authorizeRoles('admin'), getActivityLog);
router.put('/users/:id/admin-level', protect, authorizeRoles('admin'), requireSuperAdmin, updateAdminLevel);

module.exports = router;
const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  updateUserStatus,
  getAllOrdersAdmin,
  getActivityLog,
  updateAdminLevel,
  getSalesAnalytics,
  getTopProducts,
  getTopSellers,
  getOrderStatusBreakdown,
} = require('../controllers/adminController');

router.get('/analytics/sales', protect, authorizeRoles('admin'), getSalesAnalytics);
router.get('/analytics/top-products', protect, authorizeRoles('admin'), getTopProducts);
router.get('/analytics/top-sellers', protect, authorizeRoles('admin'), getTopSellers);
router.get('/analytics/order-status', protect, authorizeRoles('admin'), getOrderStatusBreakdown);
const { protect, authorizeRoles, requireSuperAdmin } = require('../middleware/authMiddleware');

router.get('/stats', protect, authorizeRoles('admin'), getDashboardStats);
router.get('/users', protect, authorizeRoles('admin'), getAllUsers);
router.put('/users/:id/status', protect, authorizeRoles('admin'), requireSuperAdmin, updateUserStatus);
router.get('/orders', protect, authorizeRoles('admin'), getAllOrdersAdmin);
router.get('/activity', protect, authorizeRoles('admin'), getActivityLog);
router.put('/users/:id/admin-level', protect, authorizeRoles('admin'), requireSuperAdmin, updateAdminLevel);
router.get('/analytics/sales', protect, authorizeRoles('admin'), getSalesAnalytics);
router.get('/analytics/top-products', protect, authorizeRoles('admin'), getTopProducts);
router.get('/analytics/top-sellers', protect, authorizeRoles('admin'), getTopSellers);
router.get('/analytics/order-status', protect, authorizeRoles('admin'), getOrderStatusBreakdown);

module.exports = router;
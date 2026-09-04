const express = require('express');

const router = express.Router();

// Middleware
const {
    protect,
    authorizeRoles,
    requireSuperAdmin
} = require('../middleware/authMiddleware');

// Controllers
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
    getOrderStatusBreakdown
} = require('../controllers/adminController');

// ==================== Dashboard ====================

router.get(
    '/stats',
    protect,
    authorizeRoles('admin'),
    getDashboardStats
);

// ==================== Users ====================

router.get(
    '/users',
    protect,
    authorizeRoles('admin'),
    getAllUsers
);

router.put(
    '/users/:id/status',
    protect,
    authorizeRoles('admin'),
    requireSuperAdmin,
    updateUserStatus
);

router.put(
    '/users/:id/admin-level',
    protect,
    authorizeRoles('admin'),
    requireSuperAdmin,
    updateAdminLevel
);

// ==================== Orders ====================

router.get(
    '/orders',
    protect,
    authorizeRoles('admin'),
    getAllOrdersAdmin
);

// ==================== Activity ====================

router.get(
    '/activity',
    protect,
    authorizeRoles('admin'),
    getActivityLog
);

// ==================== Analytics ====================

router.get(
    '/analytics/sales',
    protect,
    authorizeRoles('admin'),
    getSalesAnalytics
);

router.get(
    '/analytics/top-products',
    protect,
    authorizeRoles('admin'),
    getTopProducts
);

router.get(
    '/analytics/top-sellers',
    protect,
    authorizeRoles('admin'),
    getTopSellers
);

router.get(
    '/analytics/order-status',
    protect,
    authorizeRoles('admin'),
    getOrderStatusBreakdown
);

module.exports = router;
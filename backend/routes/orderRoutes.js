const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getMySales,
  getAllOrdersAdmin,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.post('/', protect, createOrder);
router.get('/myorders', protect, getMyOrders);
router.get('/seller/my-sales', protect, authorizeRoles('seller', 'admin'), getMySales);
router.get('/admin/all', protect, authorizeRoles('admin'), getAllOrdersAdmin);
router.put('/:id/status', protect, authorizeRoles('admin'), updateOrderStatus);
router.get('/:id', protect, getOrderById);

module.exports = router;
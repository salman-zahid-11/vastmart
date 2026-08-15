const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getOrderById, getMySales } = require('../controllers/orderController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.post('/', protect, createOrder);
router.get('/myorders', protect, getMyOrders);
router.get('/seller/my-sales', protect, authorizeRoles('seller', 'admin'), getMySales);
router.get('/:id', protect, getOrderById);

module.exports = router;
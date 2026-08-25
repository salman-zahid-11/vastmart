const express = require('express');
const router = express.Router();
const {
  validateCoupon,
  getAllCoupons,
  createCoupon,
  toggleCoupon,
  deleteCoupon,
} = require('../controllers/couponController');
const { protect, authorizeRoles, requireSuperAdmin } = require('../middleware/authMiddleware');

router.post('/validate', protect, validateCoupon);
router.get('/', protect, authorizeRoles('admin'), getAllCoupons);
router.post('/', protect, authorizeRoles('admin'), requireSuperAdmin, createCoupon);
router.put('/:id/toggle', protect, authorizeRoles('admin'), requireSuperAdmin, toggleCoupon);
router.delete('/:id', protect, authorizeRoles('admin'), requireSuperAdmin, deleteCoupon);

module.exports = router;
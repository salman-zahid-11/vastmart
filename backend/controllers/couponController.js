const validateCouponLogic = require('../utils/validateCouponLogic');
const Coupon = require('../models/Coupon');
const Order = require('../models/Order');


// @desc   Validate a coupon code against the current cart total
// @route  POST /api/coupons/validate
const validateCoupon = async (req, res) => {
  try {
    const { code, orderTotal } = req.body;

    if (!code || orderTotal === undefined) {
      return res.status(400).json({ message: 'Code and order total are required' });
    }

    const result = await validateCouponLogic(code, orderTotal, req.user._id);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc   Get all coupons (admin)
// @route  GET /api/coupons
const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    res.status(200).json(coupons);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc   Create a new coupon
// @route  POST /api/coupons
const createCoupon = async (req, res) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      minOrderValue,
      maxDiscountAmount,
      usageLimit,
      perUserLimit,
      expiresAt,
    } = req.body;

    if (!code || !discountType || discountValue === undefined) {
      return res.status(400).json({ message: 'Code, discount type, and value are required' });
    }

    const existing = await Coupon.findOne({ code: code.toUpperCase().trim() });
    if (existing) {
      return res.status(400).json({ message: 'A coupon with this code already exists' });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase().trim(),
      discountType,
      discountValue,
      minOrderValue: minOrderValue || 0,
      maxDiscountAmount: maxDiscountAmount || undefined,
      usageLimit: usageLimit || null,
      perUserLimit: perUserLimit || 1,
      expiresAt: expiresAt || undefined,
      createdBy: req.user._id,
    });

    res.status(201).json(coupon);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc   Toggle coupon active/inactive
// @route  PUT /api/coupons/:id/toggle
const toggleCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    coupon.isActive = !coupon.isActive;
    await coupon.save();

    res.status(200).json(coupon);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc   Delete a coupon
// @route  DELETE /api/coupons/:id
const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    await coupon.deleteOne();
    res.status(200).json({ message: 'Coupon deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { validateCoupon, getAllCoupons, createCoupon, toggleCoupon, deleteCoupon };
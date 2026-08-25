const Coupon = require('../models/Coupon');
const Order = require('../models/Order');

/**
 * Validates a coupon code against an order total and user, and returns the
 * calculated discount. Throws an Error with a user-facing message on failure.
 * Used by both the /validate endpoint and createOrder, so the discount is
 * ALWAYS recalculated server-side — never trusted from the frontend.
 */
async function validateCouponLogic(code, orderTotal, userId) {
  if (!code) return null;

  const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });

  if (!coupon) {
    throw new Error('Invalid coupon code');
  }

  if (!coupon.isActive) {
    throw new Error('This coupon is no longer active');
  }

  if (coupon.expiresAt && new Date() > coupon.expiresAt) {
    throw new Error('This coupon has expired');
  }

  if (orderTotal < coupon.minOrderValue) {
    throw new Error(`Minimum order value of ৳${coupon.minOrderValue} required for this coupon`);
  }

  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    throw new Error('This coupon has reached its usage limit');
  }

  const userUsageCount = await Order.countDocuments({
    user: userId,
    couponCode: coupon.code,
  });

  if (userUsageCount >= coupon.perUserLimit) {
    throw new Error('You have already used this coupon');
  }

  let discountAmount = 0;
  if (coupon.discountType === 'percentage') {
    discountAmount = (orderTotal * coupon.discountValue) / 100;
    if (coupon.maxDiscountAmount) {
      discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
    }
  } else {
    discountAmount = coupon.discountValue;
  }

  discountAmount = Math.min(discountAmount, orderTotal);

  return {
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    discountAmount: Math.round(discountAmount),
  };
}

module.exports = validateCouponLogic;
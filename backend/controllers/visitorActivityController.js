const VisitorActivity = require('../models/VisitorActivity');
const Order = require('../models/Order');

// @desc   Log a view or add-to-cart event
// @route  POST /api/activity/track
const trackActivity = async (req, res) => {
  try {
    const { productId, action } = req.body;

    if (!productId || !['viewed', 'added_to_cart'].includes(action)) {
      return res.status(400).json({ message: 'Invalid tracking data' });
    }

    const ipAddress = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;

    await VisitorActivity.create({
      user: req.user?._id || null, // works whether logged in or not — see route setup below
      ipAddress,
      product: productId,
      action,
    });

    res.status(201).json({ message: 'Tracked' });
  } catch (error) {
    // Tracking should never break the actual page — fail silently
    res.status(200).json({ message: 'ok' });
  }
};

// @desc   Get abandoned activity (viewed/added but never ordered) — admin sees all, seller sees own products
// @route  GET /api/activity/abandoned
const getAbandonedActivity = async (req, res) => {
  try {
    const filter = { converted: false, user: { $ne: null } }; // only logged-in users are actionable

    let activities = await VisitorActivity.find(filter)
      .populate('user', 'name email phone')
      .populate('product', 'name price seller images')
      .sort({ createdAt: -1 })
      .limit(300);

    // Sellers only see activity on their own products
    if (req.user.role === 'seller') {
      activities = activities.filter(
        (a) => a.product?.seller?.toString() === req.user._id.toString()
      );
    }

    res.status(200).json(activities);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { trackActivity, getAbandonedActivity };
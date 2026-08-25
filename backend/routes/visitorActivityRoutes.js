const express = require('express');
const router = express.Router();
const { trackActivity, getAbandonedActivity } = require('../controllers/visitorActivityController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Tracking works for both logged-in and anonymous visitors.
// We use a lightweight "soft auth" — try to attach a user if a valid token
// is present, but never block the request if there isn't one.
const softAuth = async (req, res, next) => {
  if (req.headers.authorization?.startsWith('Bearer')) {
    try {
      const jwt = require('jsonwebtoken');
      const User = require('../models/User');
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (e) {
      // invalid/expired token — proceed as anonymous, don't block tracking
    }
  }
  next();
};

router.post('/track', softAuth, trackActivity);
router.get('/abandoned', protect, authorizeRoles('seller', 'admin'), getAbandonedActivity);

module.exports = router;
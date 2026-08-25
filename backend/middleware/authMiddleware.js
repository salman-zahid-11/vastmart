const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // Token usually arrives as: "Bearer eyJhbGciOi..."
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 1. Extract token (remove "Bearer ")
      token = req.headers.authorization.split(' ')[1];

      // 2. Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Attach user (without password) to request object
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }

      // 4. Continue to the actual route
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, invalid token' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

// Bonus: role-based restriction (e.g. only admins allowed)
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Role '${req.user.role}' is not allowed to access this resource` });
    }
    next();
  };
};

// Restricts to super_admin only, among admins. Regular admins (moderators) are blocked.
const requireSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'admin' || req.user.adminLevel !== 'super_admin') {
    return res.status(403).json({ message: 'This action requires super admin access' });
  }
  next();
};

module.exports = { protect, authorizeRoles, requireSuperAdmin };
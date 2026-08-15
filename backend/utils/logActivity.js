const ActivityLog = require('../models/ActivityLog');

const logActivity = async ({ user, action, description, meta = {} }) => {
  try {
    await ActivityLog.create({
      user: user?._id,
      userName: user?.name || 'Unknown',
      userEmail: user?.email || 'unknown',
      action,
      description,
      meta,
    });
  } catch (error) {
    // Logging should never break the actual feature it's attached to
    console.error('Failed to log activity:', error.message);
  }
};

module.exports = logActivity;
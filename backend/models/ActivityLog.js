const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    userName: String, // snapshot — in case the user is later deleted
    userEmail: String,
    action: {
      type: String,
      enum: [
        'user_registered',
        'user_login',
        'product_created',
        'product_approved',
        'product_rejected',
        'order_placed',
      ],
      required: true,
    },
    description: String, // human-readable summary, e.g. "Placed order #ABC123"
    meta: mongoose.Schema.Types.Mixed, // flexible extra data (order ID, product ID, etc.)
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ActivityLog', activityLogSchema);
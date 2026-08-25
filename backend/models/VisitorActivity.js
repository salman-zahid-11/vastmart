const mongoose = require('mongoose');

const visitorActivitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null = anonymous visitor
    },
    ipAddress: {
      type: String,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    action: {
      type: String,
      enum: ['viewed', 'added_to_cart'],
      required: true,
    },
    converted: {
      type: Boolean,
      default: false, // set true if this user later ordered this product
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('VisitorActivity', visitorActivitySchema);
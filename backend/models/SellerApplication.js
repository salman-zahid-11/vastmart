const mongoose = require('mongoose');

const sellerApplicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // one application per user at a time
    },
    businessName: {
      type: String,
      required: true,
    },
    businessType: {
      type: String,
      enum: ['individual', 'proprietorship', 'partnership', 'company'],
      default: 'individual',
    },
    businessAddress: {
      type: String,
      required: true,
    },
    nidNumber: {
      type: String,
      required: true,
    },
    nidDocument: {
      type: String, // file path
      required: true,
    },
    tradeLicenseNumber: {
      type: String, // optional for individuals
    },
    tradeLicenseDocument: {
      type: String, // file path, optional
    },
    additionalNotes: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    rejectionReason: {
      type: String,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SellerApplication', sellerApplicationSchema);
const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: true,
    },
    eyebrow: String,
    title: String,
    subtitle: String,
    ctaLabel: String,
    ctaLink: String,
    fullImage: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Banner', bannerSchema);
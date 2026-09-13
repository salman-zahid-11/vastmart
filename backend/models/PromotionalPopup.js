const mongoose = require('mongoose');

const promotionalPopupSchema = new mongoose.Schema(
  {
    image: { type: String, required: true },
    title: { type: String, trim: true, maxlength: 120 },
    link: { type: String, trim: true },
    duration: { type: Number, default: 5, min: 1, max: 30 },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PromotionalPopup', promotionalPopupSchema);

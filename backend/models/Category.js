const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    subCategories: [
      {
        type: String,
        trim: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    image: {
      type: String,
      default: '',
    },
    imageFit: {
      type: String,
      enum: ['cover', 'contain'],
      default: 'cover',
    },
    imagePositionX: {
      type: Number,
      min: 0,
      max: 100,
      default: 50,
    },
    imagePositionY: {
      type: Number,
      min: 0,
      max: 100,
      default: 50,
    },
    displayOrder: {
      type: Number,
      default: 0,
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

module.exports = mongoose.model('Category', categorySchema);
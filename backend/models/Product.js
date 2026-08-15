const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    discountPrice: {
      type: Number, // optional, for flash sales / deals
      default: null,
    },
    category: {
      type: String,
      required: true,
    },
    subCategory: {
      type: String,
    },
    brand: {
      type: String,
    },
    images: [
      {
        type: String, // URLs to product images
      },
    ],
    stock: {
      type: Number,
      required: true,
      default: 0,
    },
    productType: {
      type: String,
      enum: ['physical', 'digital'],
      default: 'physical',
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // links to the User who created it (role: seller)
      required: true,
    },
    ratingsAverage: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    isApproved: {
      type: Boolean,
      default: false, // admin must approve before it's publicly visible
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    tags: [String], // helps with search & AI recommendations later
  },
  {
    timestamps: true,
  }
);

// Auto-generate a URL-friendly slug from the name before saving
productSchema.pre('save', function () {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Date.now();
  }
});

module.exports = mongoose.model('Product', productSchema);
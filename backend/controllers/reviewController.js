const Review = require('../models/Review');
const Product = require('../models/Product');

const refreshProductRating = async (productId) => {
  const summary = await Review.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: '$product',
        average: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  const rating = summary[0] || { average: 0, count: 0 };
  await Product.findByIdAndUpdate(productId, {
    ratingsAverage: Number(rating.average.toFixed(1)),
    numReviews: rating.count,
  });
};

const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAllReviewsAdmin = async (req, res) => {
  try {
    const reviews = await Review.find({})
      .populate('product', 'name')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createReview = async (req, res) => {
  try {
    const { product, customerName, customerRole, customerAvatar, comment, rating } = req.body;
    const numericRating = Number(rating);
    if (!product || (req.user.role === 'admin' && !customerName) || !comment || !Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ message: 'Product, customer name, comment, and rating are required' });
    }

    const productExists = await Product.exists({ _id: product });
    if (!productExists) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const review = await Review.create({
      product,
      customerName: req.user.role === 'customer' ? req.user.name : customerName,
      customerRole: req.user.role === 'customer' ? 'Customer' : customerRole,
      customerAvatar: req.user.role === 'customer' ? req.user.avatar : customerAvatar,
      comment,
      rating: numericRating,
      createdBy: req.user._id,
    });
    await refreshProductRating(product);

    const populated = await review.populate([
      { path: 'product', select: 'name' },
      { path: 'createdBy', select: 'name' },
    ]);
    res.status(201).json(populated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    await refreshProductRating(review.product);
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getProductReviews, getAllReviewsAdmin, createReview, deleteReview };

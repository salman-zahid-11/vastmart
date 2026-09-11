const express = require('express');
const {
  getProductReviews,
  getAllReviewsAdmin,
  createReview,
  deleteReview,
} = require('../controllers/reviewController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/product/:productId', getProductReviews);
router.get('/admin/all', protect, authorizeRoles('admin'), getAllReviewsAdmin);
router.post('/', protect, authorizeRoles('admin'), createReview);
router.delete('/:id', protect, authorizeRoles('admin'), deleteReview);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  submitApplication,
  getMyApplication,
  getAllApplications,
  reviewApplication,
} = require('../controllers/sellerApplicationController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/', protect, upload.uploadSellerDocs, submitApplication);
router.get('/my-application', protect, getMyApplication);
router.get('/', protect, authorizeRoles('admin'), getAllApplications);
router.put('/bulk-review', protect, authorizeRoles('admin'), bulkReviewApplications);
router.put('/:id/review', protect, authorizeRoles('admin'), reviewApplication);

module.exports = router;
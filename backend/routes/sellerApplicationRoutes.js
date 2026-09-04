const express = require('express');

const router = express.Router();

const {
    submitApplication,
    getMyApplication,
    getAllApplications,
    reviewApplication,
    bulkReviewApplications
} = require('../controllers/sellerApplicationController');

const {
    protect,
    authorizeRoles
} = require('../middleware/authMiddleware');

const upload = require('../middleware/uploadMiddleware');

// Submit seller application
router.post(
    '/',
    protect,
    upload.uploadSellerDocs,
    submitApplication
);

// Get logged-in user's application
router.get(
    '/my-application',
    protect,
    getMyApplication
);

// Get all applications (admin)
router.get(
    '/',
    protect,
    authorizeRoles('admin'),
    getAllApplications
);

// Bulk approve/reject applications (admin)
router.put(
    '/bulk-review',
    protect,
    authorizeRoles('admin'),
    bulkReviewApplications
);

// Approve/reject single application (admin)
router.put(
    '/:id/review',
    protect,
    authorizeRoles('admin'),
    reviewApplication
);

module.exports = router;
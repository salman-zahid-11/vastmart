const express = require('express');
const router = express.Router();
const {
  getActiveBanners,
  getAllBanners,
  createBanner,
  toggleBanner,
  deleteBanner,
} = require('../controllers/bannerController');
const { protect, authorizeRoles, requireSuperAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', getActiveBanners);
router.get('/admin/all', protect, authorizeRoles('admin'), getAllBanners);
router.post('/', protect, authorizeRoles('admin'), requireSuperAdmin, upload.single('image'), createBanner);
router.put('/:id/toggle', protect, authorizeRoles('admin'), requireSuperAdmin, toggleBanner);
router.delete('/:id', protect, authorizeRoles('admin'), requireSuperAdmin, deleteBanner);


module.exports = router;
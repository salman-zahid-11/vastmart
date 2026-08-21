const express = require('express');
const router = express.Router();
const {
  getActiveNotices,
  getAllNotices,
  createNotice,
  toggleNotice,
  deleteNotice,
} = require('../controllers/noticeController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', getActiveNotices);
router.get('/admin/all', protect, authorizeRoles('admin'), getAllNotices);
router.post('/', protect, authorizeRoles('admin'), createNotice);
router.put('/:id/toggle', protect, authorizeRoles('admin'), toggleNotice);
router.delete('/:id', protect, authorizeRoles('admin'), deleteNotice);

module.exports = router;
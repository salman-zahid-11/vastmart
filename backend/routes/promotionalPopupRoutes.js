const express = require('express');
const router = express.Router();
const controller = require('../controllers/promotionalPopupController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', controller.getActivePopup);
router.get('/admin/all', protect, authorizeRoles('admin'), controller.getAllPopups);
router.post('/', protect, authorizeRoles('admin'), upload.single('image'), controller.createPopup);
router.put('/:id', protect, authorizeRoles('admin'), upload.single('image'), controller.updatePopup);
router.put('/:id/toggle', protect, authorizeRoles('admin'), controller.togglePopup);
router.delete('/:id', protect, authorizeRoles('admin'), controller.deletePopup);

module.exports = router;

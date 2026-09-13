const express = require('express');
const router = express.Router();
const {
  getActiveCategories,
  getAllCategories,
  createCategory,
  updateCategory,
  addSubCategory,
  removeSubCategory,
  toggleCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', getActiveCategories);
router.get('/admin/all', protect, authorizeRoles('admin'), getAllCategories);
router.post('/', protect, authorizeRoles('admin'), upload.single('image'), createCategory);
router.put('/:id', protect, authorizeRoles('admin'), upload.single('image'), updateCategory);
router.post('/:id/subcategories', protect, authorizeRoles('admin'), addSubCategory);
router.delete('/:id/subcategories/:subCategory', protect, authorizeRoles('admin'), removeSubCategory);
router.put('/:id/toggle', protect, authorizeRoles('admin'), toggleCategory);
router.delete('/:id', protect, authorizeRoles('admin'), deleteCategory);

module.exports = router;
const express = require('express');
const router = express.Router();
const {
  createProduct,
  getProducts,
  getProductById,
  getMyProducts,
  getAllProductsAdmin,
  approveProduct,
  getCategories,
} = require('../controllers/productController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/seller/my-products', protect, authorizeRoles('seller', 'admin'), getMyProducts);
router.get('/admin/all', protect, authorizeRoles('admin'), getAllProductsAdmin);
router.put('/admin/:id/approve', protect, authorizeRoles('admin'), approveProduct);
router.get('/:id', getProductById);
router.post('/', protect, authorizeRoles('seller', 'admin'), createProduct);

module.exports = router;
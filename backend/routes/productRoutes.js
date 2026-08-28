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
  updateProduct,
} = require('../controllers/productController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { productValidation } = require('../middleware/validators');

router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/seller/my-products', protect, authorizeRoles('seller', 'admin'), getMyProducts);
router.get('/admin/all', protect, authorizeRoles('admin'), getAllProductsAdmin);
router.put('/admin/:id/approve', protect, authorizeRoles('admin'), approveProduct);
router.put('/:id', protect, authorizeRoles('seller', 'admin'), upload.array('images', 5), updateProduct);
router.get('/subcategories', getSubCategories);
router.get('/:id', getProductById);
router.post('/', protect, authorizeRoles('seller', 'admin'), upload.array('images', 5), productValidation, createProduct);


module.exports = router;
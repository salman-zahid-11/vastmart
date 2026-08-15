const Product = require('../models/Product');
const logActivity = require('../utils/logActivity');

// @desc   Create a new product
// @route  POST /api/products
// @access Private (seller/admin only)
const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock, images, productType, brand, subCategory, tags } = req.body;

    if (!name || !description || !price || !category || stock === undefined) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      subCategory,
      brand,
      stock,
      images,
      productType,
      tags,
      seller: req.user._id, // comes from our auth middleware (protect)
    });


    await logActivity({
      user: req.user,
      action: 'product_created',
      description: `${req.user.name} listed a new product: "${product.name}"`,
      meta: { productId: product._id },
    });


  res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc   Get all approved products (public)
// @route  GET /api/products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find({ isApproved: true, isActive: true })
      .populate('seller', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc   Get a single product by ID
// @route  GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('seller', 'name email');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc   Get all products belonging to the logged-in seller
// @route  GET /api/products/seller/my-products
const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc   Get ALL products (including unapproved) — admin only
// @route  GET /api/products/admin/all
const getAllProductsAdmin = async (req, res) => {
  try {
    const products = await Product.find({})
      .populate('seller', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc   Approve or reject a product
// @route  PUT /api/products/admin/:id/approve
const approveProduct = async (req, res) => {
  try {
    const { isApproved } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.isApproved = isApproved;
    await product.save();

    await logActivity({
      user: req.user,
      action: isApproved ? 'product_approved' : 'product_rejected',
      description: `${req.user.name} ${isApproved ? 'approved' : 'rejected'} "${product.name}"`,
      meta: { productId: product._id },
    });

    res.status(200).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createProduct, getProducts, getProductById, getMyProducts, getAllProductsAdmin, approveProduct };
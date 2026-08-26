const Product = require('../models/Product');
const logActivity = require('../utils/logActivity');

// @desc   Create a new product
// @route  POST /api/products
// @access Private (seller/admin only)
const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock, productType, brand, subCategory, tags, imageUrls } = req.body;

    if (!name || !description || !price || !category || stock === undefined) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    let images = [];

        if (req.files && req.files.length > 0) {
      images = req.files.map((file) => file.path);
    }

    if (imageUrls) {
      try {
        const parsedUrls = JSON.parse(imageUrls);
        if (Array.isArray(parsedUrls)) {
          images = [...images, ...parsedUrls];
        }
      } catch (e) {
        // ignore malformed imageUrls, don't break the whole request
      }
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
      seller: req.user._id,
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


// @desc   Update a product (owner seller or admin only)
// @route  PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Only the product's own seller or an admin can edit it
    if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to edit this product' });
    }

    const { name, description, price, category, subCategory, brand, stock, productType, tags, existingImages } = req.body;

    if (name) product.name = name;
    if (description) product.description = description;
    if (price !== undefined) product.price = price;
    if (category) product.category = category;
    if (subCategory !== undefined) product.subCategory = subCategory;
    if (brand !== undefined) product.brand = brand;
    if (stock !== undefined) product.stock = stock;
    if (productType) product.productType = productType;
    if (tags) product.tags = tags;

    // Rebuild images: kept existing ones (sent back from frontend) + any newly uploaded files
    let images = [];
    if (existingImages) {
      try {
        const parsed = JSON.parse(existingImages);
        if (Array.isArray(parsed)) images = parsed;
      } catch (e) {
        // ignore malformed input
      }
    }
    if (req.files && req.files.length > 0) {
      images = [...images, ...req.files.map((file) => file.path)];
    }
    if (images.length > 0) {
      product.images = images;
    }

    // Editing a product sends it back for re-approval — prevents sellers from
    // slipping in different content after admin already approved the original
    product.isApproved = false;

    await product.save();

    await logActivity({
      user: req.user,
      action: 'product_created', // reused enum — see note
      description: `${req.user.name} updated product "${product.name}" (sent for re-approval)`,
      meta: { productId: product._id },
    });

    res.status(200).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};



// @desc   Get all approved products (public)
// @route  GET /api/products
const getProducts = async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, sort, brand } = req.query;

    const filter = { isApproved: true, isActive: true };

    // Text search across name, description, and tags
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    // Category filter (exact match, case-insensitive)
    if (category) {
      filter.category = { $regex: `^${category}$`, $options: 'i' };
    }

    // Brand filter
    if (brand) {
      filter.brand = { $regex: `^${brand}$`, $options: 'i' };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Sorting
    let sortOption = { createdAt: -1 }; // default: newest first
    if (sort === 'price_asc') sortOption = { price: 1 };
    if (sort === 'price_desc') sortOption = { price: -1 };
    if (sort === 'name_asc') sortOption = { name: 1 };
    if (sort === 'rating') sortOption = { ratingsAverage: -1 };

    const products = await Product.find(filter)
      .populate('seller', 'name email')
      .sort(sortOption);

    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// @desc   Get list of distinct categories (for filter UI)
// @route  GET /api/products/categories
const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category', { isApproved: true, isActive: true });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc   Get distinct sub-categories, optionally filtered by category
// @route  GET /api/products/subcategories?category=Electronics
const getSubCategories = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = { isApproved: true, isActive: true, subCategory: { $nin: [null, ''] } };
    if (category) {
      filter.category = { $regex: `^${category}$`, $options: 'i' };
    }

    const subCategories = await Product.distinct('subCategory', filter);
    res.status(200).json(subCategories);
  } catch (error) {
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

module.exports = { createProduct, getProducts, getProductById, getMyProducts, getAllProductsAdmin, approveProduct, getCategories, getSubCategories, updateProduct };
const Category = require('../models/Category');

// @desc   Get all active categories (public — used for dropdowns/filters)
// @route  GET /api/categories
const getActiveCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc   Get all categories, active or not (admin)
// @route  GET /api/categories/admin/all
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ name: 1 });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc   Create a new category
// @route  POST /api/categories
const createCategory = async (req, res) => {
  try {
    const { name, subCategories } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const existing = await Category.findOne({ name: { $regex: `^${name.trim()}$`, $options: 'i' } });
    if (existing) {
      return res.status(400).json({ message: 'This category already exists' });
    }

    const category = await Category.create({
      name: name.trim(),
      subCategories: Array.isArray(subCategories) ? subCategories.filter(Boolean) : [],
      createdBy: req.user._id,
    });

    res.status(201).json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc   Add a sub-category to an existing category
// @route  POST /api/categories/:id/subcategories
const addSubCategory = async (req, res) => {
  try {
    const { subCategory } = req.body;

    if (!subCategory || !subCategory.trim()) {
      return res.status(400).json({ message: 'Sub-category name is required' });
    }

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const trimmed = subCategory.trim();
    if (category.subCategories.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      return res.status(400).json({ message: 'This sub-category already exists' });
    }

    category.subCategories.push(trimmed);
    await category.save();

    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc   Remove a sub-category
// @route  DELETE /api/categories/:id/subcategories/:subCategory
const removeSubCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    category.subCategories = category.subCategories.filter(
      (s) => s.toLowerCase() !== decodeURIComponent(req.params.subCategory).toLowerCase()
    );
    await category.save();

    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc   Toggle a category active/inactive
// @route  PUT /api/categories/:id/toggle
const toggleCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    category.isActive = !category.isActive;
    await category.save();

    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc   Delete a category entirely
// @route  DELETE /api/categories/:id
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    await category.deleteOne();
    res.status(200).json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getActiveCategories,
  getAllCategories,
  createCategory,
  addSubCategory,
  removeSubCategory,
  toggleCategory,
  deleteCategory,
};
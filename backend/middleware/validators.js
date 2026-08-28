const { body, validationResult } = require('express-validator');

// Runs after any validation chain — collects errors into a clean response
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  next();
};

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('email').trim().isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').optional({ checkFalsy: true }).trim().isLength({ min: 6, max: 20 }),
  handleValidationErrors,
];

const loginValidation = [
  body('email').trim().isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors,
];

const productValidation = [
  body('name').trim().notEmpty().withMessage('Product name is required').isLength({ max: 200 }),
  body('description').trim().notEmpty().withMessage('Description is required').isLength({ max: 5000 }),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative whole number'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  handleValidationErrors,
];

const couponValidation = [
  body('code').trim().notEmpty().withMessage('Coupon code is required').isLength({ max: 30 }),
  body('discountType').isIn(['percentage', 'flat']).withMessage('Invalid discount type'),
  body('discountValue').isFloat({ min: 0 }).withMessage('Discount value must be a positive number'),
  handleValidationErrors,
];

module.exports = {
  registerValidation,
  loginValidation,
  productValidation,
  couponValidation,
  handleValidationErrors,
};
/**
 * Input Validation Middleware
 * Using express-validator for request validation
 */
const { body, param, query, validationResult } = require('express-validator');

/**
 * Handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// User Registration Validation
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('First name must be between 2 and 100 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Last name must be between 2 and 100 characters'),
  body('phone')
    .optional()
    .trim()
    .matches(/^[\+]?[0-9\s\-\(\)]{10,20}$/)
    .withMessage('Please provide a valid phone number'),
  handleValidationErrors
];

// Login Validation
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Product Creation Validation
const createProductValidation = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage('Product name must be between 3 and 255 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Description cannot exceed 5000 characters'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('categoryId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Category ID must be a positive integer'),
  body('productType')
    .isIn(['round-neck', 'sleeveless'])
    .withMessage('Product type must be either round-neck or sleeveless'),
  body('gender')
    .optional()
    .isIn(['unisex', 'male', 'female'])
    .withMessage('Gender must be unisex, male, or female'),
  body('sizes')
    .isArray({ min: 1 })
    .withMessage('At least one size must be provided'),
  body('sizes.*.size')
    .trim()
    .notEmpty()
    .withMessage('Size cannot be empty'),
  body('sizes.*.quantity')
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),
  handleValidationErrors
];

// Order Creation Validation
const createOrderValidation = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item'),
  body('items.*.productId')
    .isInt({ min: 1 })
    .withMessage('Invalid product ID'),
  body('items.*.size')
    .trim()
    .notEmpty()
    .withMessage('Size is required for each item'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  body('shippingAddress')
    .isObject()
    .withMessage('Shipping address is required'),
  body('shippingAddress.firstName')
    .trim()
    .notEmpty()
    .withMessage('Shipping first name is required'),
  body('shippingAddress.lastName')
    .trim()
    .notEmpty()
    .withMessage('Shipping last name is required'),
  body('shippingAddress.address1')
    .trim()
    .notEmpty()
    .withMessage('Shipping address is required'),
  body('shippingAddress.city')
    .trim()
    .notEmpty()
    .withMessage('Shipping city is required'),
  body('shippingAddress.state')
    .trim()
    .notEmpty()
    .withMessage('Shipping state is required'),
  body('shippingAddress.phone')
    .trim()
    .notEmpty()
    .withMessage('Shipping phone is required'),
  handleValidationErrors
];

// Cart Item Validation
const cartItemValidation = [
  body('productId')
    .isInt({ min: 1 })
    .withMessage('Invalid product ID'),
  body('size')
    .trim()
    .notEmpty()
    .withMessage('Size is required'),
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  handleValidationErrors
];

// Payment Validation
const paymentValidation = [
  body('orderId')
    .isInt({ min: 1 })
    .withMessage('Invalid order ID'),
  body('paymentMethod')
    .isIn(['card', 'bank_transfer', 'ussd', 'qr', 'mobile_money'])
    .withMessage('Invalid payment method'),
  handleValidationErrors
];

// ID Parameter Validation
const idParamValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Invalid ID parameter'),
  handleValidationErrors
];

// Pagination Validation
const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  registerValidation,
  loginValidation,
  createProductValidation,
  createOrderValidation,
  cartItemValidation,
  paymentValidation,
  idParamValidation,
  paginationValidation
};

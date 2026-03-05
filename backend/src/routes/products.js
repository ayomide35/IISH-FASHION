/**
 * Product Routes
 */
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const { createProductValidation, idParamValidation, paginationValidation } = require('../middleware/validation');

// Public routes
router.get('/', productController.getProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/new-arrivals', productController.getNewArrivals);
router.get('/categories', productController.getCategories);
router.get('/categories/:slug', productController.getCategory);
router.get('/:slug', productController.getProduct);

// Admin routes
router.post('/', authenticate, authorizeAdmin, createProductValidation, productController.createProduct);
router.put('/:id', authenticate, authorizeAdmin, productController.updateProduct);
router.delete('/:id', authenticate, authorizeAdmin, idParamValidation, productController.deleteProduct);
router.put('/:id/inventory', authenticate, authorizeAdmin, productController.updateInventory);

// Category admin routes
router.post('/categories', authenticate, authorizeAdmin, productController.createCategory);
router.put('/categories/:id', authenticate, authorizeAdmin, productController.updateCategory);
router.delete('/categories/:id', authenticate, authorizeAdmin, idParamValidation, productController.deleteCategory);

module.exports = router;

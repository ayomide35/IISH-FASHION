/**
 * Admin Dashboard Routes
 */
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(authenticate, authorizeAdmin);

router.get('/dashboard', adminController.getDashboardStats);
router.get('/analytics/sales', adminController.getSalesAnalytics);
router.get('/analytics/inventory', adminController.getInventoryReport);
router.get('/analytics/customers', adminController.getCustomerAnalytics);

module.exports = router;

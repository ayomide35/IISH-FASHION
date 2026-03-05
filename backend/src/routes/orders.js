/**
 * Order Routes
 */
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const { createOrderValidation, idParamValidation } = require('../middleware/validation');

// Public route for order tracking
router.get('/track/:orderNumber', orderController.getOrderByNumber);

// Protected routes
router.use(authenticate);

router.get('/my-orders', orderController.getMyOrders);
router.get('/:id', idParamValidation, orderController.getOrder);
router.post('/', createOrderValidation, orderController.createOrder);

// Admin routes
router.get('/', authorizeAdmin, orderController.getAllOrders);
router.put('/:id/status', authorizeAdmin, orderController.updateOrderStatus);
router.put('/:id/tracking', authorizeAdmin, orderController.updateTracking);
router.get('/stats/overview', authorizeAdmin, orderController.getOrderStatistics);

module.exports = router;

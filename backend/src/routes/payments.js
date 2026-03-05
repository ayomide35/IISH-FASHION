/**
 * Payment Routes
 */
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const { paymentValidation } = require('../middleware/validation');

// Webhook route (public, signature verified in controller)
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);

// Callback route (public)
router.get('/verify', paymentController.verifyPayment);

// Protected routes
router.use(authenticate);

router.post('/initialize', paymentValidation, paymentController.initializePayment);
router.get('/my-payments', paymentController.getMyPayments);
router.get('/banks', paymentController.getBanks);
router.get('/:id', paymentController.getPayment);

// Admin routes
router.get('/admin/all', authorizeAdmin, paymentController.getAllPayments);
router.get('/admin/statistics', authorizeAdmin, paymentController.getPaymentStatistics);

module.exports = router;

/**
 * Payment Controller
 * Handles payment processing with Paystack
 */
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const paystackService = require('../services/paystackService');
const { asyncHandler, APIError } = require('../middleware/errorHandler');
const { v4: uuidv4 } = require('uuid');

/**
 * Initialize payment for an order
 */
const initializePayment = asyncHandler(async (req, res) => {
  const { orderId, paymentMethod = 'card' } = req.body;

  // Get order
  const order = await Order.findById(orderId);

  if (!order) {
    throw new APIError('Order not found', 404, 'ORDER_NOT_FOUND');
  }

  // Verify order belongs to user
  if (order.customer.id !== req.user.id) {
    throw new APIError('Access denied', 403, 'ACCESS_DENIED');
  }

  // Check if order is already paid
  if (order.paymentStatus === 'paid') {
    throw new APIError('Order is already paid', 400, 'ALREADY_PAID');
  }

  // Generate unique transaction reference
  const transactionReference = `IISH-PAY-${uuidv4()}`;

  // Create payment record
  const payment = await Payment.create({
    orderId,
    userId: req.user.id,
    amount: order.pricing.totalAmount,
    currency: 'NGN',
    paymentMethod,
    provider: 'paystack',
    transactionReference,
    metadata: {
      orderNumber: order.orderNumber,
      customerEmail: order.customer.email
    }
  });

  // Initialize Paystack transaction
  const callbackUrl = `${process.env.FRONTEND_URL}/payment/callback`;
  
  const paystackResponse = await paystackService.initializeTransaction({
    email: order.customer.email,
    amount: order.pricing.totalAmount,
    reference: transactionReference,
    callbackUrl,
    metadata: {
      order_id: orderId,
      order_number: order.orderNumber,
      customer_id: req.user.id,
      payment_id: payment.id
    }
  });

  // Update payment with authorization URL
  await Payment.create({
    orderId,
    userId: req.user.id,
    amount: order.pricing.totalAmount,
    currency: 'NGN',
    paymentMethod,
    provider: 'paystack',
    providerReference: paystackResponse.reference,
    transactionReference,
    authorizationUrl: paystackResponse.authorizationUrl,
    metadata: {
      orderNumber: order.orderNumber,
      accessCode: paystackResponse.accessCode
    }
  });

  res.json({
    success: true,
    message: 'Payment initialized',
    data: {
      paymentId: payment.id,
      authorizationUrl: paystackResponse.authorizationUrl,
      reference: transactionReference
    }
  });
});

/**
 * Verify payment (callback from Paystack)
 */
const verifyPayment = asyncHandler(async (req, res) => {
  const { reference } = req.query;

  if (!reference) {
    throw new APIError('Transaction reference required', 400, 'REFERENCE_REQUIRED');
  }

  // Verify with Paystack
  const verification = await paystackService.verifyTransaction(reference);

  // Update payment record
  const payment = await Payment.updateByTransactionRef(
    reference,
    verification.success ? 'success' : 'failed',
    {
      metadata: {
        channel: verification.channel,
        cardType: verification.cardType,
        bank: verification.bank,
        last4: verification.last4,
        brand: verification.brand,
        paidAt: verification.paidAt,
        fees: verification.fees
      },
      failureReason: verification.success ? null : 'Payment verification failed'
    }
  );

  // Update order payment status
  if (verification.success) {
    await Order.updatePaymentStatus(payment.orderId, 'paid');
  }

  res.json({
    success: verification.success,
    message: verification.success ? 'Payment successful' : 'Payment failed',
    data: {
      reference,
      status: verification.status,
      amount: verification.amount,
      orderId: payment.orderId
    }
  });
});

/**
 * Handle Paystack webhook
 */
const handleWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['x-paystack-signature'];
  
  // Verify webhook signature
  if (!paystackService.verifyWebhookSignature(JSON.stringify(req.body), signature)) {
    console.error('Invalid webhook signature');
    return res.status(400).send('Invalid signature');
  }

  const event = req.body;

  console.log('Paystack webhook received:', event.event);

  switch (event.event) {
    case 'charge.success':
      await handleChargeSuccess(event.data);
      break;
    case 'charge.failed':
      await handleChargeFailed(event.data);
      break;
    case 'refund.processed':
      await handleRefundProcessed(event.data);
      break;
    default:
      console.log('Unhandled webhook event:', event.event);
  }

  res.status(200).send('OK');
});

/**
 * Handle successful charge webhook
 */
async function handleChargeSuccess(data) {
  const reference = data.reference;

  try {
    const payment = await Payment.findByTransactionRef(reference);
    if (payment && payment.status !== 'success') {
      await Payment.updateStatus(payment.id, 'success', {
        metadata: {
          channel: data.channel,
          cardType: data.authorization?.card_type,
          bank: data.authorization?.bank,
          last4: data.authorization?.last4,
          paidAt: data.paid_at
        }
      });

      await Order.updatePaymentStatus(payment.orderId, 'paid');
      console.log(`Payment ${reference} marked as successful`);
    }
  } catch (error) {
    console.error('Error handling charge success:', error);
  }
}

/**
 * Handle failed charge webhook
 */
async function handleChargeFailed(data) {
  const reference = data.reference;

  try {
    const payment = await Payment.findByTransactionRef(reference);
    if (payment) {
      await Payment.updateStatus(payment.id, 'failed', {
        failureReason: data.gateway_response || 'Payment failed'
      });
      console.log(`Payment ${reference} marked as failed`);
    }
  } catch (error) {
    console.error('Error handling charge failed:', error);
  }
}

/**
 * Handle refund processed webhook
 */
async function handleRefundProcessed(data) {
  console.log('Refund processed:', data);
  // Implement refund logic if needed
}

/**
 * Get payment details
 */
const getPayment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const payment = await Payment.findById(id);

  if (!payment) {
    throw new APIError('Payment not found', 404, 'PAYMENT_NOT_FOUND');
  }

  // Check ownership
  if (payment.userId !== req.user.id && req.user.role !== 'ADMIN') {
    throw new APIError('Access denied', 403, 'ACCESS_DENIED');
  }

  res.json({
    success: true,
    data: { payment }
  });
});

/**
 * Get user's payments
 */
const getMyPayments = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;

  // Get orders for user
  const orders = await Order.getAll({
    userId: req.user.id,
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 20
  });

  // Get payments for these orders
  const payments = [];
  for (const order of orders.orders) {
    const orderPayments = await Payment.findByOrderId(order.id);
    payments.push(...orderPayments);
  }

  res.json({
    success: true,
    data: {
      payments,
      pagination: orders.pagination
    }
  });
});

/**
 * Admin: Get all payments
 */
const getAllPayments = asyncHandler(async (req, res) => {
  // This would need a getAll method in Payment model
  // For now, return payment statistics
  const stats = await Payment.getStatistics();

  res.json({
    success: true,
    data: stats
  });
});

/**
 * Admin: Get payment statistics
 */
const getPaymentStatistics = asyncHandler(async (req, res) => {
  const stats = await Payment.getStatistics();
  const dailyReport = await Payment.getDailyReport(30);

  res.json({
    success: true,
    data: {
      ...stats,
      dailyReport
    }
  });
});

/**
 * Get available banks
 */
const getBanks = asyncHandler(async (req, res) => {
  const banks = await paystackService.getBanks();

  res.json({
    success: true,
    data: banks
  });
});

module.exports = {
  initializePayment,
  verifyPayment,
  handleWebhook,
  getPayment,
  getMyPayments,
  getAllPayments,
  getPaymentStatistics,
  getBanks
};

/**
 * Order Controller
 * Handles order creation and management
 */
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { asyncHandler, APIError } = require('../middleware/errorHandler');

// Shipping costs configuration
const SHIPPING_COSTS = {
  standard: 2500,
  express: 4500,
  free: 0
};

const FREE_SHIPPING_THRESHOLD = 50000;

/**
 * Get user's orders
 */
const getMyOrders = asyncHandler(async (req, res) => {
  const { page, limit, status } = req.query;

  const result = await Order.getAll({
    userId: req.user.id,
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10,
    status
  });

  res.json({
    success: true,
    data: result
  });
});

/**
 * Get order details
 */
const getOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const order = await Order.findById(id);

  if (!order) {
    throw new APIError('Order not found', 404, 'ORDER_NOT_FOUND');
  }

  // Check if user owns this order or is admin
  if (order.customer.id !== req.user.id && req.user.role !== 'ADMIN') {
    throw new APIError('Access denied', 403, 'ACCESS_DENIED');
  }

  res.json({
    success: true,
    data: { order }
  });
});

/**
 * Get order by order number (for tracking)
 */
const getOrderByNumber = asyncHandler(async (req, res) => {
  const { orderNumber } = req.params;

  const order = await Order.findByOrderNumber(orderNumber);

  if (!order) {
    throw new APIError('Order not found', 404, 'ORDER_NOT_FOUND');
  }

  res.json({
    success: true,
    data: { order }
  });
});

/**
 * Create new order
 */
const createOrder = asyncHandler(async (req, res) => {
  const {
    shippingAddress,
    billingAddress,
    shippingMethod = 'standard',
    customerNote,
    useSameAddress = true
  } = req.body;

  // Get cart items
  const cart = await Cart.getSummary(req.user.id);

  if (cart.items.length === 0) {
    throw new APIError('Cart is empty', 400, 'EMPTY_CART');
  }

  // Validate cart items
  const validation = await Cart.validateItems(req.user.id);
  if (!validation.valid) {
    throw new APIError(
      'Some items in your cart are no longer available',
      400,
      'CART_VALIDATION_FAILED',
      { issues: validation.issues }
    );
  }

  // Calculate totals
  const subtotal = cart.subtotal;
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD 
    ? 0 
    : (SHIPPING_COSTS[shippingMethod] || SHIPPING_COSTS.standard);
  const totalAmount = subtotal + shippingCost;

  // Prepare order items
  const orderItems = [];
  for (const item of cart.items) {
    const product = await Product.findById(item.productId);
    const sizeInventory = product.inventory.find(inv => inv.size === item.size);

    orderItems.push({
      productId: item.productId,
      productName: item.productName,
      sku: product.sku || `IISH-${item.productId}`,
      size: item.size,
      color: sizeInventory?.color || null,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      imageUrl: item.productImage
    });
  }

  // Create order
  const { orderId, orderNumber } = await Order.create({
    userId: req.user.id,
    items: orderItems,
    shippingAddress,
    billingAddress: useSameAddress ? shippingAddress : billingAddress,
    shippingMethod,
    shippingCost,
    customerNote,
    subtotal,
    discountAmount: 0,
    totalAmount
  });

  // Clear cart
  await Cart.clearCart(req.user.id);

  const order = await Order.findById(orderId);

  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    data: { order }
  });
});

/**
 * Admin: Get all orders
 */
const getAllOrders = asyncHandler(async (req, res) => {
  const { page, limit, status, paymentStatus, startDate, endDate, search } = req.query;

  const result = await Order.getAll({
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 20,
    status,
    paymentStatus,
    startDate,
    endDate,
    search
  });

  res.json({
    success: true,
    data: result
  });
});

/**
 * Admin: Update order status
 */
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, adminNote } = req.body;

  const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
  if (!validStatuses.includes(status)) {
    throw new APIError('Invalid status', 400, 'INVALID_STATUS');
  }

  const order = await Order.updateStatus(id, status, adminNote);

  res.json({
    success: true,
    message: 'Order status updated',
    data: { order }
  });
});

/**
 * Admin: Update tracking number
 */
const updateTracking = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { trackingNumber } = req.body;

  const order = await Order.updateTracking(id, trackingNumber);

  res.json({
    success: true,
    message: 'Tracking number updated',
    data: { order }
  });
});

/**
 * Get order statistics (admin)
 */
const getOrderStatistics = asyncHandler(async (req, res) => {
  const stats = await Order.getStatistics();

  res.json({
    success: true,
    data: stats
  });
});

module.exports = {
  getMyOrders,
  getOrder,
  getOrderByNumber,
  createOrder,
  getAllOrders,
  updateOrderStatus,
  updateTracking,
  getOrderStatistics
};

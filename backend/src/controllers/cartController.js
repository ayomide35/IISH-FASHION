/**
 * Cart Controller
 * Handles shopping cart operations
 */
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { asyncHandler, APIError } = require('../middleware/errorHandler');

/**
 * Get user's cart
 */
const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.getSummary(req.user.id);

  res.json({
    success: true,
    data: cart
  });
});

/**
 * Add item to cart
 */
const addToCart = asyncHandler(async (req, res) => {
  const { productId, size, quantity } = req.body;

  // Verify product exists and has stock
  const product = await Product.findById(productId);
  if (!product) {
    throw new APIError('Product not found', 404, 'PRODUCT_NOT_FOUND');
  }

  // Check if size is available
  const sizeInventory = product.inventory.find(inv => inv.size === size);
  if (!sizeInventory) {
    throw new APIError('Selected size not available', 400, 'SIZE_NOT_AVAILABLE');
  }

  if (sizeInventory.availableQuantity < quantity) {
    throw new APIError(
      `Only ${sizeInventory.availableQuantity} units available`,
      400,
      'INSUFFICIENT_STOCK'
    );
  }

  const result = await Cart.addItem(req.user.id, productId, size, quantity);

  const cart = await Cart.getSummary(req.user.id);

  res.json({
    success: true,
    message: result.updated ? 'Cart updated' : 'Item added to cart',
    data: cart
  });
});

/**
 * Update cart item quantity
 */
const updateCartItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const { quantity } = req.body;

  const result = await Cart.updateItem(req.user.id, itemId, quantity);

  const cart = await Cart.getSummary(req.user.id);

  res.json({
    success: true,
    message: result.deleted ? 'Item removed from cart' : 'Cart updated',
    data: cart
  });
});

/**
 * Remove item from cart
 */
const removeFromCart = asyncHandler(async (req, res) => {
  const { itemId } = req.params;

  await Cart.removeItem(req.user.id, itemId);

  const cart = await Cart.getSummary(req.user.id);

  res.json({
    success: true,
    message: 'Item removed from cart',
    data: cart
  });
});

/**
 * Clear cart
 */
const clearCart = asyncHandler(async (req, res) => {
  await Cart.clearCart(req.user.id);

  res.json({
    success: true,
    message: 'Cart cleared',
    data: { items: [], itemCount: 0, subtotal: 0 }
  });
});

/**
 * Validate cart before checkout
 */
const validateCart = asyncHandler(async (req, res) => {
  const validation = await Cart.validateItems(req.user.id);

  res.json({
    success: true,
    data: validation
  });
});

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  validateCart
};

/**
 * Wishlist Controller
 * Handles user wishlist operations
 */
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const { asyncHandler, APIError } = require('../middleware/errorHandler');

/**
 * Get user's wishlist
 */
const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.getByUserId(req.user.id);

  res.json({
    success: true,
    data: {
      items: wishlist,
      count: wishlist.length
    }
  });
});

/**
 * Add item to wishlist
 */
const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  // Verify product exists
  const product = await Product.findById(productId);
  if (!product) {
    throw new APIError('Product not found', 404, 'PRODUCT_NOT_FOUND');
  }

  const result = await Wishlist.addItem(req.user.id, productId);

  if (!result.added) {
    return res.status(409).json({
      success: false,
      message: result.message
    });
  }

  const wishlist = await Wishlist.getByUserId(req.user.id);

  res.json({
    success: true,
    message: 'Added to wishlist',
    data: {
      items: wishlist,
      count: wishlist.length
    }
  });
});

/**
 * Remove item from wishlist
 */
const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  await Wishlist.removeItem(req.user.id, productId);

  const wishlist = await Wishlist.getByUserId(req.user.id);

  res.json({
    success: true,
    message: 'Removed from wishlist',
    data: {
      items: wishlist,
      count: wishlist.length
    }
  });
});

/**
 * Check if product is in wishlist
 */
const checkWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const isInWishlist = await Wishlist.isInWishlist(req.user.id, productId);

  res.json({
    success: true,
    data: { isInWishlist }
  });
});

/**
 * Move item from wishlist to cart
 */
const moveToCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { size, quantity = 1 } = req.body;

  if (!size) {
    throw new APIError('Size is required', 400, 'SIZE_REQUIRED');
  }

  // Verify product and size availability
  const product = await Product.findById(productId);
  if (!product) {
    throw new APIError('Product not found', 404, 'PRODUCT_NOT_FOUND');
  }

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

  // Move to cart
  await Wishlist.moveToCart(req.user.id, productId, size, quantity);

  const wishlist = await Wishlist.getByUserId(req.user.id);
  const cart = await Cart.getSummary(req.user.id);

  res.json({
    success: true,
    message: 'Item moved to cart',
    data: {
      wishlist: {
        items: wishlist,
        count: wishlist.length
      },
      cart
    }
  });
});

/**
 * Clear wishlist
 */
const clearWishlist = asyncHandler(async (req, res) => {
  await Wishlist.clearWishlist(req.user.id);

  res.json({
    success: true,
    message: 'Wishlist cleared',
    data: {
      items: [],
      count: 0
    }
  });
});

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlist,
  moveToCart,
  clearWishlist
};

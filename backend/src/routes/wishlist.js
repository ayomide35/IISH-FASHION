/**
 * Wishlist Routes
 */
const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const { authenticate } = require('../middleware/auth');

// All wishlist routes require authentication
router.use(authenticate);

router.get('/', wishlistController.getWishlist);
router.post('/', wishlistController.addToWishlist);
router.delete('/:productId', wishlistController.removeFromWishlist);
router.get('/check/:productId', wishlistController.checkWishlist);
router.post('/:productId/move-to-cart', wishlistController.moveToCart);
router.delete('/', wishlistController.clearWishlist);

module.exports = router;

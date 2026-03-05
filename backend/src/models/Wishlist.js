/**
 * Wishlist Model
 * Database operations for user wishlists
 */
const { executeQuery } = require('../config/database');

class Wishlist {
  /**
   * Get user's wishlist
   */
  static async getByUserId(userId) {
    const items = await executeQuery(
      `SELECT wi.*, 
              p.name as product_name,
              p.slug as product_slug,
              p.price,
              p.compare_at_price,
              p.product_type,
              p.is_active,
              (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = TRUE LIMIT 1) as product_image,
              c.name as category_name
       FROM wishlist_items wi
       JOIN products p ON wi.product_id = p.id
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE wi.user_id = ?
       ORDER BY wi.created_at DESC`,
      [userId]
    );

    return items.map(item => ({
      id: item.id,
      productId: item.product_id,
      productName: item.product_name,
      productSlug: item.product_slug,
      productImage: item.product_image,
      price: parseFloat(item.price),
      compareAtPrice: item.compare_at_price ? parseFloat(item.compare_at_price) : null,
      productType: item.product_type,
      category: item.category_name,
      isActive: item.is_active === 1,
      addedAt: item.created_at
    }));
  }

  /**
   * Add item to wishlist
   */
  static async addItem(userId, productId) {
    try {
      const result = await executeQuery(
        'INSERT INTO wishlist_items (user_id, product_id) VALUES (?, ?)',
        [userId, productId]
      );
      return { id: result.insertId, added: true };
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return { added: false, message: 'Item already in wishlist' };
      }
      throw error;
    }
  }

  /**
   * Remove item from wishlist
   */
  static async removeItem(userId, productId) {
    const result = await executeQuery(
      'DELETE FROM wishlist_items WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Remove wishlist item by ID
   */
  static async removeById(userId, wishlistItemId) {
    const result = await executeQuery(
      'DELETE FROM wishlist_items WHERE id = ? AND user_id = ?',
      [wishlistItemId, userId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Check if product is in user's wishlist
   */
  static async isInWishlist(userId, productId) {
    const items = await executeQuery(
      'SELECT id FROM wishlist_items WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );
    return items.length > 0;
  }

  /**
   * Get wishlist count
   */
  static async getCount(userId) {
    const [result] = await executeQuery(
      'SELECT COUNT(*) as count FROM wishlist_items WHERE user_id = ?',
      [userId]
    );
    return result.count;
  }

  /**
   * Clear user's wishlist
   */
  static async clearWishlist(userId) {
    await executeQuery('DELETE FROM wishlist_items WHERE user_id = ?', [userId]);
    return true;
  }

  /**
   * Move item from wishlist to cart
   */
  static async moveToCart(userId, productId, size, quantity = 1) {
    return await withTransaction(async (connection) => {
      // Remove from wishlist
      await connection.execute(
        'DELETE FROM wishlist_items WHERE user_id = ? AND product_id = ?',
        [userId, productId]
      );

      // Check if item exists in cart
      const [existing] = await connection.execute(
        'SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ? AND size = ?',
        [userId, productId, size]
      );

      if (existing.length > 0) {
        // Update quantity
        const newQuantity = existing[0].quantity + quantity;
        await connection.execute(
          'UPDATE cart_items SET quantity = ? WHERE id = ?',
          [newQuantity, existing[0].id]
        );
      } else {
        // Insert new cart item
        await connection.execute(
          'INSERT INTO cart_items (user_id, product_id, size, quantity) VALUES (?, ?, ?, ?)',
          [userId, productId, size, quantity]
        );
      }

      return true;
    });
  }
}

module.exports = Wishlist;

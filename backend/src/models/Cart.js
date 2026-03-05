/**
 * Cart Model
 * Database operations for user carts
 */
const { executeQuery, withTransaction } = require('../config/database');

class Cart {
  /**
   * Get user's cart
   */
  static async getByUserId(userId) {
    const cartItems = await executeQuery(
      `SELECT ci.*, 
              p.name as product_name,
              p.slug as product_slug,
              p.price,
              (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = TRUE LIMIT 1) as product_image,
              (SELECT quantity - reserved_quantity FROM product_inventory WHERE product_id = p.id AND size = ci.size LIMIT 1) as available_quantity
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = ? AND p.is_active = TRUE`,
      [userId]
    );

    return cartItems.map(item => ({
      id: item.id,
      productId: item.product_id,
      productName: item.product_name,
      productSlug: item.product_slug,
      productImage: item.product_image,
      size: item.size,
      quantity: item.quantity,
      unitPrice: parseFloat(item.price),
      totalPrice: parseFloat(item.price) * item.quantity,
      availableQuantity: item.available_quantity,
      addedAt: item.created_at
    }));
  }

  /**
   * Add item to cart
   */
  static async addItem(userId, productId, size, quantity) {
    // Check if item already exists in cart
    const existing = await executeQuery(
      'SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ? AND size = ?',
      [userId, productId, size]
    );

    if (existing.length > 0) {
      // Update quantity
      const newQuantity = existing[0].quantity + quantity;
      await executeQuery(
        'UPDATE cart_items SET quantity = ? WHERE id = ?',
        [newQuantity, existing[0].id]
      );
      return { id: existing[0].id, quantity: newQuantity, updated: true };
    } else {
      // Insert new item
      const result = await executeQuery(
        'INSERT INTO cart_items (user_id, product_id, size, quantity) VALUES (?, ?, ?, ?)',
        [userId, productId, size, quantity]
      );
      return { id: result.insertId, quantity, updated: false };
    }
  }

  /**
   * Update cart item quantity
   */
  static async updateItem(userId, cartItemId, quantity) {
    // Verify the cart item belongs to the user
    const items = await executeQuery(
      'SELECT id FROM cart_items WHERE id = ? AND user_id = ?',
      [cartItemId, userId]
    );

    if (items.length === 0) {
      throw new Error('Cart item not found');
    }

    if (quantity <= 0) {
      await executeQuery('DELETE FROM cart_items WHERE id = ?', [cartItemId]);
      return { deleted: true };
    }

    await executeQuery(
      'UPDATE cart_items SET quantity = ? WHERE id = ?',
      [quantity, cartItemId]
    );

    return { id: cartItemId, quantity, deleted: false };
  }

  /**
   * Remove item from cart
   */
  static async removeItem(userId, cartItemId) {
    const result = await executeQuery(
      'DELETE FROM cart_items WHERE id = ? AND user_id = ?',
      [cartItemId, userId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Clear user's cart
   */
  static async clearCart(userId) {
    await executeQuery('DELETE FROM cart_items WHERE user_id = ?', [userId]);
    return true;
  }

  /**
   * Get cart summary
   */
  static async getSummary(userId) {
    const items = await this.getByUserId(userId);
    
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      items,
      itemCount,
      subtotal,
      currency: 'NGN',
      currencySymbol: '₦'
    };
  }

  /**
   * Merge guest cart with user cart (for when user logs in)
   */
  static async mergeCarts(userId, guestItems) {
    return await withTransaction(async (connection) => {
      for (const item of guestItems) {
        // Check if item exists
        const [existing] = await connection.execute(
          'SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ? AND size = ?',
          [userId, item.productId, item.size]
        );

        if (existing.length > 0) {
          // Update quantity
          const newQuantity = existing[0].quantity + item.quantity;
          await connection.execute(
            'UPDATE cart_items SET quantity = ? WHERE id = ?',
            [newQuantity, existing[0].id]
          );
        } else {
          // Insert new item
          await connection.execute(
            'INSERT INTO cart_items (user_id, product_id, size, quantity) VALUES (?, ?, ?, ?)',
            [userId, item.productId, item.size, item.quantity]
          );
        }
      }
      return true;
    });
  }

  /**
   * Validate cart items (check stock availability)
   */
  static async validateItems(userId) {
    const items = await executeQuery(
      `SELECT ci.*, 
              p.name as product_name,
              p.is_active,
              (SELECT quantity - reserved_quantity FROM product_inventory WHERE product_id = p.id AND size = ci.size LIMIT 1) as available_quantity
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = ?`,
      [userId]
    );

    const issues = [];

    for (const item of items) {
      if (!item.is_active) {
        issues.push({
          cartItemId: item.id,
          productId: item.product_id,
          productName: item.product_name,
          issue: 'PRODUCT_INACTIVE',
          message: `${item.product_name} is no longer available`
        });
      } else if (item.available_quantity < item.quantity) {
        issues.push({
          cartItemId: item.id,
          productId: item.product_id,
          productName: item.product_name,
          issue: 'INSUFFICIENT_STOCK',
          message: `Only ${item.available_quantity} units of ${item.product_name} (size ${item.size}) available`,
          availableQuantity: item.available_quantity,
          requestedQuantity: item.quantity
        });
      }
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }
}

module.exports = Cart;

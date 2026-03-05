/**
 * Order Model
 * Database operations for orders
 */
const { executeQuery, withTransaction } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Order {
  /**
   * Find order by ID
   */
  static async findById(id) {
    const orders = await executeQuery(
      `SELECT o.*, 
              u.email as user_email,
              u.first_name as user_first_name,
              u.last_name as user_last_name
       FROM orders o
       JOIN users u ON o.user_id = u.id
       WHERE o.id = ?`,
      [id]
    );

    if (orders.length === 0) return null;

    const order = orders[0];
    order.items = await this.getOrderItems(id);

    return this.formatOrder(order);
  }

  /**
   * Find order by order number
   */
  static async findByOrderNumber(orderNumber) {
    const orders = await executeQuery(
      `SELECT o.*, 
              u.email as user_email,
              u.first_name as user_first_name,
              u.last_name as user_last_name
       FROM orders o
       JOIN users u ON o.user_id = u.id
       WHERE o.order_number = ?`,
      [orderNumber]
    );

    if (orders.length === 0) return null;

    const order = orders[0];
    order.items = await this.getOrderItems(order.id);

    return this.formatOrder(order);
  }

  /**
   * Get order items
   */
  static async getOrderItems(orderId) {
    return await executeQuery(
      `SELECT oi.*, p.slug as product_slug
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [orderId]
    );
  }

  /**
   * Get all orders with filtering
   */
  static async getAll(options = {}) {
    const {
      page = 1,
      limit = 20,
      userId,
      status,
      paymentStatus,
      startDate,
      endDate,
      search
    } = options;

    const offset = (page - 1) * limit;
    let whereClause = '';
    const params = [];

    if (userId) {
      whereClause += ' WHERE o.user_id = ?';
      params.push(userId);
    }

    if (status) {
      whereClause += whereClause ? ' AND' : ' WHERE';
      whereClause += ' o.status = ?';
      params.push(status);
    }

    if (paymentStatus) {
      whereClause += whereClause ? ' AND' : ' WHERE';
      whereClause += ' o.payment_status = ?';
      params.push(paymentStatus);
    }

    if (startDate) {
      whereClause += whereClause ? ' AND' : ' WHERE';
      whereClause += ' o.created_at >= ?';
      params.push(startDate);
    }

    if (endDate) {
      whereClause += whereClause ? ' AND' : ' WHERE';
      whereClause += ' o.created_at <= ?';
      params.push(endDate);
    }

    if (search) {
      whereClause += whereClause ? ' AND' : ' WHERE';
      whereClause += ' (o.order_number LIKE ? OR u.email LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    const orders = await executeQuery(
      `SELECT o.*, 
              u.email as user_email,
              u.first_name as user_first_name,
              u.last_name as user_last_name
       FROM orders o
       JOIN users u ON o.user_id = u.id
       ${whereClause}
       ORDER BY o.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const [countResult] = await executeQuery(
      `SELECT COUNT(*) as total FROM orders o
       JOIN users u ON o.user_id = u.id
       ${whereClause}`,
      params
    );

    return {
      orders: orders.map(o => this.formatOrderList(o)),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult.total,
        pages: Math.ceil(countResult.total / limit)
      }
    };
  }

  /**
   * Create new order
   */
  static async create(orderData) {
    const {
      userId,
      items,
      shippingAddress,
      billingAddress,
      shippingMethod,
      shippingCost,
      customerNote,
      subtotal,
      discountAmount,
      totalAmount
    } = orderData;

    return await withTransaction(async (connection) => {
      // Generate order number
      const orderNumber = `IISH${Date.now()}${Math.floor(Math.random() * 1000)}`;

      // Insert order
      const [orderResult] = await connection.execute(
        `INSERT INTO orders 
         (order_number, user_id, status, payment_status, 
          subtotal, discount_amount, shipping_cost, total_amount,
          shipping_first_name, shipping_last_name, shipping_address_1, shipping_address_2,
          shipping_city, shipping_state, shipping_postal_code, shipping_country, shipping_phone,
          billing_first_name, billing_last_name, billing_address_1, billing_address_2,
          billing_city, billing_state, billing_postal_code, billing_country, billing_phone,
          shipping_method, customer_note)
         VALUES (?, ?, 'pending', 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderNumber, userId, subtotal, discountAmount || 0, shippingCost || 0, totalAmount,
          shippingAddress.firstName, shippingAddress.lastName, shippingAddress.address1, shippingAddress.address2,
          shippingAddress.city, shippingAddress.state, shippingAddress.postalCode, shippingAddress.country || 'Nigeria', shippingAddress.phone,
          billingAddress.firstName, billingAddress.lastName, billingAddress.address1, billingAddress.address2,
          billingAddress.city, billingAddress.state, billingAddress.postalCode, billingAddress.country || 'Nigeria', billingAddress.phone,
          shippingMethod, customerNote
        ]
      );

      const orderId = orderResult.insertId;

      // Insert order items
      for (const item of items) {
        await connection.execute(
          `INSERT INTO order_items 
           (order_id, product_id, product_name, product_sku, size, color, quantity, unit_price, total_price, image_url)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            orderId, item.productId, item.productName, item.sku, item.size, item.color,
            item.quantity, item.unitPrice, item.totalPrice, item.imageUrl
          ]
        );

        // Reserve inventory
        await connection.execute(
          `UPDATE product_inventory 
           SET reserved_quantity = reserved_quantity + ?
           WHERE product_id = ? AND size = ?`,
          [item.quantity, item.productId, item.size]
        );
      }

      return { orderId, orderNumber };
    });
  }

  /**
   * Update order status
   */
  static async updateStatus(id, status, adminNote = null) {
    const updateFields = ['status = ?'];
    const values = [status];

    if (status === 'shipped') {
      updateFields.push('shipped_at = NOW()');
    } else if (status === 'delivered') {
      updateFields.push('delivered_at = NOW()');
    }

    if (adminNote) {
      updateFields.push('admin_note = ?');
      values.push(adminNote);
    }

    values.push(id);
    await executeQuery(
      `UPDATE orders SET ${updateFields.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  /**
   * Update payment status
   */
  static async updatePaymentStatus(id, paymentStatus) {
    await executeQuery(
      'UPDATE orders SET payment_status = ? WHERE id = ?',
      [paymentStatus, id]
    );

    // If paid, confirm inventory
    if (paymentStatus === 'paid') {
      const items = await this.getOrderItems(id);
      for (const item of items) {
        await executeQuery(
          `UPDATE product_inventory 
           SET quantity = quantity - ?,
               reserved_quantity = GREATEST(0, reserved_quantity - ?)
           WHERE product_id = ? AND size = ?`,
          [item.quantity, item.quantity, item.product_id, item.size]
        );
      }
    }

    return this.findById(id);
  }

  /**
   * Update tracking number
   */
  static async updateTracking(id, trackingNumber) {
    await executeQuery(
      'UPDATE orders SET tracking_number = ?, shipped_at = NOW() WHERE id = ?',
      [trackingNumber, id]
    );
    return this.findById(id);
  }

  /**
   * Get order statistics
   */
  static async getStatistics() {
    const [totalOrders] = await executeQuery(
      'SELECT COUNT(*) as count FROM orders'
    );

    const [pendingOrders] = await executeQuery(
      "SELECT COUNT(*) as count FROM orders WHERE status = 'pending'"
    );

    const [totalRevenue] = await executeQuery(
      "SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE payment_status = 'paid'"
    );

    const [todayRevenue] = await executeQuery(
      "SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE payment_status = 'paid' AND DATE(created_at) = CURDATE()"
    );

    return {
      totalOrders: totalOrders.count,
      pendingOrders: pendingOrders.count,
      totalRevenue: parseFloat(totalRevenue.total),
      todayRevenue: parseFloat(todayRevenue.total)
    };
  }

  /**
   * Format order for list view
   */
  static formatOrderList(order) {
    return {
      id: order.id,
      orderNumber: order.order_number,
      status: order.status,
      paymentStatus: order.payment_status,
      fulfillmentStatus: order.fulfillment_status,
      totalAmount: parseFloat(order.total_amount),
      currency: order.currency,
      customer: {
        email: order.user_email,
        firstName: order.user_first_name,
        lastName: order.user_last_name
      },
      createdAt: order.created_at
    };
  }

  /**
   * Format order for detail view
   */
  static formatOrder(order) {
    return {
      id: order.id,
      orderNumber: order.order_number,
      status: order.status,
      paymentStatus: order.payment_status,
      fulfillmentStatus: order.fulfillment_status,
      pricing: {
        subtotal: parseFloat(order.subtotal),
        discountAmount: parseFloat(order.discount_amount),
        shippingCost: parseFloat(order.shipping_cost),
        taxAmount: parseFloat(order.tax_amount),
        totalAmount: parseFloat(order.total_amount),
        currency: order.currency
      },
      shippingAddress: {
        firstName: order.shipping_first_name,
        lastName: order.shipping_last_name,
        address1: order.shipping_address_1,
        address2: order.shipping_address_2,
        city: order.shipping_city,
        state: order.shipping_state,
        postalCode: order.shipping_postal_code,
        country: order.shipping_country,
        phone: order.shipping_phone
      },
      billingAddress: {
        firstName: order.billing_first_name,
        lastName: order.billing_last_name,
        address1: order.billing_address_1,
        address2: order.billing_address_2,
        city: order.billing_city,
        state: order.billing_state,
        postalCode: order.billing_postal_code,
        country: order.billing_country,
        phone: order.billing_phone
      },
      shipping: {
        method: order.shipping_method,
        trackingNumber: order.tracking_number,
        shippedAt: order.shipped_at,
        deliveredAt: order.delivered_at
      },
      items: order.items ? order.items.map(item => ({
        id: item.id,
        productId: item.product_id,
        productName: item.product_name,
        productSlug: item.product_slug,
        sku: item.product_sku,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        unitPrice: parseFloat(item.unit_price),
        totalPrice: parseFloat(item.total_price),
        imageUrl: item.image_url
      })) : [],
      notes: {
        customer: order.customer_note,
        admin: order.admin_note
      },
      customer: {
        id: order.user_id,
        email: order.user_email,
        firstName: order.user_first_name,
        lastName: order.user_last_name
      },
      createdAt: order.created_at,
      updatedAt: order.updated_at
    };
  }
}

module.exports = Order;

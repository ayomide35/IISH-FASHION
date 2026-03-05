/**
 * Admin Dashboard Controller
 * Handles admin analytics and dashboard data
 */
const { executeQuery } = require('../config/database');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Product = require('../models/Product');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Get dashboard overview statistics
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  // Get order statistics
  const orderStats = await Order.getStatistics();

  // Get payment statistics
  const paymentStats = await Payment.getStatistics();

  // Get user count
  const [userCount] = await executeQuery(
    "SELECT COUNT(*) as count FROM users WHERE role = 'USER'"
  );

  // Get new users today
  const [newUsersToday] = await executeQuery(
    "SELECT COUNT(*) as count FROM users WHERE DATE(created_at) = CURDATE()"
  );

  // Get low stock products
  const lowStockProducts = await executeQuery(
    `SELECT p.id, p.name, p.sku, pi.size, pi.quantity, pi.low_stock_threshold
     FROM products p
     JOIN product_inventory pi ON p.id = pi.product_id
     WHERE pi.quantity <= pi.low_stock_threshold AND p.is_active = TRUE
     LIMIT 10`
  );

  // Get recent orders
  const recentOrders = await executeQuery(
    `SELECT o.id, o.order_number, o.total_amount, o.status, o.payment_status, o.created_at,
            u.first_name, u.last_name, u.email
     FROM orders o
     JOIN users u ON o.user_id = u.id
     ORDER BY o.created_at DESC
     LIMIT 10`
  );

  // Get sales chart data (last 7 days)
  const salesChart = await executeQuery(
    `SELECT 
      DATE(created_at) as date,
      COUNT(*) as orders,
      COALESCE(SUM(total_amount), 0) as revenue
     FROM orders
     WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
     GROUP BY DATE(created_at)
     ORDER BY date ASC`
  );

  res.json({
    success: true,
    data: {
      overview: {
        totalOrders: orderStats.totalOrders,
        pendingOrders: orderStats.pendingOrders,
        totalRevenue: paymentStats.successful.total,
        todayRevenue: orderStats.todayRevenue,
        totalCustomers: userCount.count,
        newCustomersToday: newUsersToday.count,
        totalProducts: await getTotalProducts()
      },
      lowStockProducts: lowStockProducts.map(p => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        size: p.size,
        quantity: p.quantity,
        threshold: p.low_stock_threshold
      })),
      recentOrders: recentOrders.map(o => ({
        id: o.id,
        orderNumber: o.order_number,
        customer: `${o.first_name} ${o.last_name}`,
        email: o.email,
        totalAmount: parseFloat(o.total_amount),
        status: o.status,
        paymentStatus: o.payment_status,
        createdAt: o.created_at
      })),
      salesChart: salesChart.map(s => ({
        date: s.date,
        orders: s.orders,
        revenue: parseFloat(s.revenue)
      }))
    }
  });
});

/**
 * Get sales analytics
 */
const getSalesAnalytics = asyncHandler(async (req, res) => {
  const { period = 'monthly', year = new Date().getFullYear() } = req.query;

  let query;
  if (period === 'daily') {
    query = `
      SELECT 
        DATE(created_at) as period,
        COUNT(*) as orders,
        COALESCE(SUM(total_amount), 0) as revenue,
        COALESCE(SUM(subtotal), 0) as subtotal,
        COALESCE(SUM(shipping_cost), 0) as shipping
      FROM orders
      WHERE payment_status = 'paid' 
        AND YEAR(created_at) = ?
      GROUP BY DATE(created_at)
      ORDER BY period DESC
    `;
  } else if (period === 'monthly') {
    query = `
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as period,
        COUNT(*) as orders,
        COALESCE(SUM(total_amount), 0) as revenue,
        COALESCE(SUM(subtotal), 0) as subtotal,
        COALESCE(SUM(shipping_cost), 0) as shipping
      FROM orders
      WHERE payment_status = 'paid'
        AND YEAR(created_at) = ?
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY period DESC
    `;
  } else {
    query = `
      SELECT 
        YEAR(created_at) as period,
        COUNT(*) as orders,
        COALESCE(SUM(total_amount), 0) as revenue,
        COALESCE(SUM(subtotal), 0) as subtotal,
        COALESCE(SUM(shipping_cost), 0) as shipping
      FROM orders
      WHERE payment_status = 'paid'
      GROUP BY YEAR(created_at)
      ORDER BY period DESC
    `;
  }

  const params = period === 'yearly' ? [] : [year];
  const sales = await executeQuery(query, params);

  // Get best selling products
  const bestSellers = await executeQuery(
    `SELECT 
      p.id,
      p.name,
      p.sku,
      SUM(oi.quantity) as total_sold,
      SUM(oi.total_price) as total_revenue
     FROM products p
     JOIN order_items oi ON p.id = oi.product_id
     JOIN orders o ON oi.order_id = o.id
     WHERE o.payment_status = 'paid'
     GROUP BY p.id, p.name, p.sku
     ORDER BY total_sold DESC
     LIMIT 10`
  );

  res.json({
    success: true,
    data: {
      sales: sales.map(s => ({
        period: s.period,
        orders: s.orders,
        revenue: parseFloat(s.revenue),
        subtotal: parseFloat(s.subtotal),
        shipping: parseFloat(s.shipping)
      })),
      bestSellers: bestSellers.map(p => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        totalSold: p.total_sold,
        totalRevenue: parseFloat(p.total_revenue)
      }))
    }
  });
});

/**
 * Get inventory report
 */
const getInventoryReport = asyncHandler(async (req, res) => {
  // Total products
  const [totalProducts] = await executeQuery(
    'SELECT COUNT(*) as count FROM products'
  );

  // Active products
  const [activeProducts] = await executeQuery(
    'SELECT COUNT(*) as count FROM products WHERE is_active = TRUE'
  );

  // Out of stock products
  const outOfStock = await executeQuery(
    `SELECT DISTINCT p.id, p.name, p.sku
     FROM products p
     JOIN product_inventory pi ON p.id = pi.product_id
     WHERE pi.quantity = 0 AND p.is_active = TRUE
     LIMIT 20`
  );

  // Low stock products
  const lowStock = await executeQuery(
    `SELECT p.id, p.name, p.sku, pi.size, pi.quantity, pi.low_stock_threshold
     FROM products p
     JOIN product_inventory pi ON p.id = pi.product_id
     WHERE pi.quantity <= pi.low_stock_threshold 
       AND pi.quantity > 0 
       AND p.is_active = TRUE
     ORDER BY pi.quantity ASC
     LIMIT 20`
  );

  // Inventory value
  const [inventoryValue] = await executeQuery(
    `SELECT 
      COALESCE(SUM(pi.quantity * p.cost_price), 0) as total_value,
      COALESCE(SUM(pi.quantity * p.price), 0) as retail_value
     FROM products p
     JOIN product_inventory pi ON p.id = pi.product_id`
  );

  res.json({
    success: true,
    data: {
      summary: {
        totalProducts: totalProducts.count,
        activeProducts: activeProducts.count,
        outOfStockCount: outOfStock.length,
        lowStockCount: lowStock.length,
        inventoryCostValue: parseFloat(inventoryValue.total_value),
        inventoryRetailValue: parseFloat(inventoryValue.retail_value)
      },
      outOfStock,
      lowStock: lowStock.map(p => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        size: p.size,
        quantity: p.quantity,
        threshold: p.low_stock_threshold
      }))
    }
  });
});

/**
 * Get customer analytics
 */
const getCustomerAnalytics = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  // Top customers by order value
  const topCustomers = await executeQuery(
    `SELECT 
      u.id,
      u.first_name,
      u.last_name,
      u.email,
      COUNT(o.id) as total_orders,
      COALESCE(SUM(o.total_amount), 0) as total_spent
     FROM users u
     LEFT JOIN orders o ON u.id = o.user_id AND o.payment_status = 'paid'
     WHERE u.role = 'USER'
     GROUP BY u.id, u.first_name, u.last_name, u.email
     ORDER BY total_spent DESC
     LIMIT ? OFFSET ?`,
    [parseInt(limit), offset]
  );

  // Customer acquisition over time
  const customerAcquisition = await executeQuery(
    `SELECT 
      DATE(created_at) as date,
      COUNT(*) as new_customers
     FROM users
     WHERE role = 'USER'
     GROUP BY DATE(created_at)
     ORDER BY date DESC
     LIMIT 30`
  );

  res.json({
    success: true,
    data: {
      topCustomers: topCustomers.map(c => ({
        id: c.id,
        name: `${c.first_name} ${c.last_name}`,
        email: c.email,
        totalOrders: c.total_orders,
        totalSpent: parseFloat(c.total_spent)
      })),
      customerAcquisition: customerAcquisition.map(c => ({
        date: c.date,
        newCustomers: c.new_customers
      }))
    }
  });
});

/**
 * Helper: Get total products count
 */
async function getTotalProducts() {
  const [result] = await executeQuery('SELECT COUNT(*) as count FROM products WHERE is_active = TRUE');
  return result.count;
}

module.exports = {
  getDashboardStats,
  getSalesAnalytics,
  getInventoryReport,
  getCustomerAnalytics
};

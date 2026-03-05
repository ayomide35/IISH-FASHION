/**
 * Payment Model
 * Database operations for payments
 */
const { executeQuery } = require('../config/database');

class Payment {
  /**
   * Find payment by ID
   */
  static async findById(id) {
    const payments = await executeQuery(
      'SELECT * FROM payments WHERE id = ?',
      [id]
    );
    return payments.length > 0 ? this.formatPayment(payments[0]) : null;
  }

  /**
   * Find payment by transaction reference
   */
  static async findByTransactionRef(reference) {
    const payments = await executeQuery(
      'SELECT * FROM payments WHERE transaction_reference = ?',
      [reference]
    );
    return payments.length > 0 ? this.formatPayment(payments[0]) : null;
  }

  /**
   * Find payment by order ID
   */
  static async findByOrderId(orderId) {
    const payments = await executeQuery(
      'SELECT * FROM payments WHERE order_id = ? ORDER BY created_at DESC',
      [orderId]
    );
    return payments.map(p => this.formatPayment(p));
  }

  /**
   * Create new payment
   */
  static async create(paymentData) {
    const {
      orderId,
      userId,
      amount,
      currency = 'NGN',
      paymentMethod,
      provider,
      providerReference,
      transactionReference,
      authorizationUrl,
      metadata
    } = paymentData;

    const result = await executeQuery(
      `INSERT INTO payments 
       (order_id, user_id, amount, currency, payment_method, provider, 
        provider_reference, transaction_reference, authorization_url, metadata)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId, userId, amount, currency, paymentMethod, provider,
        providerReference, transactionReference, authorizationUrl,
        metadata ? JSON.stringify(metadata) : null
      ]
    );

    return this.findById(result.insertId);
  }

  /**
   * Update payment status
   */
  static async updateStatus(id, status, additionalData = {}) {
    const updateFields = ['status = ?'];
    const values = [status];

    if (status === 'success' || status === 'paid') {
      updateFields.push('paid_at = NOW()');
    }

    if (status === 'failed') {
      updateFields.push('failed_at = NOW()');
    }

    if (additionalData.failureReason) {
      updateFields.push('failure_reason = ?');
      values.push(additionalData.failureReason);
    }

    if (additionalData.metadata) {
      updateFields.push('metadata = CAST(CONCAT(COALESCE(metadata, \'{}\'), ?) AS JSON)');
      values.push(JSON.stringify(additionalData.metadata));
    }

    values.push(id);
    await executeQuery(
      `UPDATE payments SET ${updateFields.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  /**
   * Update payment by transaction reference
   */
  static async updateByTransactionRef(reference, status, additionalData = {}) {
    const payment = await this.findByTransactionRef(reference);
    if (!payment) {
      throw new Error('Payment not found');
    }
    return this.updateStatus(payment.id, status, additionalData);
  }

  /**
   * Get payment statistics
   */
  static async getStatistics() {
    const [totalPayments] = await executeQuery(
      'SELECT COUNT(*) as count FROM payments'
    );

    const [successfulPayments] = await executeQuery(
      "SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'success'"
    );

    const [pendingPayments] = await executeQuery(
      "SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total FROM payments WHERE status = 'pending'"
    );

    const [failedPayments] = await executeQuery(
      "SELECT COUNT(*) as count FROM payments WHERE status = 'failed'"
    );

    // Payment method breakdown
    const methodBreakdown = await executeQuery(
      `SELECT payment_method, COUNT(*) as count, COALESCE(SUM(amount), 0) as total
       FROM payments
       WHERE status = 'success'
       GROUP BY payment_method`
    );

    return {
      total: totalPayments.count,
      successful: {
        count: successfulPayments.count,
        total: Number.parseFloat(successfulPayments.total)
      },
      pending: {
        count: pendingPayments.count,
        total: Number.parseFloat(pendingPayments.total)
      },
      failed: failedPayments.count,
      methodBreakdown: methodBreakdown.map(m => ({
        method: m.payment_method,
        count: m.count,
        total: Number.parseFloat(m.total)
      }))
    };

  }

  /**
   * Get daily payment report
   */
  static async getDailyReport(days = 30) {
    return await executeQuery(
      `SELECT 
        DATE(created_at) as date,
        COUNT(*) as transaction_count,
        COALESCE(SUM(CASE WHEN status = 'success' THEN amount ELSE 0 END), 0) as successful_amount,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) as pending_amount,
        COALESCE(SUM(CASE WHEN status = 'failed' THEN amount ELSE 0 END), 0) as failed_amount
       FROM payments
       WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY DATE(created_at)
       ORDER BY date DESC`,
      [days]
    );
  }

  /**
   * Format payment for response
   */
  static formatPayment(payment) {
    return {
      id: payment.id,
      orderId: payment.order_id,
      userId: payment.user_id,
      amount: Number.parseFloat(payment.amount),
      currency: payment.currency,
      paymentMethod: payment.payment_method,
      provider: payment.provider,
      providerReference: payment.provider_reference,
      transactionReference: payment.transaction_reference,
      status: payment.status,
      authorizationUrl: payment.authorization_url,
      paidAt: payment.paid_at,
      failedAt: payment.failed_at,
      failureReason: payment.failure_reason,
      metadata: payment.metadata ? JSON.parse(payment.metadata) : null,
      createdAt: payment.created_at,
      updatedAt: payment.updated_at
    };
  }
}

module.exports = Payment;

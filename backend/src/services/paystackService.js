/**
 * Paystack Payment Service
 * Integration with Paystack API for Nigerian payments
 */
const axios = require('axios');

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

// Axios instance with default config
const paystackAPI = axios.create({
  baseURL: PAYSTACK_BASE_URL,
  headers: {
    'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json'
  },
  timeout: 30000
});

/**
 * Initialize a transaction
 * @param {Object} params - Transaction parameters
 * @returns {Promise<Object>} Paystack response
 */
const initializeTransaction = async (params) => {
  try {
    const {
      email,
      amount, // Amount in kobo (multiply Naira by 100)
      reference,
      callbackUrl,
      metadata = {},
      channels = ['card', 'bank', 'ussd', 'qr', 'mobile_money']
    } = params;

    const response = await paystackAPI.post('/transaction/initialize', {
      email,
      amount: Math.round(amount * 100), // Convert to kobo
      reference,
      callback_url: callbackUrl,
      metadata,
      channels
    });

    return {
      success: true,
      authorizationUrl: response.data.data.authorization_url,
      accessCode: response.data.data.access_code,
      reference: response.data.data.reference
    };
  } catch (error) {
    console.error('Paystack initialize error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to initialize payment');
  }
};

/**
 * Verify a transaction
 * @param {String} reference - Transaction reference
 * @returns {Promise<Object>} Verification result
 */
const verifyTransaction = async (reference) => {
  try {
    const response = await paystackAPI.get(`/transaction/verify/${reference}`);
    const data = response.data.data;

    return {
      success: data.status === 'success',
      status: data.status,
      reference: data.reference,
      amount: data.amount / 100, // Convert from kobo to Naira
      currency: data.currency,
      paidAt: data.paid_at,
      channel: data.channel,
      cardType: data.authorization?.card_type,
      bank: data.authorization?.bank,
      last4: data.authorization?.last4,
      brand: data.authorization?.brand,
      metadata: data.metadata,
      fees: data.fees / 100,
      customer: {
        email: data.customer?.email,
        phone: data.customer?.phone
      }
    };
  } catch (error) {
    console.error('Paystack verify error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to verify payment');
  }
};

/**
 * List transactions
 * @param {Object} params - Query parameters
 * @returns {Promise<Array>} List of transactions
 */
const listTransactions = async (params = {}) => {
  try {
    const { perPage = 50, page = 1, from, to, status } = params;
    
    const queryParams = new URLSearchParams();
    queryParams.append('perPage', perPage);
    queryParams.append('page', page);
    if (from) queryParams.append('from', from);
    if (to) queryParams.append('to', to);
    if (status) queryParams.append('status', status);

    const response = await paystackAPI.get(`/transaction?${queryParams.toString()}`);
    
    return {
      success: true,
      transactions: response.data.data.map(t => ({
        id: t.id,
        reference: t.reference,
        status: t.status,
        amount: t.amount / 100,
        currency: t.currency,
        paidAt: t.paid_at,
        channel: t.channel,
        customer: t.customer
      })),
      meta: response.data.meta
    };
  } catch (error) {
    console.error('Paystack list transactions error:', error.response?.data || error.message);
    throw new Error('Failed to fetch transactions');
  }
};

/**
 * Create a refund
 * @param {Object} params - Refund parameters
 * @returns {Promise<Object>} Refund result
 */
const createRefund = async (params) => {
  try {
    const { transaction, amount = null } = params;

    const requestBody = { transaction };
    if (amount) requestBody.amount = Math.round(amount * 100);

    const response = await paystackAPI.post('/refund', requestBody);

    return {
      success: true,
      refundId: response.data.data.id,
      status: response.data.data.status,
      amount: response.data.data.amount / 100,
      transactionReference: response.data.data.transaction_reference
    };
  } catch (error) {
    console.error('Paystack refund error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to process refund');
  }
};

/**
 * Get bank list
 * @returns {Promise<Array>} List of Nigerian banks
 */
const getBanks = async () => {
  try {
    const response = await paystackAPI.get('/bank?country=nigeria');
    
    return {
      success: true,
      banks: response.data.data.map(bank => ({
        id: bank.id,
        name: bank.name,
        slug: bank.slug,
        code: bank.code,
        longcode: bank.longcode
      }))
    };
  } catch (error) {
    console.error('Paystack get banks error:', error.response?.data || error.message);
    throw new Error('Failed to fetch bank list');
  }
};

/**
 * Resolve bank account
 * @param {Object} params - Account details
 * @returns {Promise<Object>} Account resolution result
 */
const resolveAccount = async (params) => {
  try {
    const { accountNumber, bankCode } = params;

    const response = await paystackAPI.get(
      `/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`
    );

    return {
      success: true,
      accountNumber: response.data.data.account_number,
      accountName: response.data.data.account_name,
      bankId: response.data.data.bank_id
    };
  } catch (error) {
    console.error('Paystack resolve account error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to resolve account');
  }
};

/**
 * Create a transfer recipient
 * @param {Object} params - Recipient details
 * @returns {Promise<Object>} Recipient creation result
 */
const createTransferRecipient = async (params) => {
  try {
    const { type, name, accountNumber, bankCode, currency = 'NGN' } = params;

    const response = await paystackAPI.post('/transferrecipient', {
      type,
      name,
      account_number: accountNumber,
      bank_code: bankCode,
      currency
    });

    return {
      success: true,
      recipientCode: response.data.data.recipient_code,
      name: response.data.data.name,
      accountNumber: response.data.data.details.account_number,
      bankCode: response.data.data.details.bank_code,
      bankName: response.data.data.details.bank_name
    };
  } catch (error) {
    console.error('Paystack create recipient error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to create transfer recipient');
  }
};

/**
 * Initialize a transfer
 * @param {Object} params - Transfer parameters
 * @returns {Promise<Object>} Transfer result
 */
const initializeTransfer = async (params) => {
  try {
    const { source = 'balance', amount, recipient, reason = '' } = params;

    const response = await paystackAPI.post('/transfer', {
      source,
      amount: Math.round(amount * 100),
      recipient,
      reason
    });

    return {
      success: true,
      transferId: response.data.data.id,
      reference: response.data.data.reference,
      status: response.data.data.status,
      amount: response.data.data.amount / 100,
      recipient: response.data.data.recipient
    };
  } catch (error) {
    console.error('Paystack transfer error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to initialize transfer');
  }
};

/**
 * Verify webhook signature
 * @param {String} body - Request body
 * @param {String} signature - X-Paystack-Signature header
 * @returns {Boolean} Verification result
 */
const verifyWebhookSignature = (body, signature) => {
  const crypto = require('crypto');
  const hash = crypto
    .createHmac('sha512', PAYSTACK_SECRET_KEY)
    .update(body)
    .digest('hex');
  
  return hash === signature;
};

/**
 * Format amount for display (adds Naira symbol and formatting)
 * @param {Number} amount - Amount in Naira
 * @returns {String} Formatted amount
 */
const formatAmount = (amount) => {
  return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

module.exports = {
  initializeTransaction,
  verifyTransaction,
  listTransactions,
  createRefund,
  getBanks,
  resolveAccount,
  createTransferRecipient,
  initializeTransfer,
  verifyWebhookSignature,
  formatAmount,
  PAYSTACK_PUBLIC_KEY
};

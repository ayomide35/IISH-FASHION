/**
 * Authentication Controller
 * Handles user registration, login, and profile management
 */
const User = require('../models/User');
const Cart = require('../models/Cart');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');
const { asyncHandler, APIError } = require('../middleware/errorHandler');

/**
 * Register a new user
 */
const register = asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName, phone } = req.body;

  // Check if user already exists
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    throw new APIError('Email already registered', 409, 'EMAIL_EXISTS');
  }

  // Create user
  const user = await User.create({
    email,
    password,
    firstName,
    lastName,
    phone
  });

  // Generate tokens
  const accessToken = generateAccessToken({
    id: user.id,
    email: user.email,
    role: user.role
  });

  const refreshToken = generateRefreshToken({ id: user.id });

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: {
      user,
      accessToken,
      refreshToken
    }
  });
});

/**
 * Login user
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user
  const user = await User.findByEmail(email);
  if (!user) {
    throw new APIError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  // Check if user is active
  if (!user.is_active) {
    throw new APIError('Account is deactivated', 401, 'ACCOUNT_DEACTIVATED');
  }

  // Verify password
  const isValidPassword = await User.verifyPassword(password, user.password_hash);
  if (!isValidPassword) {
    throw new APIError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  // Update last login
  await User.updateLastLogin(user.id);

  // Generate tokens
  const accessToken = generateAccessToken({
    id: user.id,
    email: user.email,
    role: user.role
  });

  const refreshToken = generateRefreshToken({ id: user.id });

  // Format user for response
  const formattedUser = User.formatUser(user);

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: formattedUser,
      accessToken,
      refreshToken
    }
  });
});

/**
 * Get current user profile
 */
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  
  if (!user) {
    throw new APIError('User not found', 404, 'USER_NOT_FOUND');
  }

  res.json({
    success: true,
    data: { user }
  });
});

/**
 * Update user profile
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName, phone, avatarUrl } = req.body;

  const user = await User.update(req.user.id, {
    firstName,
    lastName,
    phone,
    avatarUrl
  });

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: { user }
  });
});

/**
 * Change password
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Get user with password
  const user = await User.findByEmail(req.user.email);

  // Verify current password
  const isValidPassword = await User.verifyPassword(currentPassword, user.password_hash);
  if (!isValidPassword) {
    throw new APIError('Current password is incorrect', 400, 'INVALID_PASSWORD');
  }

  // Update password
  await User.updatePassword(user.id, newPassword);

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
});

/**
 * Refresh access token
 */
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;

  if (!token) {
    throw new APIError('Refresh token required', 400, 'TOKEN_REQUIRED');
  }

  const { verifyRefreshToken } = require('../utils/jwt');
  const decoded = verifyRefreshToken(token);

  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) {
    throw new APIError('Invalid refresh token', 401, 'INVALID_TOKEN');
  }

  const accessToken = generateAccessToken({
    id: user.id,
    email: user.email,
    role: user.role
  });

  res.json({
    success: true,
    data: { accessToken }
  });
});

/**
 * Admin: Get all users
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const { page, limit, role, search } = req.query;

  const result = await User.getAll({
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 20,
    role,
    search
  });

  res.json({
    success: true,
    data: result
  });
});

/**
 * Admin: Toggle user active status
 */
const toggleUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.toggleActive(id);

  res.json({
    success: true,
    message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
    data: { user }
  });
});

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  refreshToken,
  getAllUsers,
  toggleUserStatus
};

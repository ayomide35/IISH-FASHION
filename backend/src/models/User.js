/**
 * User Model
 * Database operations for users
 */
const { executeQuery, withTransaction } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  /**
   * Find user by ID
   */
  static async findById(id) {
    const users = await executeQuery(
      `SELECT id, email, first_name, last_name, phone, role, 
              is_active, email_verified, avatar_url, created_at, last_login
       FROM users WHERE id = ?`,
      [id]
    );
    return users.length > 0 ? this.formatUser(users[0]) : null;
  }

  /**
   * Find user by email
   */
  static async findByEmail(email) {
    const users = await executeQuery(
      'SELECT * FROM users WHERE email = ?',
      [email.toLowerCase()]
    );
    return users.length > 0 ? users[0] : null;
  }

  /**
   * Create new user
   */
  static async create(userData) {
    const { email, password, firstName, lastName, phone, role = 'USER' } = userData;
    
    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const result = await executeQuery(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone, role)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [email.toLowerCase(), passwordHash, firstName, lastName, phone, role]
    );

    return this.findById(result.insertId);
  }

  /**
   * Update user
   */
  static async update(id, updateData) {
    const allowedFields = ['first_name', 'last_name', 'phone', 'avatar_url'];
    const updates = [];
    const values = [];

    for (const [key, value] of Object.entries(updateData)) {
      const dbField = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      if (allowedFields.includes(dbField)) {
        updates.push(`${dbField} = ?`);
        values.push(value);
      }
    }

    if (updates.length === 0) return null;

    values.push(id);
    await executeQuery(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  /**
   * Update password
   */
  static async updatePassword(id, newPassword) {
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    await executeQuery(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [passwordHash, id]
    );

    return true;
  }

  /**
   * Verify password
   */
  static async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Update last login
   */
  static async updateLastLogin(id) {
    await executeQuery(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [id]
    );
  }

  /**
   * Get all users (admin only)
   */
  static async getAll(options = {}) {
    const { page = 1, limit = 20, role, search } = options;
    const offset = (page - 1) * limit;
    
    let whereClause = '';
    const params = [];

    if (role) {
      whereClause += ' WHERE role = ?';
      params.push(role);
    }

    if (search) {
      whereClause += whereClause ? ' AND' : ' WHERE';
      whereClause += ' (email LIKE ? OR first_name LIKE ? OR last_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const users = await executeQuery(
      `SELECT id, email, first_name, last_name, phone, role, 
              is_active, created_at, last_login
       FROM users
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const [countResult] = await executeQuery(
      `SELECT COUNT(*) as total FROM users ${whereClause}`,
      params
    );

    return {
      users: users.map(u => this.formatUser(u)),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult.total,
        pages: Math.ceil(countResult.total / limit)
      }
    };
  }

  /**
   * Toggle user active status
   */
  static async toggleActive(id) {
    await executeQuery(
      'UPDATE users SET is_active = NOT is_active WHERE id = ?',
      [id]
    );
    return this.findById(id);
  }

  /**
   * Format user object for response
   */
  static formatUser(user) {
    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      fullName: `${user.first_name} ${user.last_name}`,
      phone: user.phone,
      role: user.role,
      isActive: user.is_active === 1,
      emailVerified: user.email_verified === 1,
      avatarUrl: user.avatar_url,
      createdAt: user.created_at,
      lastLogin: user.last_login
    };
  }
}

module.exports = User;

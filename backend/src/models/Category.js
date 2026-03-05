/**
 * Category Model
 * Database operations for product categories
 */
const { executeQuery } = require('../config/database');

class Category {
  /**
   * Find category by ID
   */
  static async findById(id) {
    const categories = await executeQuery(
      'SELECT * FROM categories WHERE id = ?',
      [id]
    );
    return categories.length > 0 ? this.formatCategory(categories[0]) : null;
  }

  /**
   * Find category by slug
   */
  static async findBySlug(slug) {
    const categories = await executeQuery(
      'SELECT * FROM categories WHERE slug = ?',
      [slug]
    );
    return categories.length > 0 ? this.formatCategory(categories[0]) : null;
  }

  /**
   * Get all categories
   */
  static async getAll(options = {}) {
    const { includeInactive = false, parentOnly = false } = options;
    
    let whereClause = '';
    const params = [];

    if (!includeInactive) {
      whereClause += ' WHERE is_active = TRUE';
    }

    if (parentOnly) {
      whereClause += whereClause ? ' AND' : ' WHERE';
      whereClause += ' parent_id IS NULL';
    }

    const categories = await executeQuery(
      `SELECT c.*, 
              p.name as parent_name,
              p.slug as parent_slug,
              (SELECT COUNT(*) FROM products WHERE category_id = c.id AND is_active = TRUE) as product_count
       FROM categories c
       LEFT JOIN categories p ON c.parent_id = p.id
       ${whereClause}
       ORDER BY c.sort_order ASC, c.name ASC`,
      params
    );

    return categories.map(c => this.formatCategory(c));
  }

  /**
   * Get category tree (hierarchical)
   */
  static async getTree() {
    const categories = await this.getAll({ includeInactive: false });
    
    const buildTree = (parentId = null) => {
      return categories
        .filter(c => c.parentId === parentId)
        .map(c => ({
          ...c,
          children: buildTree(c.id)
        }));
    };

    return buildTree();
  }

  /**
   * Create new category
   */
  static async create(categoryData) {
    const {
      name,
      slug,
      description,
      imageUrl,
      parentId,
      sortOrder
    } = categoryData;

    const result = await executeQuery(
      `INSERT INTO categories (name, slug, description, image_url, parent_id, sort_order)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, slug, description, imageUrl, parentId, sortOrder || 0]
    );

    return this.findById(result.insertId);
  }

  /**
   * Update category
   */
  static async update(id, updateData) {
    const allowedFields = ['name', 'slug', 'description', 'image_url', 'parent_id', 'is_active', 'sort_order'];
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
      `UPDATE categories SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  /**
   * Delete category
   */
  static async delete(id) {
    // Check if category has products
    const [productCount] = await executeQuery(
      'SELECT COUNT(*) as count FROM products WHERE category_id = ?',
      [id]
    );

    if (productCount.count > 0) {
      throw new Error('Cannot delete category with associated products');
    }

    // Check if category has children
    const [childCount] = await executeQuery(
      'SELECT COUNT(*) as count FROM categories WHERE parent_id = ?',
      [id]
    );

    if (childCount.count > 0) {
      throw new Error('Cannot delete category with subcategories');
    }

    await executeQuery('DELETE FROM categories WHERE id = ?', [id]);
    return true;
  }

  /**
   * Get products in category
   */
  static async getProducts(slug, options = {}) {
    const { page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    const category = await this.findBySlug(slug);
    if (!category) return null;

    const products = await executeQuery(
      `SELECT p.*, 
              (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = TRUE LIMIT 1) as primary_image
       FROM products p
       WHERE p.category_id = ? AND p.is_active = TRUE
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [category.id, limit, offset]
    );

    const [countResult] = await executeQuery(
      'SELECT COUNT(*) as total FROM products WHERE category_id = ? AND is_active = TRUE',
      [category.id]
    );

    return {
      category,
      products: products.map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: parseFloat(p.price),
        compareAtPrice: p.compare_at_price ? parseFloat(p.compare_at_price) : null,
        primaryImage: p.primary_image,
        productType: p.product_type,
        isFeatured: p.is_featured === 1
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult.total,
        pages: Math.ceil(countResult.total / limit)
      }
    };
  }

  /**
   * Format category for response
   */
  static formatCategory(category) {
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      imageUrl: category.image_url,
      parentId: category.parent_id,
      parentName: category.parent_name,
      isActive: category.is_active === 1,
      sortOrder: category.sort_order,
      productCount: category.product_count || 0,
      createdAt: category.created_at,
      updatedAt: category.updated_at
    };
  }
}

module.exports = Category;

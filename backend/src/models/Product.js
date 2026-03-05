/**
 * Product Model
 * Database operations for products
 */
const { executeQuery, withTransaction } = require('../config/database');

class Product {
  /**
   * Find product by ID with details
   */
  static async findById(id) {
    const products = await executeQuery(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`,
      [id]
    );

    if (products.length === 0) return null;

    const product = products[0];
    product.images = await this.getProductImages(id);
    product.inventory = await this.getProductInventory(id);

    return this.formatProduct(product);
  }

  /**
   * Find product by slug
   */
  static async findBySlug(slug) {
    const products = await executeQuery(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.slug = ?`,
      [slug]
    );

    if (products.length === 0) return null;

    const product = products[0];
    product.images = await this.getProductImages(product.id);
    product.inventory = await this.getProductInventory(product.id);

    return this.formatProduct(product);
  }

  /**
   * Get product images
   */
  static async getProductImages(productId) {
    return await executeQuery(
      `SELECT id, image_url, alt_text, is_primary, sort_order
       FROM product_images
       WHERE product_id = ?
       ORDER BY is_primary DESC, sort_order ASC`,
      [productId]
    );
  }

  /**
   * Get product inventory
   */
  static async getProductInventory(productId) {
    return await executeQuery(
      `SELECT id, size, color, quantity, reserved_quantity, 
              (quantity - reserved_quantity) as available_quantity
       FROM product_inventory
       WHERE product_id = ?
       ORDER BY size`,
      [productId]
    );
  }

  /**
   * Get all products with filtering
   */
  static async getAll(options = {}) {
    const {
      page = 1,
      limit = 20,
      category,
      productType,
      gender,
      minPrice,
      maxPrice,
      search,
      isFeatured,
      isNewArrival,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = options;

    const offset = (page - 1) * limit;
    let whereClause = 'WHERE p.is_active = TRUE';
    const params = [];

    if (category) {
      whereClause += ' AND c.slug = ?';
      params.push(category);
    }

    if (productType) {
      whereClause += ' AND p.product_type = ?';
      params.push(productType);
    }

    if (gender) {
      whereClause += ' AND (p.gender = ? OR p.gender = "unisex")';
      params.push(gender);
    }

    if (minPrice !== undefined) {
      whereClause += ' AND p.price >= ?';
      params.push(minPrice);
    }

    if (maxPrice !== undefined) {
      whereClause += ' AND p.price <= ?';
      params.push(maxPrice);
    }

    if (search) {
      whereClause += ' AND (p.name LIKE ? OR p.description LIKE ? OR p.tags LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (isFeatured !== undefined) {
      whereClause += ' AND p.is_featured = ?';
      params.push(isFeatured ? 1 : 0);
    }

    if (isNewArrival !== undefined) {
      whereClause += ' AND p.is_new_arrival = ?';
      params.push(isNewArrival ? 1 : 0);
    }

    // Validate sort column
    const allowedSortColumns = ['created_at', 'price', 'name', 'id'];
    const orderBy = allowedSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const products = await executeQuery(
      `SELECT p.*, c.name as category_name, c.slug as category_slug,
              (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = TRUE LIMIT 1) as primary_image
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       ${whereClause}
       ORDER BY p.${orderBy} ${order}
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const [countResult] = await executeQuery(
      `SELECT COUNT(*) as total FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       ${whereClause}`,
      params
    );

    return {
      products: products.map(p => this.formatProductList(p)),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult.total,
        pages: Math.ceil(countResult.total / limit)
      }
    };
  }

  /**
   * Create new product
   */
  static async create(productData) {
    const {
      name,
      slug,
      description,
      shortDescription,
      price,
      compareAtPrice,
      costPrice,
      sku,
      categoryId,
      productType,
      gender,
      material,
      careInstructions,
      weightKg,
      isFeatured,
      isNewArrival,
      tags,
      images,
      sizes
    } = productData;

    return await withTransaction(async (connection) => {
      // Insert product
      const [productResult] = await connection.execute(
        `INSERT INTO products 
         (name, slug, description, short_description, price, compare_at_price, 
          cost_price, sku, category_id, product_type, gender, material, 
          care_instructions, weight_kg, is_featured, is_new_arrival, tags)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          name, slug, description, shortDescription, price, compareAtPrice,
          costPrice, sku, categoryId, productType, gender, material,
          careInstructions, weightKg, isFeatured ? 1 : 0, isNewArrival ? 1 : 0, tags
        ]
      );

      const productId = productResult.insertId;

      // Insert images
      if (images && images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const img = images[i];
          await connection.execute(
            `INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
             VALUES (?, ?, ?, ?, ?)`,
            [productId, img.url, img.altText || name, img.isPrimary ? 1 : 0, i]
          );
        }
      }

      // Insert inventory
      if (sizes && sizes.length > 0) {
        for (const size of sizes) {
          await connection.execute(
            `INSERT INTO product_inventory (product_id, size, color, quantity, low_stock_threshold)
             VALUES (?, ?, ?, ?, ?)`,
            [productId, size.size, size.color || null, size.quantity, size.lowStockThreshold || 5]
          );
        }
      }

      return productId;
    });
  }

  /**
   * Update product
   */
  static async update(id, updateData) {
    const allowedFields = [
      'name', 'slug', 'description', 'short_description', 'price',
      'compare_at_price', 'cost_price', 'sku', 'category_id', 'product_type',
      'gender', 'material', 'care_instructions', 'weight_kg', 'is_active',
      'is_featured', 'is_new_arrival', 'tags'
    ];

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
      `UPDATE products SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  /**
   * Delete product
   */
  static async delete(id) {
    return await executeQuery('DELETE FROM products WHERE id = ?', [id]);
  }

  /**
   * Update inventory
   */
  static async updateInventory(productId, size, quantity) {
    await executeQuery(
      `UPDATE product_inventory 
       SET quantity = ?
       WHERE product_id = ? AND size = ?`,
      [quantity, productId, size]
    );
    return true;
  }

  /**
   * Get featured products
   */
  static async getFeatured(limit = 8) {
    const result = await this.getAll({ isFeatured: true, limit });
    return result.products;
  }

  /**
   * Get new arrivals
   */
  static async getNewArrivals(limit = 8) {
    const result = await this.getAll({ isNewArrival: true, limit });
    return result.products;
  }

  /**
   * Format product for list view
   */
  static formatProductList(product) {
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: parseFloat(product.price),
      compareAtPrice: product.compare_at_price ? parseFloat(product.compare_at_price) : null,
      primaryImage: product.primary_image,
      productType: product.product_type,
      gender: product.gender,
      isFeatured: product.is_featured === 1,
      isNewArrival: product.is_new_arrival === 1,
      category: product.category_name ? {
        name: product.category_name,
        slug: product.category_slug
      } : null
    };
  }

  /**
   * Format product for detail view
   */
  static formatProduct(product) {
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      shortDescription: product.short_description,
      price: parseFloat(product.price),
      compareAtPrice: product.compare_at_price ? parseFloat(product.compare_at_price) : null,
      sku: product.sku,
      productType: product.product_type,
      gender: product.gender,
      material: product.material,
      careInstructions: product.care_instructions,
      weightKg: product.weight_kg,
      isActive: product.is_active === 1,
      isFeatured: product.is_featured === 1,
      isNewArrival: product.is_new_arrival === 1,
      tags: product.tags ? product.tags.split(',').map(t => t.trim()) : [],
      images: product.images ? product.images.map(img => ({
        id: img.id,
        url: img.image_url,
        altText: img.alt_text,
        isPrimary: img.is_primary === 1
      })) : [],
      inventory: product.inventory ? product.inventory.map(inv => ({
        id: inv.id,
        size: inv.size,
        color: inv.color,
        quantity: inv.quantity,
        availableQuantity: inv.available_quantity
      })) : [],
      category: product.category_name ? {
        name: product.category_name,
        slug: product.category_slug
      } : null,
      createdAt: product.created_at,
      updatedAt: product.updated_at
    };
  }
}

module.exports = Product;

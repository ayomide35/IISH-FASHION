/**
 * Product Controller
 * Handles product CRUD operations and search
 */
const Product = require('../models/Product');
const Category = require('../models/Category');
const { asyncHandler, APIError } = require('../middleware/errorHandler');

/**
 * Get all products with filtering
 */
const getProducts = asyncHandler(async (req, res) => {
  const {
    page,
    limit,
    category,
    productType,
    gender,
    minPrice,
    maxPrice,
    search,
    featured,
    newArrival,
    sortBy,
    sortOrder
  } = req.query;

  const result = await Product.getAll({
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 20,
    category,
    productType,
    gender,
    minPrice: minPrice ? parseFloat(minPrice) : undefined,
    maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
    search,
    isFeatured: featured === 'true',
    isNewArrival: newArrival === 'true',
    sortBy,
    sortOrder
  });

  res.json({
    success: true,
    data: result
  });
});

/**
 * Get single product by slug
 */
const getProduct = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const product = await Product.findBySlug(slug);

  if (!product) {
    throw new APIError('Product not found', 404, 'PRODUCT_NOT_FOUND');
  }

  res.json({
    success: true,
    data: { product }
  });
});

/**
 * Get featured products
 */
const getFeaturedProducts = asyncHandler(async (req, res) => {
  const { limit } = req.query;
  const products = await Product.getFeatured(parseInt(limit) || 8);

  res.json({
    success: true,
    data: { products }
  });
});

/**
 * Get new arrivals
 */
const getNewArrivals = asyncHandler(async (req, res) => {
  const { limit } = req.query;
  const products = await Product.getNewArrivals(parseInt(limit) || 8);

  res.json({
    success: true,
    data: { products }
  });
});

/**
 * Admin: Create new product
 */
const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
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
  } = req.body;

  // Generate slug from name
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  // Check if slug exists
  const existing = await Product.findBySlug(slug);
  if (existing) {
    throw new APIError('Product with similar name already exists', 409, 'SLUG_EXISTS');
  }

  const productId = await Product.create({
    name,
    slug: slug + '-' + Date.now(), // Make unique
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
  });

  const product = await Product.findById(productId);

  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: { product }
  });
});

/**
 * Admin: Update product
 */
const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const product = await Product.update(id, updateData);

  if (!product) {
    throw new APIError('Product not found', 404, 'PRODUCT_NOT_FOUND');
  }

  res.json({
    success: true,
    message: 'Product updated successfully',
    data: { product }
  });
});

/**
 * Admin: Delete product
 */
const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await Product.delete(id);

  res.json({
    success: true,
    message: 'Product deleted successfully'
  });
});

/**
 * Admin: Update product inventory
 */
const updateInventory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { size, quantity } = req.body;

  await Product.updateInventory(id, size, quantity);

  res.json({
    success: true,
    message: 'Inventory updated successfully'
  });
});

/**
 * Get all categories
 */
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.getAll();

  res.json({
    success: true,
    data: { categories }
  });
});

/**
 * Get category by slug with products
 */
const getCategory = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const { page, limit } = req.query;

  const result = await Category.getProducts(slug, {
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 20
  });

  if (!result) {
    throw new APIError('Category not found', 404, 'CATEGORY_NOT_FOUND');
  }

  res.json({
    success: true,
    data: result
  });
});

/**
 * Admin: Create category
 */
const createCategory = asyncHandler(async (req, res) => {
  const { name, slug, description, imageUrl, parentId, sortOrder } = req.body;

  const category = await Category.create({
    name,
    slug,
    description,
    imageUrl,
    parentId,
    sortOrder
  });

  res.status(201).json({
    success: true,
    message: 'Category created successfully',
    data: { category }
  });
});

/**
 * Admin: Update category
 */
const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const category = await Category.update(id, updateData);

  if (!category) {
    throw new APIError('Category not found', 404, 'CATEGORY_NOT_FOUND');
  }

  res.json({
    success: true,
    message: 'Category updated successfully',
    data: { category }
  });
});

/**
 * Admin: Delete category
 */
const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await Category.delete(id);

  res.json({
    success: true,
    message: 'Category deleted successfully'
  });
});

module.exports = {
  getProducts,
  getProduct,
  getFeaturedProducts,
  getNewArrivals,
  createProduct,
  updateProduct,
  deleteProduct,
  updateInventory,
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
};

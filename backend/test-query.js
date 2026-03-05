const db = require('./src/config/database');

async function test() {
  try {
    console.log('Testing database query...');
    
    const options = { page: 1, limit: 20 };
    const offset = (options.page - 1) * options.limit;
    
    const whereClause = 'WHERE p.is_active = TRUE';
    const params = [];
    
    const products = await db.executeQuery(
      `SELECT p.*, c.name as category_name, c.slug as category_slug,
              (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = TRUE LIMIT 1) as primary_image
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       ${whereClause}
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, options.limit, offset]
    );
    
    console.log('Products found:', products.length);
    console.log(JSON.stringify(products, null, 2));
    
    const [countResult] = await db.executeQuery(
      `SELECT COUNT(*) as total FROM products p ${whereClause}`,
      params
    );
    
    console.log('Total count:', countResult);
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
  }
  process.exit(0);
}

test();


/**
 * Database Seeder
 * Populates the database with IISH Fashion sample data
 */
const { pool, executeQuery } = require('../src/config/database');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// IISH Fashion Product Images
const PRODUCT_IMAGES = {
  classicWhite: '/images/products/WhatsApp Image 2026-03-03 at 13.50.18.jpeg',
  davidArt: '/images/products/WhatsApp Image 2026-03-03 at 13.50.18 (1).jpeg',
  hockeyMask: '/images/products/WhatsApp Image 2026-03-03 at 13.50.18 (2).jpeg',
  blueAngel: '/images/products/WhatsApp Image 2026-03-03 at 13.50.18 (4).jpeg',
  qualityControl: '/images/products/WhatsApp Image 2026-03-03 at 13.50.18 (5).jpeg',
  groupShot: '/images/products/WhatsApp Image 2026-03-03 at 13.50.18 (6).jpeg',
  crewShot: '/images/products/WhatsApp Image 2026-03-03 at 13.50.18 (7).jpeg',
  purpleBlue: '/images/products/WhatsApp Image 2026-03-03 at 13.50.18 (8).jpeg',
  purpleStudio: '/images/products/WhatsApp Image 2026-03-03 at 13.50.18 (9).jpeg',
  sleeveless: '/images/products/WhatsApp Image 2026-03-03 at 13.50.18 (10).jpeg',
  bnwCollection: '/images/products/WhatsApp Image 2026-03-03 at 13.50.18 (11).jpeg',
  shoppingBnW: '/images/products/WhatsApp Image 2026-03-03 at 13.50.18 (12).jpeg',
  whiteFashion: '/images/products/WhatsApp Image 2026-03-03 at 13.50.18 (13).jpeg',
};

// Sample product data with real IISH images
const sampleProducts = [
  {
    name: 'IISH Classic White Tee',
    slug: 'iish-classic-white-tee',
    description: 'The signature IISH Classic White Tee features our iconic logo in premium embroidery. Made from 100% premium cotton, this shirt offers unmatched comfort and style for everyday wear. The minimalist design makes it perfect for any outfit.',
    shortDescription: 'Signature IISH logo tee in premium white cotton.',
    price: 15000,
    compareAtPrice: 18000,
    sku: 'IISH-RN-001',
    productType: 'round-neck',
    gender: 'unisex',
    material: '100% Premium Cotton',
    careInstructions: 'Machine wash cold, tumble dry low, do not bleach',
    weightKg: 0.3,
    isFeatured: true,
    isNewArrival: false,
    tags: 'iish,classic,white,logo,essential',
    categoryId: 1,
    images: [
      { url: PRODUCT_IMAGES.classicWhite, isPrimary: true },
      { url: PRODUCT_IMAGES.whiteFashion, isPrimary: false }
    ],
    sizes: [
      { size: 'S', quantity: 50 },
      { size: 'M', quantity: 75 },
      { size: 'L', quantity: 60 },
      { size: 'XL', quantity: 40 },
      { size: 'XXL', quantity: 25 }
    ]
  },
  {
    name: 'David Art Print Tee',
    slug: 'david-art-print-tee',
    description: 'Make a statement with our David Art Print Tee. Featuring a stunning artistic interpretation of classical sculpture with modern streetwear aesthetics. "Chic Beyond Compare" - this piece is truly one of a kind.',
    shortDescription: 'Artistic David print with "Chic Beyond Compare" design.',
    price: 18000,
    compareAtPrice: 22000,
    sku: 'IISH-RN-002',
    productType: 'round-neck',
    gender: 'unisex',
    material: '100% Premium Cotton',
    careInstructions: 'Machine wash cold, iron on low heat inside out',
    weightKg: 0.32,
    isFeatured: true,
    isNewArrival: true,
    tags: 'david,art,print,chic,sculpture,limited',
    categoryId: 1,
    images: [
      { url: PRODUCT_IMAGES.davidArt, isPrimary: true },
      { url: PRODUCT_IMAGES.crewShot, isPrimary: false }
    ],
    sizes: [
      { size: 'S', quantity: 30 },
      { size: 'M', quantity: 50 },
      { size: 'L', quantity: 45 },
      { size: 'XL', quantity: 30 }
    ]
  },
  {
    name: 'Hockey Mask Purple Tee',
    slug: 'hockey-mask-purple-tee',
    description: 'Stand out from the crowd with our Hockey Mask Purple Tee. The bold purple colorway combined with the edgy hockey mask graphic creates a perfect balance of street style and artistic expression.',
    shortDescription: 'Bold purple tee with edgy hockey mask graphic.',
    price: 16000,
    sku: 'IISH-RN-003',
    productType: 'round-neck',
    gender: 'unisex',
    material: 'Premium Cotton Blend',
    careInstructions: 'Machine wash cold, hang dry recommended',
    weightKg: 0.3,
    isFeatured: true,
    isNewArrival: true,
    tags: 'purple,hockey,mask,street,edgy,bold',
    categoryId: 1,
    images: [
      { url: PRODUCT_IMAGES.hockeyMask, isPrimary: true },
      { url: PRODUCT_IMAGES.purpleStudio, isPrimary: false }
    ],
    sizes: [
      { size: 'S', quantity: 25 },
      { size: 'M', quantity: 40 },
      { size: 'L', quantity: 35 },
      { size: 'XL', quantity: 20 },
      { size: 'XXL', quantity: 15 }
    ]
  },
  {
    name: 'Angel Blue Premium Tee',
    slug: 'angel-blue-premium-tee',
    description: 'The Angel Blue Premium Tee features a celestial design with our signature angel graphic. The vibrant blue color pops on any skin tone, making this a must-have piece for your streetwear collection.',
    shortDescription: 'Celestial angel design on vibrant blue premium cotton.',
    price: 20000,
    compareAtPrice: 25000,
    sku: 'IISH-RN-004',
    productType: 'round-neck',
    gender: 'unisex',
    material: '100% Premium Cotton',
    careInstructions: 'Machine wash cold, tumble dry low',
    weightKg: 0.32,
    isFeatured: true,
    isNewArrival: false,
    tags: 'angel,blue,premium,celestial,vibrant',
    categoryId: 1,
    images: [
      { url: PRODUCT_IMAGES.blueAngel, isPrimary: true },
      { url: PRODUCT_IMAGES.purpleBlue, isPrimary: false }
    ],
    sizes: [
      { size: 'S', quantity: 40 },
      { size: 'M', quantity: 55 },
      { size: 'L', quantity: 50 },
      { size: 'XL', quantity: 35 }
    ]
  },
  {
    name: 'Quality Control Blue Tee',
    slug: 'quality-control-blue-tee',
    description: 'Our Quality Control Blue Tee represents the pinnacle of IISH craftsmanship. The QC-125 branding paired with the classical statue graphic creates a timeless piece that transcends trends.',
    shortDescription: 'QC-125 branded tee with classical statue graphic.',
    price: 19000,
    sku: 'IISH-RN-005',
    productType: 'round-neck',
    gender: 'unisex',
    material: 'Premium Cotton Blend',
    careInstructions: 'Machine wash cold, tumble dry low',
    weightKg: 0.31,
    isFeatured: false,
    isNewArrival: true,
    tags: 'quality,control,qc,blue,statue,premium',
    categoryId: 1,
    images: [
      { url: PRODUCT_IMAGES.qualityControl, isPrimary: true }
    ],
    sizes: [
      { size: 'S', quantity: 35 },
      { size: 'M', quantity: 45 },
      { size: 'L', quantity: 40 },
      { size: 'XL', quantity: 30 }
    ]
  },
  {
    name: 'Purple Dream Tee',
    slug: 'purple-dream-tee',
    description: 'The Purple Dream Tee showcases the IISH logo in an elegant dark tone on a rich purple base. Perfect for those who appreciate subtle branding with maximum impact.',
    shortDescription: 'Rich purple tee with subtle IISH branding.',
    price: 17000,
    sku: 'IISH-RN-006',
    productType: 'round-neck',
    gender: 'unisex',
    material: '100% Cotton',
    careInstructions: 'Machine wash cold, do not bleach',
    weightKg: 0.3,
    isFeatured: false,
    isNewArrival: true,
    tags: 'purple,dream,iish,logo,subtle,elegant',
    categoryId: 1,
    images: [
      { url: PRODUCT_IMAGES.purpleStudio, isPrimary: true }
    ],
    sizes: [
      { size: 'S', quantity: 60 },
      { size: 'M', quantity: 80 },
      { size: 'L', quantity: 70 },
      { size: 'XL', quantity: 50 },
      { size: 'XXL', quantity: 30 }
    ]
  },
  {
    name: 'IISH Sleeveless White',
    slug: 'iish-sleeveless-white',
    description: 'Dominate the summer with our IISH Sleeveless White. The clean white base features our signature palm tree and logo design, perfect for staying cool while looking fresh.',
    shortDescription: 'Clean white sleeveless with palm tree logo design.',
    price: 14000,
    compareAtPrice: 16000,
    sku: 'IISH-SL-001',
    productType: 'sleeveless',
    gender: 'unisex',
    material: '100% Cotton',
    careInstructions: 'Machine wash cold, hang dry recommended',
    weightKg: 0.25,
    isFeatured: false,
    isNewArrival: true,
    tags: 'sleeveless,white,palm,summer,cool',
    categoryId: 2,
    images: [
      { url: PRODUCT_IMAGES.sleeveless, isPrimary: true }
    ],
    sizes: [
      { size: 'S', quantity: 30 },
      { size: 'M', quantity: 45 },
      { size: 'L', quantity: 40 },
      { size: 'XL', quantity: 25 }
    ]
  },
  {
    name: 'BnW Collection Tee',
    slug: 'bnw-collection-tee',
    description: 'The BnW (Black and White) Collection Tee features our iconic "IISH FASHION" branding with a mysterious silhouette graphic. Available in both black and white colorways.',
    shortDescription: 'Iconic BnW collection with IISH FASHION branding.',
    price: 18500,
    sku: 'IISH-RN-007',
    productType: 'round-neck',
    gender: 'unisex',
    material: 'Premium Cotton Blend',
    careInstructions: 'Machine wash cold, tumble dry low',
    weightKg: 0.32,
    isFeatured: false,
    isNewArrival: true,
    tags: 'bnw,black,white,collection,iconic,fashion',
    categoryId: 1,
    images: [
      { url: PRODUCT_IMAGES.bnwCollection, isPrimary: true },
      { url: PRODUCT_IMAGES.shoppingBnW, isPrimary: false }
    ],
    sizes: [
      { size: 'S', quantity: 40 },
      { size: 'M', quantity: 60 },
      { size: 'L', quantity: 55 },
      { size: 'XL', quantity: 40 }
    ]
  }
];

// Seed function
async function seed() {
  console.log('🌱 Starting IISH Fashion database seed...\n');

  try {
    // Create admin user
    console.log('Creating admin user...');
    const adminPassword = await bcrypt.hash('Admin@123', 10);
    
    try {
      await executeQuery(
        `INSERT INTO users (email, password_hash, first_name, last_name, phone, role, is_active, email_verified)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ['admin@iishfashion.com', adminPassword, 'Admin', 'User', '+2348000000000', 'ADMIN', true, true]
      );
      console.log('✅ Admin user created: admin@iishfashion.com / Admin@123');
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        console.log('ℹ️ Admin user already exists');
      } else {
        throw err;
      }
    }

    // Create sample customer
    console.log('Creating sample customer...');
    const customerPassword = await bcrypt.hash('Customer@123', 10);
    
    try {
      await executeQuery(
        `INSERT INTO users (email, password_hash, first_name, last_name, phone, role, is_active, email_verified)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ['customer@example.com', customerPassword, 'John', 'Doe', '+2348012345678', 'USER', true, true]
      );
      console.log('✅ Sample customer created: customer@example.com / Customer@123');
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        console.log('ℹ️ Sample customer already exists');
      } else {
        throw err;
      }
    }

    // Insert products
    console.log('\nCreating IISH Fashion products...');
    let productCount = 0;

    for (const product of sampleProducts) {
      try {
        // Check if product exists
        const existing = await executeQuery(
          'SELECT id FROM products WHERE slug = ?',
          [product.slug]
        );

        if (existing.length > 0) {
          console.log(`ℹ️ Product "${product.name}" already exists`);
          continue;
        }

        // Insert product
        const [productResult] = await pool.execute(
          `INSERT INTO products 
           (name, slug, description, short_description, price, compare_at_price, 
            sku, category_id, product_type, gender, material, care_instructions, 
            weight_kg, is_featured, is_new_arrival, tags, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            product.name, product.slug, product.description, product.shortDescription,
            product.price, product.compareAtPrice, product.sku, product.categoryId,
            product.productType, product.gender, product.material, product.careInstructions,
            product.weightKg, product.isFeatured, product.isNewArrival, product.tags, true
          ]
        );

        const productId = productResult.insertId;

        // Insert images
        for (let i = 0; i < product.images.length; i++) {
          const img = product.images[i];
          await pool.execute(
            `INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order)
             VALUES (?, ?, ?, ?, ?)`,
            [productId, img.url, product.name, img.isPrimary, i]
          );
        }

        // Insert inventory
        for (const size of product.sizes) {
          await pool.execute(
            `INSERT INTO product_inventory (product_id, size, quantity, low_stock_threshold)
             VALUES (?, ?, ?, ?)`,
            [productId, size.size, size.quantity, 5]
          );
        }

        console.log(`✅ Created: ${product.name}`);
        productCount++;

      } catch (err) {
        console.error(`❌ Error creating "${product.name}":`, err.message);
      }
    }

    console.log(`\n✅ Seed completed! Created ${productCount} IISH Fashion products.`);
    console.log('\n📋 Default Credentials:');
    console.log('   Admin:    admin@iishfashion.com / Admin@123');
    console.log('   Customer: customer@example.com / Customer@123');

  } catch (error) {
    console.error('\n❌ Seed failed:', error.message);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

// Run seed if executed directly
if (require.main === module) {
  seed();
}

module.exports = { seed };

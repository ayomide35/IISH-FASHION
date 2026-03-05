// Home page component
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Shield, RotateCcw, Star } from 'lucide-react';
import ProductCard from '../components/ProductCard';

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  primaryImage: string;
  productType: string;
  isFeatured: boolean;
  isNewArrival: boolean;
}

// IISH Fashion Product Images
const PRODUCT_IMAGES = {
  hero: '/images/products/WhatsApp Image 2026-03-03 at 13.50.18 (6).jpeg', // Group photo
  classicWhite: '/images/products/WhatsApp Image 2026-03-03 at 13.50.18.jpeg', // White IISH tee
  davidArt: '/images/products/WhatsApp Image 2026-03-03 at 13.50.18 (1).jpeg', // David statue design
  hockeyMask: '/images/products/WhatsApp Image 2026-03-03 at 13.50.18 (2).jpeg', // Purple hockey mask
  blueAngel: '/images/products/WhatsApp Image 2026-03-03 at 13.50.18 (4).jpeg', // Blue angel model
  qualityControl: '/images/products/WhatsApp Image 2026-03-03 at 13.50.18 (5).jpeg', // Quality Control model
  groupShot: '/images/products/WhatsApp Image 2026-03-03 at 13.50.18 (6).jpeg', // Group photo
  crewShot: '/images/products/WhatsApp Image 2026-03-03 at 13.50.18 (7).jpeg', // 4 models
  purpleBlue: '/images/products/WhatsApp Image 2026-03-03 at 13.50.18 (8).jpeg', // Purple & blue
  purpleStudio: '/images/products/WhatsApp Image 2026-03-03 at 13.50.18 (9).jpeg', // Purple studio
  sleeveless: '/images/products/WhatsApp Image 2026-03-03 at 13.50.18 (10).jpeg', // Sleeveless
  bnwCollection: '/images/products/WhatsApp Image 2026-03-03 at 13.50.18 (11).jpeg', // BnW collection
  shoppingBnW: '/images/products/WhatsApp Image 2026-03-03 at 13.50.18 (12).jpeg', // Shopping BnW
  whiteFashion: '/images/products/WhatsApp Image 2026-03-03 at 13.50.18 (13).jpeg', // White IISH Fashion
};

// Featured products with actual IISH images
const FEATURED_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'IISH Classic White Tee',
    slug: 'iish-classic-white-tee',
    price: 15000,
    compareAtPrice: 18000,
    primaryImage: PRODUCT_IMAGES.classicWhite,
    productType: 'round-neck',
    isFeatured: true,
    isNewArrival: false,
  },
  {
    id: 2,
    name: 'David Art Print Tee',
    slug: 'david-art-print-tee',
    price: 18000,
    compareAtPrice: 22000,
    primaryImage: PRODUCT_IMAGES.davidArt,
    productType: 'round-neck',
    isFeatured: true,
    isNewArrival: true,
  },
  {
    id: 3,
    name: 'Hockey Mask Purple Tee',
    slug: 'hockey-mask-purple-tee',
    price: 16000,
    primaryImage: PRODUCT_IMAGES.hockeyMask,
    productType: 'round-neck',
    isFeatured: true,
    isNewArrival: true,
  },
  {
    id: 4,
    name: 'Angel Blue Premium Tee',
    slug: 'angel-blue-premium-tee',
    price: 20000,
    compareAtPrice: 25000,
    primaryImage: PRODUCT_IMAGES.blueAngel,
    productType: 'round-neck',
    isFeatured: true,
    isNewArrival: false,
  },
];

const NEW_ARRIVALS: Product[] = [
  {
    id: 5,
    name: 'Quality Control Blue Tee',
    slug: 'quality-control-blue-tee',
    price: 19000,
    primaryImage: PRODUCT_IMAGES.qualityControl,
    productType: 'round-neck',
    isFeatured: false,
    isNewArrival: true,
  },
  {
    id: 6,
    name: 'Purple Dream Tee',
    slug: 'purple-dream-tee',
    price: 17000,
    primaryImage: PRODUCT_IMAGES.purpleStudio,
    productType: 'round-neck',
    isFeatured: false,
    isNewArrival: true,
  },
  {
    id: 7,
    name: 'IISH Sleeveless White',
    slug: 'iish-sleeveless-white',
    price: 14000,
    compareAtPrice: 16000,
    primaryImage: PRODUCT_IMAGES.sleeveless,
    productType: 'sleeveless',
    isFeatured: false,
    isNewArrival: true,
  },
  {
    id: 8,
    name: 'BnW Collection Tee',
    slug: 'bnw-collection-tee',
    price: 18500,
    primaryImage: PRODUCT_IMAGES.bnwCollection,
    productType: 'round-neck',
    isFeatured: false,
    isNewArrival: true,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={PRODUCT_IMAGES.crewShot}
            alt="IISH Fashion Collection"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        </div>

        {/* Content */}
        <div className="container relative z-10 pt-20">
          <div className="max-w-2xl text-white">
            <span className="inline-block px-4 py-2 bg-amber-500 text-gray-900 text-sm font-semibold rounded-full mb-6">
              New Collection 2024
            </span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold font-display mb-6 leading-tight">
              Define Your<br />
              <span className="text-amber-400">Street Style</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-lg">
              Premium Nigerian streetwear designed for the modern individual. 
              Crafted with quality, worn with confidence.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-8 py-4 bg-amber-500 text-gray-900 font-semibold rounded-lg hover:bg-amber-400 transition-colors"
              >
                Shop Now
                <ArrowRight size={20} />
              </Link>
              <Link
                to="/shop?newArrival=true"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors backdrop-blur-sm"
              >
                New Arrivals
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-white/50 rounded-full" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center gap-4 p-6 bg-white rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Truck className="text-amber-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Free Shipping</h3>
                <p className="text-sm text-gray-500">On orders over ₦50,000</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-6 bg-white rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="text-amber-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Secure Payment</h3>
                <p className="text-sm text-gray-500">100% secure checkout</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-6 bg-white rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <RotateCcw className="text-amber-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Easy Returns</h3>
                <p className="text-sm text-gray-500">30-day return policy</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20">
        <div className="container">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold font-display mb-2">Featured Products</h2>
              <p className="text-gray-500">Handpicked favorites from our collection</p>
            </div>
            <Link
              to="/shop?featured=true"
              className="hidden md:inline-flex items-center gap-2 text-amber-600 font-medium hover:text-amber-700 transition-colors"
            >
              View All
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURED_PRODUCTS.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link
              to="/shop?featured=true"
              className="inline-flex items-center gap-2 text-amber-600 font-medium"
            >
              View All Products
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Category Banner with Model Images */}
      <section className="py-20 bg-gray-900">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Round Neck */}
            <Link to="/shop/round-neck-shirts" className="group relative overflow-hidden rounded-2xl">
              <div className="aspect-[16/10]">
                <img
                  src={PRODUCT_IMAGES.purpleBlue}
                  alt="Round Neck Shirts"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <span className="text-amber-400 text-sm font-semibold uppercase tracking-wider">Collection</span>
                <h3 className="text-3xl font-bold text-white mt-2 mb-4">Round Neck Shirts</h3>
                <span className="inline-flex items-center gap-2 text-white font-medium group-hover:gap-3 transition-all">
                  Shop Now <ArrowRight size={18} />
                </span>
              </div>
            </Link>

            {/* Sleeveless */}
            <Link to="/shop/sleeveless-shirts" className="group relative overflow-hidden rounded-2xl">
              <div className="aspect-[16/10]">
                <img
                  src={PRODUCT_IMAGES.sleeveless}
                  alt="Sleeveless Shirts"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <span className="text-amber-400 text-sm font-semibold uppercase tracking-wider">Collection</span>
                <h3 className="text-3xl font-bold text-white mt-2 mb-4">Sleeveless Shirts</h3>
                <span className="inline-flex items-center gap-2 text-white font-medium group-hover:gap-3 transition-all">
                  Shop Now <ArrowRight size={18} />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-20">
        <div className="container">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold font-display mb-2">New Arrivals</h2>
              <p className="text-gray-500">The latest additions to our collection</p>
            </div>
            <Link
              to="/shop?newArrival=true"
              className="hidden md:inline-flex items-center gap-2 text-amber-600 font-medium hover:text-amber-700 transition-colors"
            >
              View All
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {NEW_ARRIVALS.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Lookbook Section */}
      <section className="py-20 bg-gray-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">IISH Lookbook</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">See how our community styles their IISH pieces. Tag us @iishfashion to be featured.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="aspect-square rounded-xl overflow-hidden">
              <img src={PRODUCT_IMAGES.groupShot} alt="IISH Lookbook 1" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="aspect-square rounded-xl overflow-hidden">
              <img src={PRODUCT_IMAGES.shoppingBnW} alt="IISH Lookbook 2" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="aspect-square rounded-xl overflow-hidden">
              <img src={PRODUCT_IMAGES.whiteFashion} alt="IISH Lookbook 3" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="aspect-square rounded-xl overflow-hidden">
              <img src={PRODUCT_IMAGES.crewShot} alt="IISH Lookbook 4" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-bold font-display text-center mb-12">
            What Our Customers Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Michael O.',
                location: 'Lagos, Nigeria',
                text: 'The quality of these shirts is unmatched. I\'ve been wearing IISH for months and they still look brand new.',
                rating: 5
              },
              {
                name: 'Sarah K.',
                location: 'Abuja, Nigeria',
                text: 'Finally, a Nigerian brand that understands streetwear. The fit is perfect and the designs are fire!',
                rating: 5
              },
              {
                name: 'David A.',
                location: 'Port Harcourt, Nigeria',
                text: 'Fast delivery, excellent packaging, and amazing quality. IISH has become my go-to for casual wear.',
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-sm">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={18} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6">"{testimonial.text}"</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container">
          <div className="relative bg-amber-500 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -right-20 -top-20 w-96 h-96 bg-white rounded-full" />
              <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-white rounded-full" />
            </div>
            <div className="relative px-8 py-16 md:px-16 md:py-20 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Ready to Upgrade Your Style?
              </h2>
              <p className="text-gray-800 text-lg max-w-2xl mx-auto mb-8">
                Join thousands of satisfied customers and discover why IISH Fashion 
                is Nigeria's premier streetwear brand.
              </p>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
              >
                Start Shopping
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, Share2, Truck, Shield, RotateCcw, Minus, Plus, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import ProductCard from '../components/ProductCard';

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  compareAtPrice?: number;
  sku: string;
  productType: string;
  gender: string;
  material: string;
  careInstructions: string;
  primaryImage?: string;
  images: {
    id: number;
    url: string;
    altText: string;
    isPrimary: boolean;
  }[];
  inventory: {
    id: number;
    size: string;
    color: string;
    quantity: number;
    availableQuantity: number;
  }[];
  category?: {
    name: string;
    slug: string;
  };
}

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const fetchRelatedProducts = useCallback(async (productType: string) => {
    try {
      const response = await fetch(`${API_URL}/products?productType=${productType}&limit=4`);
      const data = await response.json();
      
      if (data.success) {
        setRelatedProducts(data.data.products.filter((p: Product) => p.slug !== slug));
      }
    } catch (error) {
      console.error('Error fetching related products:', error);
    }
  }, [API_URL, slug]);

  const fetchProduct = useCallback(async () => {
    if (!slug) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/products/${slug}`);
      const data = await response.json();
      
      if (data.success) {
        setProduct(data.data.product);
        // Fetch related products
        void fetchRelatedProducts(data.data.product.productType);
      } else {
        toast.error('Product not found');
        navigate('/shop');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product');
    } finally {
      setIsLoading(false);
    }
  }, [API_URL, fetchRelatedProducts, navigate, slug]);

  useEffect(() => {
    void fetchProduct();
  }, [fetchProduct]);

  const handleAddToCart = async () => {
    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }

    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }

    setIsAddingToCart(true);
    const success = await addToCart(product!.id, selectedSize, quantity);
    setIsAddingToCart(false);
    
    if (success) {
      setQuantity(1);
      setSelectedSize('');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getAvailableQuantity = () => {
    if (!selectedSize || !product) return 0;
    const inventory = product.inventory.find(inv => inv.size === selectedSize);
    return inventory?.availableQuantity || 0;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="container">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="aspect-square bg-gray-200 rounded-lg" />
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4" />
                <div className="h-6 bg-gray-200 rounded w-1/4" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-12 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const discount = product.compareAtPrice 
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : null;

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-8">
          <span className="cursor-pointer hover:text-gray-900" onClick={() => navigate('/')}>Home</span>
          <span className="mx-2">/</span>
          <span className="cursor-pointer hover:text-gray-900" onClick={() => navigate('/shop')}>Shop</span>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {/* Images */}
          <div>
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
              <img
                src={product.images[selectedImage]?.url || 'https://via.placeholder.com/600'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? 'border-amber-500' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={image.altText}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">
                  {product.productType === 'round-neck' ? 'Round Neck' : 'Sleeveless'}
                </p>
                <h1 className="text-3xl md:text-4xl font-bold font-display">{product.name}</h1>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Heart
                    size={20}
                    className={isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'}
                  />
                </button>
                <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Share2 size={20} className="text-gray-600" />
                </button>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-3xl font-bold text-gray-900">
                {formatPrice(product.price)}
              </span>
              {product.compareAtPrice && (
                <>
                  <span className="text-xl text-gray-400 line-through">
                    {formatPrice(product.compareAtPrice)}
                  </span>
                  <span className="px-3 py-1 bg-red-100 text-red-600 text-sm font-semibold rounded-full">
                    Save {discount}%
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-600 mb-8">{product.shortDescription}</p>

            {/* Size Selection */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <label className="font-semibold">Select Size</label>
                <button className="text-sm text-amber-600 hover:underline">Size Guide</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.inventory.map((inv) => (
                  <button
                    key={inv.id}
                    onClick={() => setSelectedSize(inv.size)}
                    disabled={inv.availableQuantity === 0}
                    className={`relative px-4 py-2 border-2 rounded-lg font-medium transition-colors ${
                      selectedSize === inv.size
                        ? 'border-amber-500 bg-amber-50 text-amber-700'
                        : inv.availableQuantity === 0
                        ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {inv.size}
                    {inv.availableQuantity === 0 && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="w-full h-0.5 bg-gray-300 rotate-45" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
              {selectedSize && (
                <p className={`text-sm mt-2 ${getAvailableQuantity() < 5 ? 'text-red-500' : 'text-green-600'}`}>
                  {getAvailableQuantity() > 0 ? (
                    <>
                      <Check size={14} className="inline mr-1" />
                      {getAvailableQuantity()} items available
                    </>
                  ) : (
                    'Out of stock'
                  )}
                </p>
              )}
            </div>

            {/* Quantity */}
            <div className="mb-8">
              <label className="font-semibold block mb-3">Quantity</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-gray-50"
                  >
                    <Minus size={18} />
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(getAvailableQuantity(), quantity + 1))}
                    disabled={quantity >= getAvailableQuantity()}
                    className="p-3 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart || !selectedSize || getAvailableQuantity() === 0}
              className="w-full py-4 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-6"
            >
              {isAddingToCart ? 'Adding...' : 'Add to Cart'}
            </button>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 py-6 border-t border-gray-200">
              <div className="text-center">
                <Truck className="mx-auto mb-2 text-amber-600" size={24} />
                <p className="text-xs text-gray-500">Free Shipping<br />over ₦50k</p>
              </div>
              <div className="text-center">
                <Shield className="mx-auto mb-2 text-amber-600" size={24} />
                <p className="text-xs text-gray-500">Secure<br />Payment</p>
              </div>
              <div className="text-center">
                <RotateCcw className="mx-auto mb-2 text-amber-600" size={24} />
                <p className="text-xs text-gray-500">Easy 30-Day<br />Returns</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mb-20">
          <div className="border-b border-gray-200 mb-8">
            <div className="flex gap-8">
              <button className="pb-4 border-b-2 border-gray-900 font-semibold">
                Description
              </button>
            </div>
          </div>
          <div className="max-w-3xl">
            <p className="text-gray-600 leading-relaxed mb-8">{product.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Product Details</h3>
                <ul className="space-y-2 text-gray-600">
                  <li><span className="text-gray-400">SKU:</span> {product.sku}</li>
                  <li><span className="text-gray-400">Material:</span> {product.material}</li>
                  <li><span className="text-gray-400">Gender:</span> {product.gender}</li>
                  <li><span className="text-gray-400">Category:</span> {product.category?.name}</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Care Instructions</h3>
                <p className="text-gray-600">{product.careInstructions}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold font-display mb-8">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

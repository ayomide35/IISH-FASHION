import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useState } from 'react';

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  primaryImage?: string;
  productType: string;
  isFeatured?: boolean;
  isNewArrival?: boolean;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(price);
  };

  const discount = product.compareAtPrice 
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : null;

  return (
    <div className="group">
      {/* Image Container */}
      <Link to={`/product/${product.slug}`} className="relative block overflow-hidden rounded-lg bg-gray-100">
        <div className="aspect-[3/4] relative">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
          )}
          <img
            src={product.primaryImage || 'https://via.placeholder.com/400x533?text=No+Image'}
            alt={product.name}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
          />
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.isNewArrival && (
            <span className="px-3 py-1 bg-amber-500 text-gray-900 text-xs font-semibold rounded-full">
              New
            </span>
          )}
          {discount && (
            <span className="px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">
              -{discount}%
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            setIsWishlisted(!isWishlisted);
          }}
          className="absolute top-3 right-3 w-10 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
        >
          <Heart
            size={18}
            className={`transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
          />
        </button>

        {/* Quick Add Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="w-full py-3 bg-white text-gray-900 font-semibold text-sm rounded-lg hover:bg-gray-100 transition-colors">
            Quick View
          </button>
        </div>
      </Link>

      {/* Product Info */}
      <div className="mt-4">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
          {product.productType === 'round-neck' ? 'Round Neck' : 'Sleeveless'}
        </p>
        <Link to={`/product/${product.slug}`}>
          <h3 className="font-medium text-gray-900 group-hover:text-amber-600 transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-2 mt-2">
          <span className="font-semibold text-gray-900">
            {formatPrice(product.price)}
          </span>
          {product.compareAtPrice && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

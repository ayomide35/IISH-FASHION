import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, X } from 'lucide-react';
import { toast } from 'sonner';

interface WishlistItem {
  id: number;
  productId: number;
  productName: string;
  productSlug: string;
  productImage: string;
  price: number;
  compareAtPrice?: number;
  productType: string;
  isActive: boolean;
}

export default function Wishlist() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const fetchWishlist = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/wishlist`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setItems(data.data.items);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    void fetchWishlist();
  }, [fetchWishlist]);

  const removeFromWishlist = async (productId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/wishlist/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setItems((currentItems) => currentItems.filter((item) => item.productId !== productId));
        toast.success('Removed from wishlist');
      }
    } catch {
      toast.error('Failed to remove item');
    }
  };

  const moveToCart = async () => {
    toast.info('Please select size on product page');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="container">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-gray-200 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="container">
          <div className="max-w-xl mx-auto text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart size={40} className="text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Your Wishlist is Empty</h1>
            <p className="text-gray-500 mb-8">Save items you love to your wishlist.</p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="container">
        <h1 className="text-3xl font-bold font-display mb-2">My Wishlist</h1>
        <p className="text-gray-500 mb-8">{items.length} items saved</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <div key={item.id} className="group relative">
              <Link to={`/product/${item.productSlug}`}>
                <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden mb-4">
                  <img
                    src={item.productImage || 'https://via.placeholder.com/400'}
                    alt={item.productName}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  {item.productType === 'round-neck' ? 'Round Neck' : 'Sleeveless'}
                </p>
                <h3 className="font-medium text-gray-900 group-hover:text-amber-600 transition-colors">
                  {item.productName}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-semibold">{formatPrice(item.price)}</span>
                  {item.compareAtPrice && (
                    <span className="text-sm text-gray-400 line-through">
                      {formatPrice(item.compareAtPrice)}
                    </span>
                  )}
                </div>
              </Link>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={moveToCart}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <ShoppingBag size={16} />
                  Add to Cart
                </button>
                <button
                  onClick={() => removeFromWishlist(item.productId)}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-red-50 hover:border-red-300 hover:text-red-500 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

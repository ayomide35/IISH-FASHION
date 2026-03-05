import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Truck } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

export default function Cart() {
  const { cart, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();
  const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set());

  const handleUpdateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setUpdatingItems(prev => new Set(prev).add(itemId));
    await updateQuantity(itemId, newQuantity);
    setUpdatingItems(prev => {
      const next = new Set(prev);
      next.delete(itemId);
      return next;
    });
  };

  const handleRemoveItem = async (itemId: number) => {
    setUpdatingItems(prev => new Set(prev).add(itemId));
    await removeItem(itemId);
    setUpdatingItems(prev => {
      const next = new Set(prev);
      next.delete(itemId);
      return next;
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(price);
  };

  const subtotal = cart.subtotal;
  const shipping = subtotal >= 50000 ? 0 : 2500;
  const total = subtotal + shipping;

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="container">
          <div className="max-w-xl mx-auto text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag size={40} className="text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Your Cart is Empty</h1>
            <p className="text-gray-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
            >
              Start Shopping
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="container">
        <h1 className="text-3xl font-bold font-display mb-8">Shopping Cart</h1>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Cart Items */}
          <div className="flex-1">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-gray-50 text-sm font-medium text-gray-500">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-right">Price</div>
                <div className="col-span-2 text-right">Total</div>
              </div>

              {/* Items */}
              <div className="divide-y divide-gray-200">
                {cart.items.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 md:grid md:grid-cols-12 md:gap-4 items-center ${
                      updatingItems.has(item.id) ? 'opacity-50' : ''
                    }`}
                  >
                    {/* Product */}
                    <div className="md:col-span-6 flex gap-4 mb-4 md:mb-0">
                      <Link
                        to={`/product/${item.productSlug}`}
                        className="w-20 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0"
                      >
                        <img
                          src={item.productImage || 'https://via.placeholder.com/100'}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                        />
                      </Link>
                      <div>
                        <Link
                          to={`/product/${item.productSlug}`}
                          className="font-medium text-gray-900 hover:text-amber-600 transition-colors"
                        >
                          {item.productName}
                        </Link>
                        <p className="text-sm text-gray-500 mt-1">Size: {item.size}</p>
                        <p className="text-sm text-gray-500">
                          {formatPrice(item.unitPrice)} each
                        </p>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="md:hidden flex items-center gap-1 text-red-500 text-sm mt-2"
                        >
                          <Trash2 size={14} />
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Quantity */}
                    <div className="md:col-span-2 flex items-center justify-between md:justify-center mb-4 md:mb-0">
                      <span className="md:hidden text-sm text-gray-500">Quantity:</span>
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1 || updatingItems.has(item.id)}
                          className="p-2 hover:bg-gray-50 disabled:opacity-50"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-10 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.availableQuantity || updatingItems.has(item.id)}
                          className="p-2 hover:bg-gray-50 disabled:opacity-50"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Unit Price */}
                    <div className="md:col-span-2 flex items-center justify-between md:justify-end mb-2 md:mb-0">
                      <span className="md:hidden text-sm text-gray-500">Price:</span>
                      <span className="text-gray-600">{formatPrice(item.unitPrice)}</span>
                    </div>

                    {/* Total */}
                    <div className="md:col-span-2 flex items-center justify-between md:justify-end">
                      <span className="md:hidden text-sm text-gray-500">Total:</span>
                      <div className="flex items-center gap-4">
                        <span className="font-semibold">{formatPrice(item.totalPrice)}</span>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="hidden md:block p-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Continue Shopping */}
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 text-amber-600 font-medium mt-6 hover:text-amber-700 transition-colors"
            >
              <ArrowRight size={18} className="rotate-180" />
              Continue Shopping
            </Link>
          </div>

          {/* Order Summary */}
          <div className="lg:w-96">
            <div className="bg-gray-50 rounded-xl p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cart.itemCount} items)</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span className="flex items-center gap-2">
                    <Truck size={18} />
                    Shipping
                  </span>
                  <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
                </div>
                {shipping > 0 && (
                  <p className="text-sm text-amber-600">
                    Add {formatPrice(50000 - subtotal)} more for free shipping!
                  </p>
                )}
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Including VAT</p>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full py-4 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
              >
                Proceed to Checkout
              </button>

              <div className="mt-6 text-center">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/7/78/Visa_Inc._logo.svg"
                  alt="Visa"
                  className="h-6 inline-block mx-2 opacity-50"
                />
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"
                  alt="Mastercard"
                  className="h-6 inline-block mx-2 opacity-50"
                />
                <p className="text-xs text-gray-400 mt-2">Secure checkout powered by Paystack</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

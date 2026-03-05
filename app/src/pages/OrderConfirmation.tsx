import { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Package, Truck, Clock } from 'lucide-react';

interface Order {
  id: number;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  pricing: {
    subtotal: number;
    shippingCost: number;
    totalAmount: number;
    currency: string;
  };
  items: {
    id: number;
    productName: string;
    size: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    imageUrl: string;
  }[];
  shippingAddress: {
    firstName: string;
    lastName: string;
    address1: string;
    city: string;
    state: string;
  };
  createdAt: string;
}

export default function OrderConfirmation() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const fetchOrder = useCallback(async () => {
    if (!orderId) {
      setIsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setOrder(data.data.order);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setIsLoading(false);
    }
  }, [API_URL, orderId]);

  useEffect(() => {
    void fetchOrder();
  }, [fetchOrder]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(price);
  };



  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="container text-center">
          <h1 className="text-2xl font-bold mb-4">Order not found</h1>
          <Link to="/shop" className="text-amber-600 hover:underline">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16 bg-gray-50">
      <div className="container">
        <div className="max-w-3xl mx-auto">
          {/* Success Header */}
          <div className="bg-white rounded-xl p-8 text-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="text-green-600" size={40} />
            </div>
            <h1 className="text-3xl font-bold font-display mb-2">Order Confirmed!</h1>
            <p className="text-gray-500 mb-4">
              Thank you for your purchase. Your order has been received.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
              <span className="text-gray-600">Order Number:</span>
              <span className="font-semibold">{order.orderNumber}</span>
            </div>
          </div>

          {/* Order Status */}
          <div className="bg-white rounded-xl p-6 mb-6">
            <h2 className="text-lg font-bold mb-6">Order Status</h2>
            <div className="flex items-center justify-between">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-2">
                  <CheckCircle className="text-white" size={24} />
                </div>
                <span className="text-sm font-medium">Confirmed</span>
              </div>
              <div className="flex-1 h-1 bg-gray-200 mx-2">
                <div className="h-full bg-green-500 w-1/3"></div>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                  <Package className="text-gray-400" size={24} />
                </div>
                <span className="text-sm text-gray-500">Processing</span>
              </div>
              <div className="flex-1 h-1 bg-gray-200 mx-2"></div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                  <Truck className="text-gray-400" size={24} />
                </div>
                <span className="text-sm text-gray-500">Shipped</span>
              </div>
              <div className="flex-1 h-1 bg-gray-200 mx-2"></div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                  <Clock className="text-gray-400" size={24} />
                </div>
                <span className="text-sm text-gray-500">Delivered</span>
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="bg-white rounded-xl p-6 mb-6">
            <h2 className="text-lg font-bold mb-4">Order Details</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-20 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={item.imageUrl || 'https://via.placeholder.com/100'}
                      alt={item.productName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-sm text-gray-500">Size: {item.size} × {item.quantity}</p>
                    <p className="font-semibold mt-1">{formatPrice(item.totalPrice)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 mt-6 pt-4 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(order.pricing.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{order.pricing.shippingCost === 0 ? 'Free' : formatPrice(order.pricing.shippingCost)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>{formatPrice(order.pricing.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-xl p-6 mb-6">
            <h2 className="text-lg font-bold mb-4">Shipping Address</h2>
            <p className="text-gray-600">
              {order.shippingAddress.firstName} {order.shippingAddress.lastName}<br />
              {order.shippingAddress.address1}<br />
              {order.shippingAddress.city}, {order.shippingAddress.state}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to={`/track-order/${order.orderNumber}`}
              className="flex-1 py-3 bg-gray-900 text-white text-center font-semibold rounded-lg hover:bg-gray-800 transition-colors"
            >
              Track Order
            </Link>
            <Link
              to="/shop"
              className="flex-1 py-3 border border-gray-300 text-gray-700 text-center font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

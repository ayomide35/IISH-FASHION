import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Search, Package, Truck, CheckCircle, MapPin } from 'lucide-react';
import { toast } from 'sonner';

interface Order {
  id: number;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  trackingNumber?: string;
  pricing: {
    totalAmount: number;
  };
  items: {
    productName: string;
    quantity: number;
    imageUrl: string;
  }[];
  shipping: {
    shippedAt?: string;
    deliveredAt?: string;
  };
  createdAt: string;
}

export default function OrderTracking() {
  const { orderNumber: urlOrderNumber } = useParams<{ orderNumber: string }>();
  const [orderNumber, setOrderNumber] = useState(urlOrderNumber || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const trackOrderByNumber = useCallback(async (orderToTrack: string) => {
    if (!orderToTrack.trim()) {
      toast.error('Please enter an order number');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/orders/track/${orderToTrack}`);
      const data = await response.json();

      if (response.ok) {
        setOrder(data.data.order);
      } else {
        toast.error(data.message || 'Order not found');
        setOrder(null);
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [API_URL]);

  const trackOrder = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await trackOrderByNumber(orderNumber);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(price);
  };



  // Auto-track if order number is in URL
  useEffect(() => {
    if (urlOrderNumber) {
      setOrderNumber(urlOrderNumber);
      void trackOrderByNumber(urlOrderNumber);
    }
  }, [urlOrderNumber, trackOrderByNumber]);

  return (
    <div className="min-h-screen pt-20 pb-16 bg-gray-50">
      <div className="container">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold font-display mb-2">Track Your Order</h1>
            <p className="text-gray-500">Enter your order number to check the status</p>
          </div>

          {/* Search Form */}
          <form onSubmit={trackOrder} className="mb-8">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="Enter order number (e.g., IISH123456789)"
                  className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-4 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Tracking...' : 'Track'}
              </button>
            </div>
          </form>

          {/* Order Details */}
          {order && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Header */}
              <div className="bg-gray-900 text-white p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-gray-400 text-sm">Order Number</p>
                    <p className="text-2xl font-bold">{order.orderNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-sm">Total</p>
                    <p className="text-xl font-bold">{formatPrice(order.pricing.totalAmount)}</p>
                  </div>
                </div>
                {order.trackingNumber && (
                  <div className="flex items-center gap-2 text-sm">
                    <Truck size={16} />
                    <span>Tracking: {order.trackingNumber}</span>
                  </div>
                )}
              </div>

              {/* Status Timeline */}
              <div className="p-6 border-b border-gray-200">
                <h3 className="font-bold mb-6">Order Status</h3>
                <div className="relative">
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                  
                  {[
                    { status: 'Order Placed', date: order.createdAt, icon: CheckCircle, completed: true },
                    { status: 'Order Confirmed', date: order.status !== 'pending' ? order.createdAt : null, icon: Package, completed: order.status !== 'pending' },
                    { status: 'Shipped', date: order.shipping.shippedAt, icon: Truck, completed: ['shipped', 'delivered'].includes(order.status) },
                    { status: 'Delivered', date: order.shipping.deliveredAt, icon: MapPin, completed: order.status === 'delivered' }
                  ].map((step, index) => (
                    <div key={index} className="relative flex items-start gap-4 mb-6 last:mb-0">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center z-10 ${
                        step.completed ? 'bg-green-500' : 'bg-gray-200'
                      }`}>
                        <step.icon className={step.completed ? 'text-white' : 'text-gray-400'} size={20} />
                      </div>
                      <div>
                        <p className={`font-semibold ${step.completed ? 'text-gray-900' : 'text-gray-400'}`}>
                          {step.status}
                        </p>
                        {step.date && (
                          <p className="text-sm text-gray-500">
                            {new Date(step.date).toLocaleDateString('en-NG', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Items */}
              <div className="p-6">
                <h3 className="font-bold mb-4">Order Items</h3>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="w-16 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.imageUrl || 'https://via.placeholder.com/100'}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

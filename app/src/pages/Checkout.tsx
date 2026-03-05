import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { CreditCard, Truck, MapPin, ChevronRight, Lock } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

interface ShippingAddress {
  firstName: string;
  lastName: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
}

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, refreshCart } = useCart();
  const { user } = useAuth();
  
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [useSameAddress] = useState(true);
  const [shippingMethod, setShippingMethod] = useState('standard');
  
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    phone: ''
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(price);
  };

  const subtotal = cart.subtotal;
  const shippingCost = shippingMethod === 'express' ? 4500 : subtotal >= 50000 ? 0 : 2500;
  const total = subtotal + shippingCost;

  const handleAddressChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress(prev => ({ ...prev, [field]: value }));
  };

  const validateAddress = () => {
    const required = ['firstName', 'lastName', 'address1', 'city', 'state', 'phone'];
    return required.every(field => shippingAddress[field as keyof ShippingAddress]);
  };

  const handleCreateOrder = async () => {
    if (!validateAddress()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsProcessing(true);
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          shippingAddress,
          billingAddress: useSameAddress ? shippingAddress : shippingAddress,
          shippingMethod,
          useSameAddress
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Order created successfully!');
        await refreshCart();
        
        // Initialize payment
        const paymentResponse = await fetch(`${API_URL}/payments/initialize`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            orderId: data.data.order.id,
            paymentMethod: 'card'
          })
        });

        const paymentData = await paymentResponse.json();

        if (paymentResponse.ok) {
          // Redirect to Paystack
          window.location.href = paymentData.data.authorizationUrl;
        } else {
          navigate(`/order-confirmation/${data.data.order.id}`);
        }
      } else {
        toast.error(data.message || 'Failed to create order');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="container">
          <div className="max-w-xl mx-auto text-center py-16">
            <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
            <p className="text-gray-500 mb-8">Add some items to your cart before checking out.</p>
            <button
              onClick={() => navigate('/shop')}
              className="px-8 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16 bg-gray-50">
      <div className="container">
        <h1 className="text-3xl font-bold font-display mb-8">Checkout</h1>

        {/* Progress */}
        <div className="flex items-center gap-4 mb-8">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-gray-900' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
              step >= 1 ? 'bg-gray-900 text-white' : 'bg-gray-200'
            }`}>1</div>
            <span className="hidden sm:inline font-medium">Shipping</span>
          </div>
          <ChevronRight className="text-gray-400" size={20} />
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-gray-900' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
              step >= 2 ? 'bg-gray-900 text-white' : 'bg-gray-200'
            }`}>2</div>
            <span className="hidden sm:inline font-medium">Payment</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {step === 1 && (
              <div className="space-y-6">
                {/* Shipping Address */}
                <div className="bg-white rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <MapPin className="text-amber-600" size={24} />
                    <h2 className="text-xl font-bold">Shipping Address</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.firstName}
                        onChange={(e) => handleAddressChange('firstName', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.lastName}
                        onChange={(e) => handleAddressChange('lastName', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address Line 1 *
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.address1}
                        onChange={(e) => handleAddressChange('address1', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address Line 2
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.address2}
                        onChange={(e) => handleAddressChange('address2', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.city}
                        onChange={(e) => handleAddressChange('city', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State *
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.state}
                        onChange={(e) => handleAddressChange('state', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.postalCode}
                        onChange={(e) => handleAddressChange('postalCode', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={shippingAddress.phone}
                        onChange={(e) => handleAddressChange('phone', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Shipping Method */}
                <div className="bg-white rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Truck className="text-amber-600" size={24} />
                    <h2 className="text-xl font-bold">Shipping Method</h2>
                  </div>

                  <div className="space-y-3">
                    <label className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      shippingMethod === 'standard' ? 'border-amber-500 bg-amber-50' : 'border-gray-200'
                    }`}>
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shipping"
                          value="standard"
                          checked={shippingMethod === 'standard'}
                          onChange={() => setShippingMethod('standard')}
                          className="w-4 h-4 text-amber-500"
                        />
                        <div>
                          <p className="font-medium">Standard Shipping</p>
                          <p className="text-sm text-gray-500">3-5 business days</p>
                        </div>
                      </div>
                      <span className="font-semibold">
                        {subtotal >= 50000 ? 'Free' : formatPrice(2500)}
                      </span>
                    </label>

                    <label className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      shippingMethod === 'express' ? 'border-amber-500 bg-amber-50' : 'border-gray-200'
                    }`}>
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shipping"
                          value="express"
                          checked={shippingMethod === 'express'}
                          onChange={() => setShippingMethod('express')}
                          className="w-4 h-4 text-amber-500"
                        />
                        <div>
                          <p className="font-medium">Express Shipping</p>
                          <p className="text-sm text-gray-500">1-2 business days</p>
                        </div>
                      </div>
                      <span className="font-semibold">{formatPrice(4500)}</span>
                    </label>
                  </div>
                </div>

                <button
                  onClick={() => setStep(2)}
                  disabled={!validateAddress()}
                  className="w-full py-4 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  Continue to Payment
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                {/* Payment */}
                <div className="bg-white rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <CreditCard className="text-amber-600" size={24} />
                    <h2 className="text-xl font-bold">Payment Method</h2>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6 text-center">
                    <Lock className="mx-auto mb-4 text-gray-400" size={32} />
                    <p className="text-gray-600 mb-2">Secure payment powered by Paystack</p>
                    <p className="text-sm text-gray-500">
                      You will be redirected to complete your payment securely
                    </p>
                  </div>

                  <div className="flex items-center gap-4 mt-6">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/7/78/Visa_Inc._logo.svg"
                      alt="Visa"
                      className="h-8"
                    />
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg"
                      alt="Mastercard"
                      className="h-8"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 py-4 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleCreateOrder}
                    disabled={isProcessing}
                    className="flex-1 py-4 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    {isProcessing ? 'Processing...' : `Pay ${formatPrice(total)}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:w-96">
            <div className="bg-white rounded-xl p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>

              {/* Items */}
              <div className="space-y-4 mb-6 max-h-64 overflow-auto">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.productImage || 'https://via.placeholder.com/100'}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.productName}</p>
                      <p className="text-xs text-gray-500">Size: {item.size} × {item.quantity}</p>
                      <p className="text-sm font-semibold">{formatPrice(item.totalPrice)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}</span>
                </div>
              </div>

              <div className="border-t border-gray-200 mt-4 pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

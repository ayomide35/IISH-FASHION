import { useCallback, useEffect, useState } from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  Package, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface DashboardStats {
  overview: {
    totalOrders: number;
    pendingOrders: number;
    totalRevenue: number;
    todayRevenue: number;
    totalCustomers: number;
    newCustomersToday: number;
    totalProducts: number;
  };
  recentOrders: {
    id: number;
    orderNumber: string;
    customer: string;
    email: string;
    totalAmount: number;
    status: string;
    paymentStatus: string;
    createdAt: string;
  }[];
  salesChart: {
    date: string;
    orders: number;
    revenue: number;
  }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const fetchDashboardStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    void fetchDashboardStats();
  }, [fetchDashboardStats]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    { 
      title: 'Total Revenue', 
      value: formatPrice(stats.overview.totalRevenue), 
      icon: DollarSign,
      change: '+12%',
      trend: 'up'
    },
    { 
      title: 'Total Orders', 
      value: stats.overview.totalOrders.toString(), 
      icon: ShoppingBag,
      change: '+8%',
      trend: 'up'
    },
    { 
      title: 'Total Customers', 
      value: stats.overview.totalCustomers.toString(), 
      icon: Users,
      change: '+15%',
      trend: 'up'
    },
    { 
      title: 'Products', 
      value: stats.overview.totalProducts.toString(), 
      icon: Package,
      change: '0%',
      trend: 'neutral'
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-500">Welcome back! Here's what's happening with your store.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <card.icon className="text-amber-600" size={24} />
              </div>
              <div className={`flex items-center gap-1 text-sm ${
                card.trend === 'up' ? 'text-green-600' : 
                card.trend === 'down' ? 'text-red-600' : 'text-gray-500'
              }`}>
                {card.trend === 'up' && <ArrowUpRight size={16} />}
                {card.trend === 'down' && <ArrowDownRight size={16} />}
                {card.change}
              </div>
            </div>
            <p className="text-gray-500 text-sm">{card.title}</p>
            <p className="text-2xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold">Recent Orders</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium">{order.orderNumber}</p>
                      <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium">{order.customer}</p>
                      <p className="text-sm text-gray-500">{order.email}</p>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {formatPrice(order.totalAmount)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'processing' ? 'bg-amber-100 text-amber-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold mb-4">Today's Overview</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Revenue</span>
                <span className="font-semibold">{formatPrice(stats.overview.todayRevenue)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Pending Orders</span>
                <span className="font-semibold">{stats.overview.pendingOrders}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">New Customers</span>
                <span className="font-semibold">{stats.overview.newCustomersToday}</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 text-white">
            <TrendingUp className="mb-4 text-amber-400" size={32} />
            <h3 className="text-lg font-bold mb-2">Sales Performance</h3>
            <p className="text-gray-400 text-sm mb-4">
              Your store is performing well! Revenue is up 12% compared to last month.
            </p>
            <button className="text-amber-400 text-sm font-medium hover:underline">
              View Detailed Report →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  CreditCard, 
  MapPin, 
  TrendingUp,
  Package,
  Car,
  User
} from 'lucide-react';
import { apiService } from '../../services/api';
import { formatCurrency } from '../../utils/helpers';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load dashboard statistics
      const statsResponse = await apiService.getAdminDashboard();
      setStats(statsResponse.data);

      // Load recent bookings
      const bookingsResponse = await apiService.getAdminBookings();
      setRecentBookings(bookingsResponse.data?.bookings || []);

      // Load recent payments
      const paymentsResponse = await apiService.getAdminPayments();
      setRecentPayments(paymentsResponse.data?.payments || []);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <LoadingSpinner size="large" text="Loading dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <ErrorMessage error={error} />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Overview of your travel business</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Bookings</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats?.total_bookings || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
            <span className="text-green-600">+12%</span>
            <span className="text-gray-500 ml-2">from last month</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {formatCurrency(stats?.total_revenue || 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
            <span className="text-green-600">+8%</span>
            <span className="text-gray-500 ml-2">from last month</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Customers</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats?.total_customers || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
            <span className="text-green-600">+5%</span>
            <span className="text-gray-500 ml-2">from last month</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Payments</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {stats?.pending_payments || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-yellow-600">Needs attention</span>
          </div>
        </div>
      </div>

      {/* Recent Bookings & Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Bookings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
          </div>
          <div className="p-6">
            {recentBookings.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No recent bookings</p>
            ) : (
              <div className="space-y-4">
                {recentBookings.slice(0, 5).map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">#{booking.id}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{booking.user_name}</p>
                      <p className="text-sm text-gray-500">{formatCurrency(booking.total_price)}</p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      booking.booking_status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      booking.booking_status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {booking.booking_status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Payments</h2>
          </div>
          <div className="p-6">
            {recentPayments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No recent payments</p>
            ) : (
              <div className="space-y-4">
                {recentPayments.slice(0, 5).map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <CreditCard className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">#{payment.id}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{payment.payment_method}</p>
                      <p className="text-sm text-gray-500">{formatCurrency(payment.amount)}</p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      payment.status === 'paid' ? 'bg-green-100 text-green-700' :
                      payment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      payment.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {payment.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

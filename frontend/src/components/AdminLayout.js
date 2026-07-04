import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  CreditCard,
  Users,
  MapPin,
  Building,
  Car,
  User,
  Package,
  Settings,
  ClipboardList,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/bookings', icon: Calendar, label: 'Bookings' },
    { path: '/admin/payments', icon: CreditCard, label: 'Payments' },
    { path: '/admin/customers', icon: Users, label: 'Customers' },
    { path: '/admin/destinations', icon: MapPin, label: 'Destinations' },
    { path: '/admin/hotels', icon: Building, label: 'Hotels' },
    { path: '/admin/vehicles', icon: Car, label: 'Vehicles' },
    { path: '/admin/tour-guides', icon: User, label: 'Tour Guides' },
    { path: '/admin/packages', icon: Package, label: 'Packages' },
    { path: '/admin/settings', icon: Settings, label: 'Settings' },
    { path: '/admin/activity-logs', icon: ClipboardList, label: 'Activity Log' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-slate-900 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-xl font-bold text-white">Admin Panel</h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-800 rounded-lg text-white"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex flex-col h-full pt-16 lg:pt-0">
          {/* Logo */}
          <div className="px-6 py-6 border-b border-slate-700">
            <h1 className="text-xl font-bold text-white">Admin Panel</h1>
            <p className="text-sm text-slate-400 mt-1">Wisata Management</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="px-4 py-4 border-t border-slate-700">
            <div className="mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user?.name || 'Admin'}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {user?.email || 'admin@wisata.com'}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-red-400 hover:bg-slate-800 hover:text-red-300 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 ml-0 lg:ml-64 pt-16 lg:pt-0 overflow-y-auto bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;

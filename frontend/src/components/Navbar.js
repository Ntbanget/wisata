import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, MapPin, Bell, UserCircle, LogOut, Compass, Package, CalendarClock, Home, Info, Send, Map, ChevronDown } from 'lucide-react';
import apiService from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { user, token, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const publicNavigation = [
    { name: 'Home', href: '/' },
    { name: 'About Us', href: '/about' },
    { name: 'Destinations', href: '/#destinations' },
    { name: 'Packages', href: '/#packages' },
    { name: 'Contact', href: '/contact' },
  ];

  const userNavigation = [
    { name: 'Home', href: '/customer/home', icon: Home },
    { name: 'Packages', href: '/packages', icon: Package },
    { name: 'Explore Map', href: '/explore', icon: Map },
    { name: 'My Bookings', href: '/customer/bookings', icon: CalendarClock },
  ];
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const loadUnread = async () => {
      try {
        if (token && user && user.role !== 'admin') {
          const res = await apiService.getNotificationsUnreadCount();
          const count = res?.data?.unread_count ?? res?.unread_count ?? 0;
          setUnreadCount(count);
        }
      } catch (err) {
        console.warn('Failed to load unread count', err);
        setUnreadCount(0);
      }
    };

    loadUnread();
  }, [token, user]);

  const handleNavigation = (path) => {
    navigate(path);
    setIsOpen(false);
    if (path === '/notifications') {
      setUnreadCount(0);
    }
  };

  const navigationItems = token && user && user.role !== 'admin' ? userNavigation : publicNavigation;

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur border-b border-slate-200/80 shadow-sm' 
        : 'bg-white/80 backdrop-blur-sm shadow-sm'
    }`}>
      <div className="container">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-emerald-500 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-slate-900">
              Wisata<span className="text-indigo-600">Jateng</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-sm font-medium transition-colors duration-200 ${
                  location.pathname === item.href || (item.href.startsWith('/#') && location.pathname === '/')
                    ? 'text-indigo-600'
                    : 'text-slate-600 hover:text-indigo-600'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {token && user && user.role !== 'admin' ? (
              <>
                <button
                  onClick={() => handleNavigation('/notifications')}
                  className="relative p-2 rounded-full hover:bg-slate-100 transition-colors"
                  title="Pesan Saya"
                >
                  <Bell className="w-5 h-5 text-slate-700" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] rounded-full px-1.5">{unreadCount}</span>
                  )}
                </button>
                <div className="relative">
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:border-indigo-200 hover:text-indigo-600"
                  >
                    <UserCircle className="w-4 h-4" />
                    {user.name?.split(' ')[0] || 'Profil'}
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      <Link
                        to="/customer/profile"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Profil Saya
                      </Link>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    logout();
                    handleNavigation('/');
                  }}
                  className="rounded-full border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:border-rose-200 hover:text-rose-600"
                >
                  <span className="flex items-center gap-2"><LogOut className="w-4 h-4" /> Logout</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleNavigation('/login')}
                  className="rounded-full border border-indigo-200 px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
                >
                  Login
                </button>
                <button
                  onClick={() => handleNavigation('/register')}
                  className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
                >
                  Register
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-2">
              {navigationItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                  className={`text-left px-4 py-3 rounded-xl transition-colors duration-200 ${
                    location.pathname === item.href
                      ? 'bg-indigo-50 text-indigo-600 font-medium'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {item.icon && <item.icon className="w-4 h-4" />}
                    {item.name}
                  </span>
                </button>
              ))}
              {token && user && user.role !== 'admin' ? (
                <>
                  <button
                    onClick={() => handleNavigation('/notifications')}
                    className="text-left px-4 py-3 rounded-xl transition-colors duration-200 text-slate-700 hover:bg-slate-50"
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2"><Bell className="w-4 h-4" /></span>
                      {unreadCount > 0 && <span className="bg-rose-500 text-white text-xs rounded-full px-2">{unreadCount}</span>}
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      handleNavigation('/');
                    }}
                    className="text-left px-4 py-3 rounded-xl transition-colors duration-200 text-slate-700 hover:bg-slate-50"
                  >
                    <span className="flex items-center gap-2"><LogOut className="w-4 h-4" /> Logout</span>
                  </button>
                </>
              ) : (
                <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
                  <button
                    onClick={() => handleNavigation('/login')}
                    className="w-full rounded-full border border-indigo-200 px-4 py-2 text-sm font-medium text-indigo-600"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => handleNavigation('/register')}
                    className="w-full rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white"
                  >
                    Register
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

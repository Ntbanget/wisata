import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { BookingProvider } from './context/BookingContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import CustomerHomePage from './pages/customer/CustomerHomePage';
import CustomerBookings from './pages/customer/CustomerBookings';
import BookingDetail from './pages/customer/BookingDetail';
import Notifications from './pages/customer/Notifications';
import ProfilePage from './pages/customer/ProfilePage';
import PackagePage from './pages/PackagePage';
import DetailPage from './pages/DetailPage';
import MapPage from './pages/MapPage';
import ExploreMap from './pages/ExploreMap';
import CheckoutPage from './pages/CheckoutPage';
import SuccessPage from './pages/SuccessPage';
import LoginPage from './pages/LoginPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBookings from './pages/admin/AdminBookings';
import AdminPayments from './pages/admin/AdminPayments';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminDestinations from './pages/admin/AdminDestinations';
import AdminHotels from './pages/admin/AdminHotels';
import AdminVehicles from './pages/admin/AdminVehicles';
import AdminTourGuides from './pages/admin/AdminTourGuides';
import AdminPackages from './pages/admin/AdminPackages';
import AdminSmartTrips from './pages/admin/AdminSmartTrips';
import AdminSettings from './pages/admin/AdminSettings';
import AdminActivityLogs from './pages/admin/AdminActivityLogs';
import './index.css';

// Layout wrapper component to conditionally render Navbar/Footer
const LayoutWrapper = ({ children }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  if (isAdminRoute) {
    return <>{children}</>;
  }
  
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BookingProvider>
          <Router>
            <LayoutWrapper>
              <div className="min-h-screen flex flex-col bg-gray-50">
                <main className="flex-grow pt-16">
                  <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/login" element={<LoginPage initialMode="login" />} />
                    <Route path="/register" element={<LoginPage initialMode="register" />} />
                    <Route path="/admin/login" element={<AdminLoginPage />} />
                    
                    {/* Public browsing routes */}
                    <Route path="/packages" element={<PackagePage />} />
                    <Route path="/detail/:packageId" element={<DetailPage />} />
                    
                    {/* Protected User Routes */}
                    <Route path="/customer/home" element={
                      <ProtectedRoute>
                        <CustomerHomePage />
                      </ProtectedRoute>
                    } />
                    <Route path="/customer/bookings" element={
                      <ProtectedRoute>
                        <CustomerBookings />
                      </ProtectedRoute>
                    } />
                    <Route path="/customer/bookings/:id" element={
                      <ProtectedRoute>
                        <BookingDetail />
                      </ProtectedRoute>
                    } />
                    <Route path="/notifications" element={
                      <ProtectedRoute>
                        <Notifications />
                      </ProtectedRoute>
                    } />
                    <Route path="/map/:packageId" element={
                      <ProtectedRoute>
                        <MapPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/explore" element={
                      <ProtectedRoute>
                        <ExploreMap />
                      </ProtectedRoute>
                    } />
                    <Route path="/checkout/:packageId" element={
                      <ProtectedRoute>
                        <CheckoutPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/success/:bookingId" element={
                      <ProtectedRoute>
                        <SuccessPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/customer/profile" element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    } />
                    {/* Old /custom route is deprecated. Packages are FIXED; users
                        who want to build their own trip are sent to Explore Map. */}
                    <Route path="/custom/:packageId" element={<Navigate to="/explore" replace />} />
                    
                    {/* Admin Routes - REQUIRE ADMIN ROLE */}
                    <Route path="/admin/*" element={
                      <ProtectedRoute requireAdmin={true}>
                        <AdminLayout />
                      </ProtectedRoute>
                    }>
                      <Route path="dashboard" element={<AdminDashboard />} />
                      <Route path="bookings" element={<AdminBookings />} />
                      <Route path="payments" element={<AdminPayments />} />
                      <Route path="customers" element={<AdminCustomers />} />
                      <Route path="destinations" element={<AdminDestinations />} />
                      <Route path="hotels" element={<AdminHotels />} />
                      <Route path="vehicles" element={<AdminVehicles />} />
                      <Route path="tour-guides" element={<AdminTourGuides />} />
                      <Route path="packages" element={<AdminPackages />} />
                      <Route path="smart-trips" element={<AdminSmartTrips />} />
                      <Route path="settings" element={<AdminSettings />} />
                      <Route path="activity-logs" element={<AdminActivityLogs />} />
                    </Route>
                  </Routes>
                </main>
              </div>
            </LayoutWrapper>
          </Router>
        </BookingProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

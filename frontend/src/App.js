import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { BookingProvider } from './context/BookingContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import PackagePage from './pages/PackagePage';
import DetailPage from './pages/DetailPage';
import MapPage from './pages/MapPage';
import ExploreMap from './pages/ExploreMap';
import CheckoutPage from './pages/CheckoutPage';
import SuccessPage from './pages/SuccessPage';
import './index.css';

function App() {
  return (
    <ThemeProvider>
      <BookingProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-grow pt-16">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/packages" element={<PackagePage />} />
                <Route path="/detail/:packageId" element={<DetailPage />} />
                {/* Old /custom route is deprecated. Packages are FIXED; users
                    who want to build their own trip are sent to Explore Map. */}
                <Route path="/custom/:packageId" element={<Navigate to="/explore" replace />} />
                <Route path="/map/:packageId" element={<MapPage />} />
                <Route path="/explore" element={<ExploreMap />} />
                <Route path="/checkout/:packageId" element={<CheckoutPage />} />
                <Route path="/success/:bookingId" element={<SuccessPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </BookingProvider>
    </ThemeProvider>
  );
}

export default App;

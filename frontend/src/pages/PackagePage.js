import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Star, Calendar, Users, ArrowRight, Filter, Search, Heart, Share2 } from 'lucide-react';
import apiService from '../services/api';
import { useBooking } from '../context/BookingContext';
import { formatCurrency, getRatingStars, getHotelCategoryLabel, getHotelCategoryColor, getPlaceCategoryIcon, getAutoImageUrl } from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import ImageWithFallback from '../components/ImageWithFallback';
import { buildPackageSearchParams, getPackagesFromPackageApiResponse, resolvePackagePageSessionSnapshot } from '../utils/packageResponse';

const PackagePage = () => {
  const navigate = useNavigate();
  const { setSelectedPackage } = useBooking();
  const [packages, setPackages] = useState([]);
  const [searchCriteria, setSearchCriteria] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('score');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [favorites, setFavorites] = useState([]);
  const SESSION_STORAGE_TTL_MS = 5 * 60 * 1000;

  useEffect(() => {
    loadSearchResults();
  }, []);

  const isBackForwardNavigation = () => {
    if (typeof window === 'undefined' || !window.performance?.getEntriesByType) {
      return false;
    }

    const navigationEntries = window.performance.getEntriesByType('navigation');
    return navigationEntries.length > 0 && navigationEntries[0].type === 'back_forward';
  };

  const getStoredSearchSnapshot = () => {
    try {
      const savedResults = sessionStorage.getItem('searchResults');
      const savedCriteria = sessionStorage.getItem('searchCriteria');

      if (!savedResults || !savedCriteria) {
        return null;
      }

      const results = JSON.parse(savedResults);
      const criteria = JSON.parse(savedCriteria);
      const savedAt = Number(results?.saved_at || criteria?.saved_at || 0);
      const isFresh = !savedAt || Date.now() - savedAt <= SESSION_STORAGE_TTL_MS;

      return { results, criteria, isFresh };
    } catch (error) {
      return null;
    }
  };

  const loadSearchResults = async () => {
    setIsLoading(true);
    setError(null);

    const shouldRestoreFromSession = isBackForwardNavigation();
    const sessionSnapshot = getStoredSearchSnapshot();
    const snapshotToUse = resolvePackagePageSessionSnapshot(sessionSnapshot, shouldRestoreFromSession);

    if (snapshotToUse) {
      const savedPackages = snapshotToUse.results?.packages || snapshotToUse.results?.data?.packages || [];
      setPackages(Array.isArray(savedPackages) ? savedPackages : []);
      setSearchCriteria(snapshotToUse.criteria || null);

      const criteria = snapshotToUse.criteria || null;
      if (criteria) {
        try {
          const response = await apiService.generatePackages(buildPackageSearchParams(criteria));
          const payload = response?.data && typeof response.data === 'object' && !Array.isArray(response.data)
            ? response.data
            : response || {};
          const freshPackages = getPackagesFromPackageApiResponse(response);

          setPackages(freshPackages);
          setSearchCriteria(payload?.search_criteria || criteria || null);
          setError(null);
        } catch (err) {
          setError('Gagal memuat paket wisata. Coba lagi.');
        }
      }

      setIsLoading(false);
      return;
    }

    try {
      const response = await apiService.generatePackages({});
      const payload = response?.data && typeof response.data === 'object' && !Array.isArray(response.data)
        ? response.data
        : response || {};
      const freshPackages = getPackagesFromPackageApiResponse(response);

      setPackages(freshPackages);
      setSearchCriteria(payload?.search_criteria || null);
      setError(null);
    } catch (err) {
      setError('Gagal memuat paket wisata. Coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilter = (packages) => {
    const filtered = [...packages].filter((pkg) => {
      if (sourceFilter === 'promo') {
        return pkg.source === 'admin';
      }

      if (sourceFilter === 'recommendation') {
        return pkg.source === 'generated';
      }

      return true;
    });

    const sorted = filtered;
    
    switch (sortBy) {
      case 'price-low':
        return sorted.sort((a, b) => a.total_price - b.total_price);
      case 'price-high':
        return sorted.sort((a, b) => b.total_price - a.total_price);
      case 'rating':
        return sorted.sort((a, b) => b.hotel.rating - a.hotel.rating);
      case 'places':
        return sorted.sort((a, b) => b.tourist_places.length - a.tourist_places.length);
      case 'score':
      default:
        return sorted.sort((a, b) => b.score - a.score);
    }
  };

  const toggleFavorite = (packageId) => {
    setFavorites(prev => 
      prev.includes(packageId) 
        ? prev.filter(id => id !== packageId)
        : [...prev, packageId]
    );
  };

  const handlePackageSelect = (packageData) => {
    setSelectedPackage(packageData);
    navigate(`/detail/${packageData.id}`);
  };

  // Packages are FIXED. To customize, users go to Explore Map instead.
  // Pre-filter Explore Map by the city that was searched so users don't
  // have to pick the city again. Also pass the nights so the Malam selector
  // is pre-set to match the user's search.
  const handleGoToExplore = (cityIdOverride = null, nightsOverride = null) => {
    const cityId = cityIdOverride
      || (searchCriteria && searchCriteria.city_id);
    const nights = nightsOverride
      || (searchCriteria && searchCriteria.nights);
    const params = new URLSearchParams();
    if (cityId) params.set('city', String(cityId));
    if (nights) params.set('nights', String(nights));
    const qs = params.toString();
    navigate(qs ? `/explore?${qs}` : '/explore');
  };

  const handleShare = async (packageData) => {
    const shareUrl = `${window.location.origin}/detail/${packageData.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Travel Package - ${packageData.hotel.name}`,
          text: `Check out this amazing travel package in Central Java!`,
          url: shareUrl,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert('Package link copied to clipboard!');
      } catch (error) {
        console.error('Failed to copy:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading your travel packages..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <ErrorMessage error={error} />
          <p className="text-sm text-gray-500 mt-3 mb-6">
            Pilih kota, budget, dan jumlah malam di halaman utama untuk melihat
            paket. Atau buat trip sendiri di Jelajahi Peta.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate('/')}
              className="btn-primary"
            >
              Mulai Pencarian
            </button>
            <button
              onClick={() => navigate('/explore')}
              className="btn-outline"
            >
              Jelajahi Peta
            </button>
          </div>
        </div>
      </div>
    );
  }

  const sortedPackages = handleFilter(packages);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Your Travel Packages
              </h1>
              {searchCriteria && (
                <p className="text-gray-600">
                  {packages.length} packages found for {formatCurrency(searchCriteria.budget)} budget
                </p>
              )}
            </div>
            
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="select-field"
              >
                <option value="all">Semua Paket</option>
                <option value="promo">Promo</option>
                <option value="recommendation">Rekomendasi</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="select-field"
              >
                <option value="score">Best Match</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Hotel Rating</option>
                <option value="places">More Destinations</option>
              </select>
              
              <button
                onClick={() => navigate('/')}
                className="btn-outline"
              >
                New Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Packages Grid */}
      <div className="container py-8">
        {sortedPackages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No packages found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your budget or search criteria
            </p>
            <button
              onClick={() => navigate('/')}
              className="btn-primary"
            >
              Start New Search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {sortedPackages.map((packageData) => (
              <div key={packageData.id} className="card-hover relative">
                {/* Favorite Button */}
                <button
                  onClick={() => toggleFavorite(packageData.id)}
                  className="absolute top-4 right-4 z-10 w-10 h-10 bg-white rounded-full shadow-soft flex items-center justify-center hover:shadow-medium transition-shadow duration-200"
                >
                  <Heart 
                    className={`w-5 h-5 ${
                      favorites.includes(packageData.id) 
                        ? 'text-red-500 fill-current' 
                        : 'text-gray-400'
                    }`} 
                  />
                </button>

                {/* Package Image/Placeholder */}
                <div className="h-48 overflow-hidden rounded-t-xl bg-gray-100">
                  <ImageWithFallback
                    src={getAutoImageUrl(packageData.hotel, 'hotel')}
                    alt={packageData.hotel.name}
                    type="hotel"
                    category={packageData.hotel.category}
                    className="h-full w-full object-cover"
                    fallbackClassName="h-full w-full"
                  />
                </div>

                {/* Package Content */}
                <div className="p-6">
                  {/* Hotel Info */}
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {packageData.source === 'admin' && packageData.name
                            ? packageData.name
                            : packageData.hotel.name}
                        </h3>
                        {packageData.source === 'admin' && packageData.name && (
                          <p className="text-sm text-gray-500 mt-1 truncate">
                            {packageData.hotel.name}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 justify-end">
                        {packageData.source === 'admin' ? (
                          <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
                            Promo
                          </span>
                        ) : null}
                        <span className={`badge ${getHotelCategoryColor(packageData.hotel.category)}`}>
                          {getHotelCategoryLabel(packageData.hotel.category)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span>{packageData.hotel.rating}</span>
                      </div>
                      <span>•</span>
                      <span>{formatCurrency(packageData.hotel.price_per_night)}/night</span>
                    </div>
                  </div>

                  {/* Trip Length */}
                  {packageData.nights && (
                    <div className="mb-3 inline-flex items-center px-2 py-1 rounded-full bg-secondary-50 text-secondary-700 text-xs font-medium">
                      <Calendar className="w-3 h-3 mr-1" />
                      {packageData.nights} malam
                    </div>
                  )}

                  {/* Destinations */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Destinasi ({packageData.tourist_places.length})
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {packageData.tourist_places.slice(0, 3).map((place, index) => (
                        <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                          {getPlaceCategoryIcon(place.category)} {place.name}
                        </span>
                      ))}
                      {packageData.tourist_places.length > 3 && (
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                          +{packageData.tourist_places.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Package Score */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Match Score</span>
                      <span className="text-sm font-medium text-primary-600">
                        {packageData.score}/10
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${packageData.score * 10}%` }}
                      />
                    </div>
                  </div>

                  {/* Price */}
                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Total Price</span>
                      <span className="text-lg font-bold text-primary-600">
                        {formatCurrency(packageData.total_price)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Saves {formatCurrency(packageData.budget - packageData.total_price)} from budget
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handlePackageSelect(packageData)}
                        className="flex-1 btn-primary text-sm"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleShare(packageData)}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                      >
                        <Share2 className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleGoToExplore(
                          packageData.hotel && packageData.hotel.city_id,
                          packageData.nights,
                        )}
                        className="flex-1 btn-outline text-sm"
                        title="Lihat peta kota & rute paket di Explore Map"
                      >
                        Lihat Peta
                      </button>
                      <button
                        onClick={() => handleGoToExplore(
                          packageData.hotel && packageData.hotel.city_id,
                          packageData.nights,
                        )}
                        className="flex-1 btn-outline text-sm"
                        title="Build your own custom trip on Explore Map"
                      >
                        Custom (Jelajahi Peta)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PackagePage;

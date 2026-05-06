import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Filter, MapPin, Hotel, Camera } from 'lucide-react';
import { apiService } from '../services/api';
import { useBooking } from '../context/BookingContext';
import MapView from '../components/MapView';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const ExploreMap = () => {
  const navigate = useNavigate();
  const { setSelectedPackage } = useBooking();
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    hotelCategory: '',
    placeCategory: '',
    minPrice: '',
    maxPrice: ''
  });

  const handleBookCustomTrip = ({ hotel, tourist_places, total_price }) => {
    const customPackage = {
      id: 0,
      hotel,
      tourist_places,
      total_price,
      budget: total_price,
      isCustom: true
    };
    setSelectedPackage(customPackage);
    navigate('/checkout/0');
  };

  useEffect(() => {
    loadCities();
  }, []);

  const loadCities = async () => {
    try {
      const response = await apiService.getCities();
      setCities(response.data);
      setIsLoading(false);
    } catch (error) {
      setError('Failed to load cities');
      setIsLoading(false);
    }
  };

  const handleCityChange = (cityId) => {
    const city = cities.find(c => c.id === parseInt(cityId));
    setSelectedCity(city);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      hotelCategory: '',
      placeCategory: '',
      minPrice: '',
      maxPrice: ''
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading map..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <ErrorMessage error={error} />
          <button
            onClick={() => navigate('/')}
            className="btn-primary mt-6"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Explore Map</h1>
                <p className="text-gray-600">Interactive map of Central Java destinations</p>
              </div>
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-outline flex items-center space-x-2"
            >
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border-b border-gray-200">
          <div className="container py-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* City Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <select
                  value={selectedCity?.id || ''}
                  onChange={(e) => handleCityChange(e.target.value)}
                  className="select-field text-sm"
                >
                  <option value="">All Cities</option>
                  {cities.map(city => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Hotel Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hotel Category
                </label>
                <select
                  value={filters.hotelCategory}
                  onChange={(e) => handleFilterChange('hotelCategory', e.target.value)}
                  className="select-field text-sm"
                >
                  <option value="">All Hotels</option>
                  <option value="low">Budget</option>
                  <option value="medium">Mid-range</option>
                  <option value="high">Luxury</option>
                </select>
              </div>

              {/* Place Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Place Category
                </label>
                <select
                  value={filters.placeCategory}
                  onChange={(e) => handleFilterChange('placeCategory', e.target.value)}
                  className="select-field text-sm"
                >
                  <option value="">All Places</option>
                  <option value="Historical">Historical</option>
                  <option value="Nature">Nature</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Beach">Beach</option>
                  <option value="Religious">Religious</option>
                  <option value="Adventure">Adventure</option>
                </select>
              </div>

              {/* Min Price Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Price
                </label>
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  placeholder="0"
                  className="input-field text-sm"
                />
              </div>

              {/* Max Price Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Price
                </label>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  placeholder="999999"
                  className="input-field text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end mt-4 space-x-2">
              <button
                onClick={clearFilters}
                className="btn-outline text-sm"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Map */}
      <div className="container py-8">
        <div className="card p-0 overflow-hidden">
          <MapView 
            cityId={selectedCity?.id}
            height="600px"
            onBookCustomTrip={handleBookCustomTrip}
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="container pb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Hotel className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Hotels</h3>
            <p className="text-gray-600">Find accommodation across Central Java</p>
          </div>

          <div className="card p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Camera className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Tourist Places</h3>
            <p className="text-gray-600">Explore amazing destinations</p>
          </div>

          <div className="card p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <MapPin className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Interactive Map</h3>
            <p className="text-gray-600">Click markers for details</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExploreMap;

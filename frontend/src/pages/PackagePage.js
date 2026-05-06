import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Star, Calendar, Users, ArrowRight, Filter, Search, Heart, Share2 } from 'lucide-react';
import { apiService } from '../services/api';
import { useBooking } from '../context/BookingContext';
import { formatCurrency, getRatingStars, getHotelCategoryLabel, getHotelCategoryColor, getPlaceCategoryIcon } from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const PackagePage = () => {
  const navigate = useNavigate();
  const { setSelectedPackage } = useBooking();
  const [packages, setPackages] = useState([]);
  const [searchCriteria, setSearchCriteria] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('score');
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    loadSearchResults();
  }, []);

  const loadSearchResults = () => {
    const savedResults = sessionStorage.getItem('searchResults');
    const savedCriteria = sessionStorage.getItem('searchCriteria');
    
    if (savedResults && savedCriteria) {
      try {
        const results = JSON.parse(savedResults);
        const criteria = JSON.parse(savedCriteria);
        
        setPackages(results.packages);
        setSearchCriteria(criteria);
        setError(null);
      } catch (error) {
        setError('Failed to load search results');
      }
    } else {
      setError('No search results found. Please start a new search from the home page.');
    }
    
    setIsLoading(false);
  };

  const handleSort = (packages) => {
    const sorted = [...packages];
    
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

  const handleCustomize = (packageData) => {
    setSelectedPackage(packageData);
    navigate(`/custom/${packageData.id}`);
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

  const sortedPackages = handleSort(packages);

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
                <div className="h-48 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-t-xl flex items-center justify-center">
                  <MapPin className="w-12 h-12 text-white" />
                </div>

                {/* Package Content */}
                <div className="p-6">
                  {/* Hotel Info */}
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {packageData.hotel.name}
                      </h3>
                      <span className={`badge ${getHotelCategoryColor(packageData.hotel.category)}`}>
                        {getHotelCategoryLabel(packageData.hotel.category)}
                      </span>
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

                  {/* Destinations */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Destinations ({packageData.tourist_places.length})
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
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePackageSelect(packageData)}
                      className="flex-1 btn-primary text-sm"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleCustomize(packageData)}
                      className="flex-1 btn-outline text-sm"
                    >
                      Customize
                    </button>
                    <button
                      onClick={() => handleShare(packageData)}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      <Share2 className="w-4 h-4 text-gray-600" />
                    </button>
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

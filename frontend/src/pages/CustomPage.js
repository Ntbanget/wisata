import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Plus, X, DollarSign, MapPin, Star } from 'lucide-react';
import { apiService } from '../services/api';
import { useBooking } from '../context/BookingContext';
import { formatCurrency, getHotelCategoryLabel, getHotelCategoryColor, getPlaceCategoryIcon } from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const CustomPage = () => {
  const { packageId } = useParams();
  const navigate = useNavigate();
  const { selectedPackage, setSelectedPackage } = useBooking();
  const [packageData, setPackageData] = useState(null);
  const [availableHotels, setAvailableHotels] = useState([]);
  const [availablePlaces, setAvailablePlaces] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [selectedPlaces, setSelectedPlaces] = useState([]);
  const [customPackage, setCustomPackage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    loadPackageData();
  }, [packageId]);

  useEffect(() => {
    if (packageData) {
      loadAvailableOptions();
      setSelectedHotel(packageData.hotel);
      setSelectedPlaces(packageData.tourist_places);
    }
  }, [packageData]);

  const loadPackageData = () => {
    if (selectedPackage && selectedPackage.id === parseInt(packageId)) {
      setPackageData(selectedPackage);
      setIsLoading(false);
    } else {
      const savedResults = sessionStorage.getItem('searchResults');
      if (savedResults) {
        try {
          const results = JSON.parse(savedResults);
          const foundPackage = results.packages.find(p => p.id === parseInt(packageId));
          if (foundPackage) {
            setPackageData(foundPackage);
            setSelectedPackage(foundPackage);
          } else {
            setError('Package not found');
          }
        } catch (error) {
          setError('Failed to load package details');
        }
      } else {
        setError('Package not found');
      }
      setIsLoading(false);
    }
  };

  const loadAvailableOptions = async () => {
    try {
      const searchCriteria = JSON.parse(sessionStorage.getItem('searchCriteria'));
      
      // Load hotels within budget
      const hotelsResponse = await apiService.generatePackages({
        city_id: searchCriteria.city_id,
        budget: searchCriteria.budget,
        packages_count: 10,
        max_places: 1
      });
      
      // Extract unique hotels
      const hotels = hotelsResponse.data.packages.map(p => p.hotel);
      setAvailableHotels(hotels);

      // Load tourist places
      const placesResponse = await apiService.generatePackages({
        city_id: searchCriteria.city_id,
        budget: searchCriteria.budget * 0.3, // 30% for places
        packages_count: 1,
        max_places: 10
      });
      
      if (placesResponse.data.packages.length > 0) {
        setAvailablePlaces(placesResponse.data.packages[0].tourist_places);
      }
    } catch (error) {
      console.error('Error loading options:', error);
    }
  };

  const calculateCustomPackage = async () => {
    if (!selectedHotel || selectedPlaces.length === 0) {
      setError('Please select a hotel and at least one destination');
      return;
    }

    setIsCalculating(true);
    setError(null);

    try {
      const response = await apiService.calculateCustomPackage({
        hotel_id: selectedHotel.id,
        tourist_place_ids: selectedPlaces.map(p => p.id),
        nights: 1
      });

      setCustomPackage(response.data);
    } catch (error) {
      setError('Failed to calculate package price');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleHotelChange = (hotelId) => {
    const hotel = availableHotels.find(h => h.id === parseInt(hotelId));
    setSelectedHotel(hotel);
  };

  const handlePlaceToggle = (place) => {
    setSelectedPlaces(prev => {
      const exists = prev.find(p => p.id === place.id);
      if (exists) {
        return prev.filter(p => p.id !== place.id);
      } else {
        return [...prev, place];
      }
    });
  };

  const handleBack = () => {
    navigate(`/detail/${packageId}`);
  };

  const handleContinue = () => {
    if (customPackage) {
      const updatedPackage = {
        ...packageData,
        hotel: customPackage.hotel,
        tourist_places: customPackage.tourist_places,
        total_price: customPackage.total_price,
        isCustom: true
      };
      setSelectedPackage(updatedPackage);
      navigate(`/detail/${packageId}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading customization options..." />
      </div>
    );
  }

  if (error && !packageData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <ErrorMessage error={error} />
          <button
            onClick={() => navigate('/packages')}
            className="btn-primary mt-6"
          >
            Back to Packages
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
                onClick={handleBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Customize Your Package</h1>
                <p className="text-gray-600">Modify your travel package to fit your preferences</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Customization Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hotel Selection */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Hotel</h2>
              
              <div className="space-y-3">
                {availableHotels.map((hotel) => (
                  <div
                    key={hotel.id}
                    onClick={() => handleHotelChange(hotel.id)}
                    className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                      selectedHotel?.id === hotel.id
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-grow">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-medium text-gray-900">{hotel.name}</h3>
                          <span className={`badge ${getHotelCategoryColor(hotel.category)}`}>
                            {getHotelCategoryLabel(hotel.category)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span>{hotel.rating}</span>
                          </div>
                          <span>•</span>
                          <span>{formatCurrency(hotel.price_per_night)}/night</span>
                        </div>
                      </div>
                      <div className="w-5 h-5 border-2 rounded-full flex items-center justify-center">
                        {selectedHotel?.id === hotel.id && (
                          <div className="w-3 h-3 bg-primary-600 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Destinations Selection */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Destinations</h2>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Selected: {selectedPlaces.length} destinations
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availablePlaces.map((place) => {
                  const isSelected = selectedPlaces.find(p => p.id === place.id);
                  return (
                    <div
                      key={place.id}
                      onClick={() => handlePlaceToggle(place)}
                      className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="text-lg mt-1">{getPlaceCategoryIcon(place.category)}</div>
                        <div className="flex-grow">
                          <h3 className="font-medium text-gray-900">{place.name}</h3>
                          <div className="flex items-center justify-between text-sm text-gray-600 mt-1">
                            <span className="badge-primary">{place.category}</span>
                            <span>{formatCurrency(place.ticket_price)}</span>
                          </div>
                        </div>
                        <div className="w-5 h-5 border-2 rounded-full flex items-center justify-center mt-1">
                          {isSelected && (
                            <div className="w-3 h-3 bg-primary-600 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Calculate Button */}
            <div className="flex justify-center">
              <button
                onClick={calculateCustomPackage}
                disabled={isCalculating || !selectedHotel || selectedPlaces.length === 0}
                className="btn-primary text-lg px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCalculating ? (
                  <div className="flex items-center space-x-2">
                    <LoadingSpinner size="small" text="" />
                    <span>Calculating...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-5 h-5" />
                    <span>Calculate Price</span>
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Summary Panel */}
          <div className="space-y-6">
            {/* Current Selection */}
            <div className="card p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Selection</h3>
              
              {selectedHotel && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Hotel</h4>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="font-medium text-gray-900">{selectedHotel.name}</div>
                    <div className="text-sm text-gray-600">
                      {formatCurrency(selectedHotel.price_per_night)}/night
                    </div>
                  </div>
                </div>
              )}

              {selectedPlaces.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Destinations ({selectedPlaces.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedPlaces.map((place, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm">{getPlaceCategoryIcon(place.category)}</span>
                            <span className="text-sm font-medium text-gray-900">{place.name}</span>
                          </div>
                          <span className="text-sm text-gray-600">
                            {formatCurrency(place.ticket_price)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Package Result */}
              {customPackage && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Price Breakdown</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Hotel (1 night)</span>
                      <span className="font-medium">{formatCurrency(customPackage.hotel_price)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Destinations</span>
                      <span className="font-medium">{formatCurrency(customPackage.places_price)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between">
                      <span className="font-medium text-gray-900">Total</span>
                      <span className="text-lg font-bold text-primary-600">
                        {formatCurrency(customPackage.total_price)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <button
                      onClick={handleContinue}
                      className="w-full btn-primary"
                    >
                      Apply Changes
                    </button>
                    <button
                      onClick={handleBack}
                      className="w-full btn-outline"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ErrorMessage error={error} className="fixed bottom-4 right-4 max-w-md" />
    </div>
  );
};

export default CustomPage;

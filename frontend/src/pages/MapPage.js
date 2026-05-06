import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, DollarSign } from 'lucide-react';
import { useBooking } from '../context/BookingContext';
import { formatCurrency, calculateDistance, estimateTravelTime } from '../utils/helpers';
import MapView from '../components/MapView';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const MapPage = () => {
  const { packageId } = useParams();
  const navigate = useNavigate();
  const { selectedPackage } = useBooking();
  const [packageData, setPackageData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPackageData();
  }, [packageId]);

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

  const handleStartNavigation = () => {
    // Open OpenStreetMap with the hotel location
    const { lat, lng } = packageData.hotel;
    window.open(`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=15`, '_blank');
  };

  const handleBack = () => {
    navigate(`/detail/${packageId}`);
  };

  const calculateTotalDistance = () => {
    if (!packageData || !packageData.hotel || !packageData.tourist_places) return 0;
    
    let totalDistance = 0;
    const hotel = packageData.hotel;
    const places = packageData.tourist_places;
    
    // Calculate distance from hotel to first place
    if (places.length > 0) {
      totalDistance += calculateDistance(hotel.lat, hotel.lng, places[0].lat, places[0].lng);
      
      // Calculate distances between consecutive places
      for (let i = 1; i < places.length; i++) {
        totalDistance += calculateDistance(places[i-1].lat, places[i-1].lng, places[i].lat, places[i].lng);
      }
    }
    
    return totalDistance;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading map..." />
      </div>
    );
  }

  if (error || !packageData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <ErrorMessage error={error || 'Package not found'} />
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

  const totalDistance = packageData ? calculateTotalDistance() : 0;

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
                <h1 className="text-2xl font-bold text-gray-900">Travel Route Map</h1>
                <p className="text-gray-600">Interactive map with your travel itinerary</p>
              </div>
            </div>
            
            <button
              onClick={handleStartNavigation}
              className="btn-primary flex items-center space-x-2"
            >
              <Navigation className="w-5 h-5" />
              <span>Start Navigation</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Map */}
          <div className="lg:col-span-3">
            <div className="card p-0 overflow-hidden">
              <MapView 
                selectedPackage={packageData}
                height="600px"
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Route Info */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Route Information</h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Total Distance</div>
                    <div className="text-sm text-gray-600">
                      {totalDistance > 0 ? `${totalDistance.toFixed(1)} km` : 'Calculating...'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Est. Travel Time</div>
                    <div className="text-sm text-gray-600">
                      {totalDistance > 0 ? estimateTravelTime(totalDistance) : 'Calculating...'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Package Price</div>
                    <div className="text-sm text-gray-600">
                      {formatCurrency(packageData.total_price)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Itinerary List */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Itinerary</h3>
              
              <div className="space-y-3">
                {/* Hotel */}
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    H
                  </div>
                  <div className="flex-grow">
                    <div className="font-medium text-gray-900">{packageData.hotel.name}</div>
                    <div className="text-sm text-gray-600">Starting Point • Hotel</div>
                  </div>
                </div>

                {/* Destinations */}
                {packageData.tourist_places.map((place, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-grow">
                      <div className="font-medium text-gray-900">{place.name}</div>
                      <div className="text-sm text-gray-600">{place.category}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={handleStartNavigation}
                className="w-full btn-primary flex items-center justify-center space-x-2"
              >
                <Navigation className="w-5 h-5" />
                <span>Start Navigation</span>
              </button>
              
              <button
                onClick={() => window.open(`https://www.openstreetmap.org/directions?from=${packageData.hotel.lat},${packageData.hotel.lng}&to=${packageData.tourist_places[packageData.tourist_places.length - 1].lat},${packageData.tourist_places[packageData.tourist_places.length - 1].lng}`, '_blank')}
                className="w-full btn-outline flex items-center justify-center space-x-2"
              >
                <MapPin className="w-5 h-5" />
                <span>Open in OpenStreetMap</span>
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default MapPage;

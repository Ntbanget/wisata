import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Star, Calendar, Users, ArrowRight, Heart, Share2, Clock, Navigation, DollarSign } from 'lucide-react';
import apiService from '../services/api';
import { useBooking } from '../context/BookingContext';
import { formatCurrency, getRatingStars, getHotelCategoryLabel, getHotelCategoryColor, getPlaceCategoryIcon, generateItinerary, calculateDistance, estimateTravelTime, formatDurationMinutes, computeDailySchedule, getOpeningHours } from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const DetailPage = () => {
  const { packageId } = useParams();
  const navigate = useNavigate();
  const { selectedPackage, setSelectedPackage } = useBooking();
  const [packageData, setPackageData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    loadPackageData();
  }, [packageId]);

  const loadPackageData = () => {
    if (selectedPackage && selectedPackage.id === parseInt(packageId)) {
      setPackageData(selectedPackage);
      setIsLoading(false);
    } else {
      // Try to load from search results
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

  const handleShare = async () => {
    const shareUrl = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Travel Package - ${packageData?.hotel.name}`,
          text: `Check out this amazing travel package in Central Java!`,
          url: shareUrl,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert('Package link copied to clipboard!');
      } catch (error) {
        console.error('Failed to copy:', error);
      }
    }
  };

  // Packages are FIXED — to customize, users go to Explore Map and build their
  // own trip. Pre-filter Explore Map by the package's city so users keep their
  // search context when switching to custom mode.
  const handleGoToExplore = () => {
    const cityId =
      (packageData && packageData.hotel && packageData.hotel.city_id) || null;
    const nights = (packageData && packageData.nights) || null;
    const params = new URLSearchParams();
    if (cityId) params.set('city', String(cityId));
    if (nights) params.set('nights', String(nights));
    const qs = params.toString();
    navigate(qs ? `/explore?${qs}` : '/explore');
  };

  // "View Map" should auto-filter Explore Map by this package's city — same
  // behaviour the user wants for Custom — so they immediately see the city's
  // hotels + destinations on the map without re-picking the city.
  const handleViewMap = () => {
    handleGoToExplore();
  };

  const handleCheckout = () => {
    navigate(`/checkout/${packageId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading package details..." />
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

  // Prefer backend-supplied per-malam itinerary (with timeline) but fall back to a
  // heuristic split so old data without `itinerary` still renders.
  const itinerary = generateItinerary(packageData.hotel, packageData.tourist_places);
  const malamPlan = (packageData.itinerary && packageData.itinerary.length > 0)
    ? packageData.itinerary
    : null;
  const nights = packageData.nights || 1;
  // Build per-malam timelines on the client when backend didn't supply schedule.
  const malamTimelines = malamPlan
    ? malamPlan.map((bucket) => {
        if (bucket.schedule && bucket.schedule.events && bucket.schedule.events.length > 0) {
          return bucket.schedule;
        }
        return computeDailySchedule(packageData.hotel, bucket.places || []);
      })
    : [];
  const totalTourMin = malamTimelines.reduce((sum, t) => sum + (t?.totalMin || 0), 0);
  const totalDistance = packageData.tourist_places.reduce((acc, place, index) => {
    const from = index === 0 ? packageData.hotel : packageData.tourist_places[index - 1];
    return acc + calculateDistance(from.lat, from.lng, place.lat, place.lng);
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-600 to-secondary-600 text-white">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {packageData.hotel.name}
              </h1>
              <p className="text-primary-100">
                {nights} malam · {packageData.tourist_places.length} destinasi
                {totalTourMin > 0 && (
                  <> · estimasi tour {formatDurationMinutes(totalTourMin)}</>
                )}
              </p>
            </div>
            
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className="p-3 bg-white/20 backdrop-blur rounded-full hover:bg-white/30 transition-colors duration-200"
              >
                <Heart 
                  className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} 
                />
              </button>
              <button
                onClick={handleShare}
                className="p-3 bg-white/20 backdrop-blur rounded-full hover:bg-white/30 transition-colors duration-200"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Price Summary */}
      <div className="bg-white border-b border-gray-200">
        <div className="container py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold text-primary-600">
                  {formatCurrency(packageData.total_price)}
                </span>
                <span className="text-gray-500">/ package</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Budget: {formatCurrency(packageData.budget)} • 
                You save: {formatCurrency(packageData.budget - packageData.total_price)}
              </p>
            </div>
            
            <div className="flex space-x-4 mt-4 md:mt-0">
              <button
                onClick={handleGoToExplore}
                className="btn-outline"
                title="Build your own custom trip on Explore Map"
              >
                Buat Trip Custom (Jelajahi Peta)
              </button>
              <button
                onClick={handleCheckout}
                className="btn-primary"
              >
                Book Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="container">
          <div className="flex space-x-8">
            {['overview', 'hotel', 'destinations', 'itinerary'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Package Summary */}
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Package Overview</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-4 bg-primary-50 rounded-lg">
                    <MapPin className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-primary-600">
                      {packageData.tourist_places.length + 1}
                    </div>
                    <div className="text-sm text-gray-600">Total Places</div>
                  </div>
                  
                  <div className="text-center p-4 bg-secondary-50 rounded-lg">
                    <Clock className="w-8 h-8 text-secondary-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-secondary-600">
                      {nights}
                    </div>
                    <div className="text-sm text-gray-600">Malam menginap</div>
                  </div>
                  
                  <div className="text-center p-4 bg-accent-50 rounded-lg">
                    <DollarSign className="w-8 h-8 text-accent-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-accent-600">
                      {Math.round((packageData.budget - packageData.total_price) / packageData.budget * 100)}%
                    </div>
                    <div className="text-sm text-gray-600">Saved</div>
                  </div>
                </div>

                <div className="prose max-w-none">
                  <p className="text-gray-600">
                    This carefully curated package offers the perfect balance of comfort and adventure. 
                    Stay at the highly-rated {packageData.hotel.name} and explore {packageData.tourist_places.length} 
                    amazing destinations including historical sites, natural wonders, and cultural attractions.
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={handleViewMap}
                    className="flex items-center justify-center space-x-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    <Navigation className="w-5 h-5 text-primary-600" />
                    <span>View Map</span>
                  </button>
                  <button
                    onClick={handleGoToExplore}
                    className="flex items-center justify-center space-x-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    title="Build your own custom trip on Explore Map"
                  >
                    <Calendar className="w-5 h-5 text-primary-600" />
                    <span>Trip Custom (Jelajahi Peta)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Hotel Card */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Hotel</h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-900">{packageData.hotel.name}</h4>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span>{packageData.hotel.rating}</span>
                      </div>
                      <span>•</span>
                      <span className={getHotelCategoryColor(packageData.hotel.category)}>
                        {getHotelCategoryLabel(packageData.hotel.category)}
                      </span>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-primary-600">
                    {formatCurrency(packageData.hotel.price_per_night)}
                    <span className="text-sm font-normal text-gray-500">/night</span>
                  </div>
                </div>
              </div>

              {/* Destinations Preview */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Destinations</h3>
                <div className="space-y-3">
                  {packageData.tourist_places.slice(0, 3).map((place, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <span className="text-lg">{getPlaceCategoryIcon(place.category)}</span>
                      <div className="flex-grow">
                        <div className="font-medium text-gray-900">{place.name}</div>
                        <div className="text-sm text-gray-600">{place.category}</div>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(place.ticket_price)}
                      </div>
                    </div>
                  ))}
                  {packageData.tourist_places.length > 3 && (
                    <div className="text-sm text-gray-500 text-center pt-2">
                      +{packageData.tourist_places.length - 3} more destinations
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hotel Tab */}
        {activeTab === 'hotel' && (
          <div className="card p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Hotel Details</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {packageData.hotel.name}
                  </h3>
                  <div className="flex items-center space-x-4 text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span>{packageData.hotel.rating} Rating</span>
                    </div>
                    <span className={getHotelCategoryColor(packageData.hotel.category)}>
                      {getHotelCategoryLabel(packageData.hotel.category)}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                    <p className="text-gray-600">
                      {packageData.hotel.description || 'Experience comfortable accommodation with excellent amenities and services.'}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Price Details</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600">Price per night</span>
                        <span className="font-medium">{formatCurrency(packageData.hotel.price_per_night)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Number of nights</span>
                        <span className="font-medium">1</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="bg-gray-100 rounded-xl h-64 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <MapPin className="w-12 h-12 mx-auto mb-2" />
                    <p>Hotel Image</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Destinations Tab */}
        {activeTab === 'destinations' && (
          <div className="card p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Tourist Destinations</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {packageData.tourist_places.map((place, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start space-x-4">
                    <div className="text-2xl">{getPlaceCategoryIcon(place.category)}</div>
                    <div className="flex-grow">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {place.name}
                      </h3>
                      <div className="flex items-center space-x-3 text-sm text-gray-600 mb-3">
                        <span className="badge-primary">{place.category}</span>
                        <span>•</span>
                        <span>{formatCurrency(place.ticket_price)} entry</span>
                      </div>
                      <p className="text-gray-600">
                        {place.description || 'Discover this amazing destination and create unforgettable memories.'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Itinerary Tab */}
        {activeTab === 'itinerary' && (
          <div className="card p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Rencana Perjalanan ({nights} malam)
            </h2>

            {malamPlan ? (
              <div className="space-y-8">
                {malamPlan.map((bucket, idx) => {
                  const malamNum = bucket.malam || bucket.day || (idx + 1);
                  const sched = malamTimelines[idx] || { events: [], totalMin: 0, startTime: '09:00', endTime: '09:00' };
                  const places = bucket.places || [];
                  return (
                    <div key={malamNum} className="border-l-4 border-primary-600 pl-6">
                      <div className="flex flex-wrap items-baseline justify-between mb-3 gap-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Malam {malamNum}
                          {malamNum === 1 && (
                            <span className="ml-2 text-sm font-normal text-gray-500">
                              · Check-in di {packageData.hotel.name}
                            </span>
                          )}
                        </h3>
                        {places.length > 0 && (
                          <span className="text-xs text-gray-500">
                            {sched.startTime} → {sched.endTime} · total {formatDurationMinutes(sched.totalMin)}
                          </span>
                        )}
                      </div>

                      {places.length === 0 ? (
                        <div className="text-gray-500 italic">
                          Free time / waktu istirahat di hotel.
                        </div>
                      ) : (
                        <>
                          <div className="space-y-2 mb-3">
                            {places.map((place) => {
                              const opening = getOpeningHours(place.category);
                              return (
                                <div key={place.id} className="flex items-start space-x-3">
                                  <div className="w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
                                  <div className="flex-1">
                                    <div className="font-medium text-gray-900">
                                      {getPlaceCategoryIcon(place.category)} {place.name}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      {place.category} · {formatCurrency(place.ticket_price)} · jam buka {opening.open}–{opening.close}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          <div className="mt-2 bg-gray-50 rounded-md p-3 text-xs text-gray-700">
                            <div className="font-semibold text-gray-800 mb-1">Jadwal Tour</div>
                            <ul className="space-y-1">
                              {sched.events.map((ev, i) => (
                                <li key={i} className="flex items-baseline gap-2">
                                  <span className="font-mono text-gray-500 w-12">{ev.time}</span>
                                  <span>{ev.label}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-6">
                {itinerary.map((day, index) => (
                  <div key={index} className="border-l-4 border-primary-600 pl-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Malam {day.day}
                    </h3>

                    <div className="space-y-3">
                      {day.morning && (
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
                          <div>
                            <div className="font-medium text-gray-900">Morning</div>
                            <div className="text-gray-600">{day.morning}</div>
                          </div>
                        </div>
                      )}

                      {day.afternoon && (
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
                          <div>
                            <div className="font-medium text-gray-900">Afternoon</div>
                            <div className="text-gray-600">{day.afternoon}</div>
                          </div>
                        </div>
                      )}

                      {day.evening && (
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
                          <div>
                            <div className="font-medium text-gray-900">Evening</div>
                            <div className="text-gray-600">{day.evening}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Travel Info */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Informasi Perjalanan</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                <div>
                  <span className="font-medium">Total Jarak:</span> {totalDistance.toFixed(1)} km
                </div>
                <div>
                  <span className="font-medium">Estimasi Waktu Tour:</span>{' '}
                  {totalTourMin > 0 ? formatDurationMinutes(totalTourMin) : estimateTravelTime(totalDistance)}
                </div>
                <div>
                  <span className="font-medium">Waktu Terbaik:</span> Sepanjang tahun
                </div>
                <div>
                  <span className="font-medium">Transportasi:</span> Sewa mobil disarankan
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailPage;

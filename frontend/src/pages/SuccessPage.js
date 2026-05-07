import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Check, MapPin, Calendar, Users, ArrowRight, Download, Share2, Navigation } from 'lucide-react';
import { apiService } from '../services/api';
import { useBooking } from '../context/BookingContext';
import { formatCurrency, formatDate, generateItinerary, generateMapsUrl, getPlaceCategoryIcon } from '../utils/helpers';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const SuccessPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { currentBooking } = useBooking();
  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [itinerary, setItinerary] = useState([]);

  useEffect(() => {
    loadBookingDetails();
  }, [bookingId]);

  const loadBookingDetails = async () => {
    try {
      // Try to get from context first
      if (currentBooking && currentBooking.id === parseInt(bookingId)) {
        setBooking(currentBooking);
        setItinerary(generateItinerary(
          currentBooking.details.find(d => d.hotel_id)?.hotel_name || {},
          currentBooking.details.filter(d => d.tourist_place_id).map(d => ({
            name: d.place_name,
            category: d.place_category
          }))
        ));
        setIsLoading(false);
        return;
      }

      // Fetch from API
      const response = await apiService.getBookingById(bookingId);
      setBooking(response.data);
      
      // Generate itinerary
      const hotelDetail = response.data.details.find(d => d.hotel_id);
      const placeDetails = response.data.details.filter(d => d.tourist_place_id);
      
      if (hotelDetail && placeDetails.length > 0) {
        const hotel = {
          name: hotelDetail.hotel_name,
          lat: hotelDetail.hotel_lat,
          lng: hotelDetail.hotel_lng
        };
        
        const places = placeDetails.map(d => ({
          name: d.place_name,
          category: d.place_category,
          lat: d.place_lat,
          lng: d.place_lng
        }));
        
        setItinerary(generateItinerary(hotel, places));
      }
      
    } catch (error) {
      setError('Failed to load booking details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Booking Confirmation - ${booking?.user_name}`,
          text: `Check out my travel booking to ${booking?.city_name}!`,
          url: shareUrl,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert('Booking link copied to clipboard!');
      } catch (error) {
        console.error('Failed to copy:', error);
      }
    }
  };

  const handleDownload = () => {
    // Create a simple text receipt
    if (!booking) return;
    
    const receipt = `
BOOKING CONFIRMATION
===================

Booking ID: #${booking.id}
Date: ${formatDate(booking.created_at)}
Status: ${booking.status.toUpperCase()}

CUSTOMER INFORMATION
--------------------
Name: ${booking.user_name}
Email: ${booking.email}

TRAVEL DETAILS
--------------
Destination: ${booking.city_name}
Budget: ${formatCurrency(booking.budget)}
Total Price: ${formatCurrency(booking.total_price)}

BOOKING ITEMS
-------------
${booking.details.map(detail => {
  if (detail.hotel_name) {
    return `Hotel: ${detail.hotel_name} - ${formatCurrency(detail.price_per_item)}`;
  } else if (detail.place_name) {
    return `Destination: ${detail.place_name} - ${formatCurrency(detail.price_per_item)}`;
  }
  return '';
}).join('\n')}

TOTAL: ${formatCurrency(booking.total_price)}

Thank you for booking with Wisata Jateng!
    `.trim();

    const blob = new Blob([receipt], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `booking-${booking.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleStartNavigation = () => {
    if (!booking) return;
    
    const hotelDetail = booking.details.find(d => d.hotel_id);
    const placeDetails = booking.details.filter(d => d.tourist_place_id);
    
    if (hotelDetail && placeDetails.length > 0) {
      const hotel = {
        lat: hotelDetail.hotel_lat,
        lng: hotelDetail.hotel_lng
      };
      
      const destinations = placeDetails.map(d => ({
        lat: d.place_lat,
        lng: d.place_lng
      }));
      
      const mapsUrl = generateMapsUrl(hotel, destinations);
      window.open(mapsUrl, '_blank');
    }
  };

  const handleViewMap = () => {
    if (!booking) return;
    
    // Navigate back to map page with booking data
    navigate(`/map/${booking.id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading booking details..." />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <ErrorMessage error={error || 'Booking not found'} />
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

  const hotelDetail = booking.details.find(d => d.hotel_id);
  const placeDetails = booking.details.filter(d => d.tourist_place_id);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success Header */}
      <div className="bg-gradient-to-br from-green-600 to-emerald-600 text-white">
        <div className="container py-12 text-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Booking Confirmed!
          </h1>
          
          <p className="text-xl text-green-100 mb-2">
            Thank you for your booking, {booking.user_name}!
          </p>
          
          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur rounded-full px-4 py-2">
            <span className="font-medium">Booking ID:</span>
            <span className="font-bold">#{booking.id}</span>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Summary */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Booking Summary</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Customer Information</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-600">Name:</span>
                      <span className="ml-2 text-gray-900">{booking.user_name}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Email:</span>
                      <span className="ml-2 text-gray-900">{booking.email}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Booking Date:</span>
                      <span className="ml-2 text-gray-900">{formatDate(booking.created_at)}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Trip Details</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-600">Destination:</span>
                      <span className="ml-2 text-gray-900">{booking.city_name}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Status:</span>
                      <span className="ml-2 badge-primary">{booking.status}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Total Price:</span>
                      <span className="ml-2 font-bold text-primary-600">{formatCurrency(booking.total_price)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Itinerary */}
            {itinerary.length > 0 && (
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Itinerary</h2>
                
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
              </div>
            )}

            {/* Destinations List */}
            {placeDetails.length > 0 && (
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Destinations</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {placeDetails.map((place, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <span className="text-lg">{getPlaceCategoryIcon(place.place_category)}</span>
                        <div className="flex-grow">
                          <h3 className="font-medium text-gray-900">{place.place_name}</h3>
                          <div className="flex items-center justify-between text-sm text-gray-600 mt-1">
                            <span className="badge-primary">{place.place_category}</span>
                            <span>{formatCurrency(place.price_per_item)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <button
                  onClick={handleStartNavigation}
                  className="w-full btn-primary flex items-center justify-center space-x-2"
                >
                  <Navigation className="w-5 h-5" />
                  <span>Start Navigation</span>
                </button>
                
                <button
                  onClick={handleViewMap}
                  className="w-full btn-outline flex items-center justify-center space-x-2"
                >
                  <MapPin className="w-5 h-5" />
                  <span>View Map</span>
                </button>
                
                <button
                  onClick={handleShare}
                  className="w-full btn-outline flex items-center justify-center space-x-2"
                >
                  <Share2 className="w-5 h-5" />
                  <span>Share Booking</span>
                </button>
                
                <button
                  onClick={handleDownload}
                  className="w-full btn-outline flex items-center justify-center space-x-2"
                >
                  <Download className="w-5 h-5" />
                  <span>Download Receipt</span>
                </button>
              </div>
            </div>

            {/* Hotel Info */}
            {hotelDetail && (
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Hotel</h3>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-900">{hotelDetail.hotel_name}</h4>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span className="badge-primary">
                        {hotelDetail.hotel_category}
                      </span>
                      <span>•</span>
                      <span>{formatCurrency(hotelDetail.price_per_night)}/night</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Next Steps */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Next Steps</h3>
              
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-green-600" />
                  </div>
                  <span>Booking confirmed and saved</span>
                </div>
                
                <div className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin className="w-3 h-3 text-blue-600" />
                  </div>
                  <span>Plan your route to destinations</span>
                </div>
                
                <div className="flex items-start space-x-2">
                  <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Calendar className="w-3 h-3 text-purple-600" />
                  </div>
                  <span>Choose your travel dates</span>
                </div>
              </div>
            </div>

            {/* Back to Home */}
            <button
              onClick={() => navigate('/')}
              className="w-full btn-accent flex items-center justify-center space-x-2"
            >
              <ArrowRight className="w-5 h-5" />
              <span>Plan Another Trip</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;

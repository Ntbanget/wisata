import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Users, DollarSign, Moon, Clock, Hotel, Map, Car, User, Star, Image as ImageIcon } from 'lucide-react';
import apiService from '../../services/api';
import { formatCurrency } from '../../utils/helpers';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

const BookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadBookingDetail();
  }, [id]);

  const loadBookingDetail = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Loading booking detail for ID:', id);
      const response = await apiService.getBookingById(id);
      console.log('API Response:', response);
      setBooking(response.data || response);
    } catch (err) {
      console.error('Error loading booking detail:', err);
      console.error('Error response:', err.response);
      setError('Failed to load booking detail');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate price breakdown
  const getPriceBreakdown = () => {
    if (!booking || !booking.details) return [];

    const breakdown = [];
    const hotelDetails = booking.details.find(d => d.hotel_id);
    const placeDetails = booking.details.filter(d => d.tourist_place_id);

    // Hotel cost
    if (hotelDetails) {
      const hotelTotal = hotelDetails.price_per_night * booking.nights * booking.total_rooms;
      breakdown.push({
        type: 'hotel',
        name: hotelDetails.hotel_name,
        quantity: `${booking.nights} night${booking.nights > 1 ? 's' : ''} × ${booking.total_rooms} room${booking.total_rooms > 1 ? 's' : ''}`,
        price: hotelDetails.price_per_night,
        total: hotelTotal
      });
    }

    // Tourist places cost
    placeDetails.forEach(place => {
      const placeTotal = place.ticket_price * place.quantity * booking.people_count;
      breakdown.push({
        type: 'place',
        name: place.place_name,
        quantity: `${place.quantity} × ${booking.people_count} person${booking.people_count > 1 ? 's' : ''}`,
        price: place.ticket_price,
        total: placeTotal
      });
    });

    // Vehicle cost
    if (booking.vehicle_id && booking.vehicle_price_per_day) {
      const vehicleTotal = booking.vehicle_price_per_day * booking.nights;
      breakdown.push({
        type: 'vehicle',
        name: booking.vehicle_name || 'Vehicle',
        quantity: `${booking.nights} day${booking.nights > 1 ? 's' : ''}`,
        price: booking.vehicle_price_per_day,
        total: vehicleTotal
      });
    }

    // Tour guide cost
    if (booking.guide_id && booking.guide_price_per_day) {
      const guideTotal = booking.guide_price_per_day * booking.nights;
      breakdown.push({
        type: 'guide',
        name: booking.guide_name || 'Tour Guide',
        quantity: `${booking.nights} day${booking.nights > 1 ? 's' : ''}`,
        price: booking.guide_price_per_day,
        total: guideTotal
      });
    }

    return breakdown;
  };

  // Distribute tourist places across nights
  const getItinerary = () => {
    if (!booking || !booking.details) return [];

    const nights = booking.nights || 1;
    const touristPlaces = booking.details.filter(d => d.tourist_place_id);
    const hotel = booking.details.find(d => d.hotel_id);

    const itinerary = [];
    const placesPerNight = Math.ceil(touristPlaces.length / nights);

    for (let night = 1; night <= nights; night++) {
      const startIndex = (night - 1) * placesPerNight;
      const endIndex = startIndex + placesPerNight;
      const nightPlaces = touristPlaces.slice(startIndex, endIndex);

      itinerary.push({
        night: night,
        hotel: hotel,
        places: nightPlaces
      });
    }

    return itinerary;
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <LoadingSpinner size="large" text="Loading booking detail..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <ErrorMessage error={error} />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="p-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Booking not found</h3>
          <button
            onClick={() => navigate('/customer/bookings')}
            className="btn-primary mt-4"
          >
            Back to My Bookings
          </button>
        </div>
      </div>
    );
  }

  const itinerary = getItinerary();
  const priceBreakdown = getPriceBreakdown();

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/customer/bookings')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to My Bookings
        </button>
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Booking #{booking.id}</h1>
            <p className="text-gray-600 mt-2">{booking.city_name}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-indigo-600">{formatCurrency(booking.total_price)}</p>
            <p className="text-sm text-gray-600">Total Price</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Booking Info & Itinerary */}
        <div className="lg:col-span-2 space-y-8">
          {/* Booking Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Information</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Trip Date</p>
                  <p className="font-medium text-gray-900">
                    {booking.trip_date ? new Date(booking.trip_date).toLocaleDateString('id-ID') : 'Not set'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Moon className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="font-medium text-gray-900">{booking.nights} Night{booking.nights > 1 ? 's' : ''}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">People</p>
                  <p className="font-medium text-gray-900">{booking.people_count} Person{booking.people_count > 1 ? 's' : ''}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Budget</p>
                  <p className="font-medium text-gray-900">{formatCurrency(booking.budget)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-medium text-gray-900">
                    {booking.status === 'PENDING_PAYMENT' ? 'Menunggu Pembayaran' :
                     booking.status === 'CONFIRMED' ? 'Dikonfirmasi' :
                     booking.status === 'CANCELLED' ? 'Dibatalkan' : booking.status}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">City</p>
                  <p className="font-medium text-gray-900">{booking.city_name}</p>
                </div>
              </div>
            </div>

            {/* Vehicle & Guide Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {booking.vehicle_id && (
                <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                  <div className="flex items-start gap-3">
                    <Car className="w-5 h-5 text-indigo-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{booking.vehicle_name}</h4>
                      <p className="text-sm text-gray-600">{booking.vehicle_type}</p>
                      <p className="text-sm text-gray-600">Capacity: {booking.vehicle_capacity} people</p>
                      <p className="text-sm text-indigo-600 font-medium">
                        {formatCurrency(booking.vehicle_price_per_day)} / day
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {booking.guide_id && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{booking.guide_name}</h4>
                      {booking.guide_specialization && (
                        <p className="text-sm text-gray-600">{booking.guide_specialization}</p>
                      )}
                      {booking.guide_rating && (
                        <p className="text-sm text-yellow-600 flex items-center gap-1">
                          <Star className="w-4 h-4 fill-current" />
                          {booking.guide_rating} / 5
                        </p>
                      )}
                      <p className="text-sm text-green-600 font-medium">
                        {formatCurrency(booking.guide_price_per_day)} / day
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Itinerary Roadmap */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Your Trip Roadmap</h2>

            {itinerary.length === 0 ? (
              <div className="text-center py-8 text-gray-600">
                No itinerary details available
              </div>
            ) : (
              <div className="space-y-8">
                {itinerary.map((day, index) => (
                  <div key={day.night} className="relative pl-8">
                    {/* Timeline line */}
                    {index < itinerary.length - 1 && (
                      <div className="absolute left-3 top-12 bottom-0 w-0.5 bg-gradient-to-b from-indigo-300 to-indigo-100"></div>
                    )}

                    {/* Day header */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                        <span className="text-xl font-bold text-white">{day.night}</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          Night {day.night}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {day.places.length} place{day.places.length > 1 ? 's' : ''} to visit
                        </p>
                      </div>
                    </div>

                    {/* Hotel */}
                    {day.hotel && (
                      <div className="mb-6 p-5 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200 shadow-sm">
                        <div className="flex gap-4">
                          {day.hotel.hotel_image_url ? (
                            <img
                              src={day.hotel.hotel_image_url}
                              alt={day.hotel.hotel_name}
                              className="w-24 h-24 object-cover rounded-lg"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-24 h-24 bg-blue-200 rounded-lg flex items-center justify-center">
                              <Hotel className="w-10 h-10 text-blue-400" />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-semibold text-gray-900 text-lg">{day.hotel.hotel_name}</h4>
                                {day.hotel.hotel_rating && (
                                  <p className="text-sm text-yellow-600 flex items-center gap-1 mt-1">
                                    <Star className="w-4 h-4 fill-current" />
                                    {day.hotel.hotel_rating} / 5
                                  </p>
                                )}
                                {day.hotel.hotel_category && (
                                  <span className="inline-block mt-2 px-2 py-1 text-xs bg-blue-200 text-blue-800 rounded">
                                    {day.hotel.hotel_category}
                                  </span>
                                )}
                              </div>
                              <p className="text-lg font-bold text-blue-600">
                                {formatCurrency(day.hotel.price_per_night)}
                                <span className="text-sm font-normal text-gray-600">/night</span>
                              </p>
                            </div>
                            {day.hotel.hotel_description && (
                              <p className="text-sm text-gray-600 mt-2 line-clamp-2">{day.hotel.hotel_description}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tourist Places */}
                    <div className="space-y-4">
                      {day.places.map((place, placeIndex) => (
                        <div key={place.detail_id} className="relative pl-8">
                          {/* Timeline line for places */}
                          {placeIndex < day.places.length - 1 && (
                            <div className="absolute left-3 top-8 bottom-0 w-0.5 bg-gray-200"></div>
                          )}

                          <div className="p-5 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all">
                            <div className="flex gap-4">
                              {place.place_image_url ? (
                                <img
                                  src={place.place_image_url}
                                  alt={place.place_name}
                                  className="w-24 h-24 object-cover rounded-lg"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                                  <Map className="w-10 h-10 text-gray-400" />
                                </div>
                              )}
                              <div className="flex-1">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h4 className="font-semibold text-gray-900 text-lg">{place.place_name}</h4>
                                    {place.place_category && (
                                      <span className="inline-block mt-2 px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded">
                                        {place.place_category}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-lg font-bold text-indigo-600">
                                    {formatCurrency(place.ticket_price)}
                                    <span className="text-sm font-normal text-gray-600">/person</span>
                                  </p>
                                </div>
                                {place.place_description && (
                                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{place.place_description}</p>
                                )}
                                <p className="text-sm text-gray-500 mt-2">
                                  Quantity: {place.quantity} × {booking.people_count} person{booking.people_count > 1 ? 's' : ''}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Price Breakdown */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Price Breakdown</h2>
            <div className="space-y-3">
              {priceBreakdown.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-600">{item.quantity}</p>
                  </div>
                  <p className="font-semibold text-gray-900">{formatCurrency(item.total)}</p>
                </div>
              ))}
              <div className="flex justify-between items-center py-3 border-t-2 border-gray-200 mt-4">
                <p className="text-lg font-semibold text-gray-900">Total</p>
                <p className="text-xl font-bold text-indigo-600">{formatCurrency(booking.total_price)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetail;

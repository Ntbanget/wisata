import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Icon } from 'leaflet';
import { apiService } from '../services/api';
import { formatCurrency } from '../utils/helpers';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

// Fix for default markers in react-leaflet
delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const MapView = ({
  selectedPackage = null,
  cityId = null,
  height = '500px',
  onBookCustomTrip = null,
}) => {
  const [hotels, setHotels] = useState([]);
  const [touristPlaces, setTouristPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [selectedPlaces, setSelectedPlaces] = useState([]);

  // Center of Central Java
  const defaultCenter = [-7.0, 110.0];
  const defaultZoom = 8;

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cityId]);

  useEffect(() => {
    if (selectedPackage) {
      setSelectedHotel(selectedPackage.hotel);
      setSelectedPlaces(selectedPackage.tourist_places);
    } else {
      setSelectedHotel(null);
      setSelectedPlaces([]);
    }
  }, [selectedPackage]);

  const hotelPrice = selectedHotel ? Number(selectedHotel.price_per_night) || 0 : 0;
  const placesPrice = selectedPlaces.reduce(
    (sum, place) => sum + (Number(place.ticket_price) || 0),
    0
  );
  const combinedTotal = hotelPrice + placesPrice;

  const handleRemovePlace = (placeId) => {
    setSelectedPlaces((prev) => prev.filter((p) => p.id !== placeId));
  };

  const handleClearSelection = () => {
    setSelectedHotel(null);
    setSelectedPlaces([]);
  };

  const handleBookTrip = () => {
    if (typeof onBookCustomTrip === 'function' && selectedHotel && selectedPlaces.length > 0) {
      onBookCustomTrip({
        hotel: selectedHotel,
        tourist_places: selectedPlaces,
        total_price: combinedTotal,
      });
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Load hotels
      let hotelsData = [];
      if (cityId) {
        hotelsData = await apiService.getHotelsByCity(cityId);
        hotelsData = hotelsData.data || [];
      } else {
        // Load all hotels
        const response = await apiService.getAllHotels({ limit: 100 });
        hotelsData = response.data || [];
      }

      // Load tourist places
      let placesData = [];
      if (cityId) {
        placesData = await apiService.getTouristPlacesByCity(cityId);
        placesData = placesData.data || [];
      } else {
        // Load all tourist places
        const response = await apiService.getAllTouristPlaces({ limit: 200 });
        placesData = response.data || [];
      }

      setHotels(hotelsData);
      setTouristPlaces(placesData);
    } catch (error) {
      setError('Failed to load map data');
      console.error('Error loading map data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Custom icons for different marker types
  const hotelIcon = new Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="12" fill="#3B82F6" stroke="white" stroke-width="2"/>
        <path d="M16 8 L20 12 L16 16 L12 12 Z" fill="white"/>
      </svg>
    `),
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });

  const placeIcon = new Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="12" fill="#10B981" stroke="white" stroke-width="2"/>
        <circle cx="16" cy="16" r="4" fill="white"/>
      </svg>
    `),
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });

  const selectedHotelIcon = new Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="16" fill="#DC2626" stroke="white" stroke-width="3"/>
        <path d="M20 10 L26 16 L20 22 L14 16 Z" fill="white"/>
      </svg>
    `),
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
  });

  const selectedPlaceIcon = new Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="16" fill="#DC2626" stroke="white" stroke-width="3"/>
        <circle cx="20" cy="20" r="6" fill="white"/>
      </svg>
    `),
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
  });

  // Calculate route coordinates for polyline
  const getRouteCoordinates = () => {
    if (!selectedHotel || selectedPlaces.length === 0) return [];
    
    const coords = [
      [selectedHotel.lat, selectedHotel.lng],
      ...selectedPlaces.map(place => [place.lat, place.lng])
    ];
    
    return coords;
  };

  // Calculate map center and zoom based on data
  const getMapBounds = () => {
    if (selectedHotel && selectedPlaces.length > 0) {
      const allPoints = [
        [selectedHotel.lat, selectedHotel.lng],
        ...selectedPlaces.map(place => [place.lat, place.lng])
      ];
      return allPoints;
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <LoadingSpinner size="medium" text="Loading map..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <ErrorMessage error={error} />
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Map Legend */}
      <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-soft p-3">
        <h4 className="font-medium text-gray-900 mb-2">Legend</h4>
        <div className="space-y-1 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            <span>Hotels</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span>Tourist Places</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <span>Selected</span>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height, width: '100%' }}
        bounds={getMapBounds()}
        boundsOptions={{ padding: [50, 50] }}
      >
        {/* OpenStreetMap Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Hotel Markers */}
        {hotels.map((hotel) => (
          <Marker
            key={`hotel-${hotel.id}`}
            position={[hotel.lat, hotel.lng]}
            icon={selectedHotel?.id === hotel.id ? selectedHotelIcon : hotelIcon}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-lg">{hotel.name}</h3>
                <p className="text-sm text-gray-600 mb-1">Hotel</p>
                <p className="text-sm font-medium">
                  {formatCurrency(hotel.price_per_night)}/night
                </p>
                <p className="text-sm text-gray-600">
                  Rating: {hotel.rating} ⭐
                </p>
                {selectedHotel?.id !== hotel.id && (
                  <button
                    onClick={() => setSelectedHotel(hotel)}
                    className="mt-2 text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                  >
                    Select Hotel
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Tourist Place Markers */}
        {touristPlaces.map((place) => (
          <Marker
            key={`place-${place.id}`}
            position={[place.lat, place.lng]}
            icon={selectedPlaces.some(p => p.id === place.id) ? selectedPlaceIcon : placeIcon}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-lg">{place.name}</h3>
                <p className="text-sm text-gray-600 mb-1">{place.category}</p>
                <p className="text-sm font-medium">
                  {formatCurrency(place.ticket_price)} entry
                </p>
                {!selectedPlaces.some(p => p.id === place.id) && (
                  <button
                    onClick={() => setSelectedPlaces([...selectedPlaces, place])}
                    className="mt-2 text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                  >
                    Add to Trip
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Route Line */}
        {selectedHotel && selectedPlaces.length > 0 && (
          <Polyline
            positions={getRouteCoordinates()}
            color="red"
            weight={3}
            opacity={0.7}
            dashArray="10, 5"
          />
        )}
      </MapContainer>

      {/* Selected Items Summary */}
      {(selectedHotel || selectedPlaces.length > 0) && (
        <div className="absolute bottom-4 right-4 z-10 bg-white rounded-lg shadow-soft p-4 w-72 max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-900">Your Trip</h4>
            <button
              onClick={handleClearSelection}
              className="text-xs text-red-600 hover:text-red-700 font-medium"
              title="Clear all selections"
            >
              Clear
            </button>
          </div>

          {selectedHotel && (
            <div className="mb-3 pb-3 border-b border-gray-100">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-blue-700 uppercase tracking-wide">Hotel</p>
                  <p className="text-sm font-medium text-gray-900 truncate">{selectedHotel.name}</p>
                  <p className="text-xs text-gray-600">
                    {formatCurrency(selectedHotel.price_per_night)} / night
                  </p>
                </div>
                <button
                  onClick={() => setSelectedHotel(null)}
                  className="text-gray-400 hover:text-red-600 text-lg leading-none"
                  title="Remove hotel"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {selectedPlaces.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-medium text-green-700 uppercase tracking-wide mb-1">
                Destinations ({selectedPlaces.length})
              </p>
              <ul className="space-y-1">
                {selectedPlaces.map((place) => (
                  <li
                    key={place.id}
                    className="flex items-start justify-between gap-2 text-sm text-gray-800"
                  >
                    <div className="min-w-0">
                      <span className="font-medium truncate block">{place.name}</span>
                      <span className="text-xs text-gray-500">
                        {formatCurrency(place.ticket_price)}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemovePlace(place.id)}
                      className="text-gray-400 hover:text-red-600 text-lg leading-none flex-shrink-0"
                      title="Remove this destination"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="border-t border-gray-200 pt-2 mt-2">
            <div className="flex items-center justify-between text-sm font-semibold text-gray-900">
              <span>Total</span>
              <span>{formatCurrency(combinedTotal)}</span>
            </div>
          </div>

          {onBookCustomTrip && (
            <button
              onClick={handleBookTrip}
              disabled={!selectedHotel || selectedPlaces.length === 0}
              className="w-full mt-3 btn-primary text-sm py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              title={
                !selectedHotel
                  ? 'Pick a hotel marker first'
                  : selectedPlaces.length === 0
                    ? 'Add at least one destination'
                    : 'Book this custom trip'
              }
            >
              Book This Trip
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MapView;

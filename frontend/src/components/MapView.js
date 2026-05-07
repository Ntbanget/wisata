import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { Icon, latLngBounds } from 'leaflet';
import { apiService } from '../services/api';
import { formatCurrency, calculateDistance } from '../utils/helpers';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

// Fix for default markers in react-leaflet
delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Helper component that exposes the leaflet map instance via a ref so the
// parent can call fitBounds() programmatically (e.g. from a 'Show Route' button).
function MapRefSetter({ mapRef }) {
  const map = useMap();
  useEffect(() => {
    if (mapRef) mapRef.current = map;
    return () => {
      if (mapRef && mapRef.current === map) mapRef.current = null;
    };
  }, [map, mapRef]);
  return null;
}

const MapView = ({
  selectedPackage = null,
  cityId = null,
  height = '500px',
  onBookCustomTrip = null,
  readOnly = false,
  nights = 1,
}) => {
  const [hotels, setHotels] = useState([]);
  const [touristPlaces, setTouristPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [selectedPlaces, setSelectedPlaces] = useState([]);
  // Map place_id -> day number (1..days). Defaults to round-robin when adding.
  const [placeDay, setPlaceDay] = useState({});
  const [routeGeometry, setRouteGeometry] = useState(null);
  const [routeStats, setRouteStats] = useState(null); // { distance_km, duration_min }
  const [routeLoading, setRouteLoading] = useState(false);

  const safeNights = Math.max(1, Math.min(parseInt(nights, 10) || 1, 14));
  const days = safeNights + 1;
  const isMultiDay = days > 1 && !readOnly;

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

  // Fetch road-following route from OSRM whenever the selection changes.
  // Falls back to straight lines if OSRM is unreachable or returns no route.
  useEffect(() => {
    if (!selectedHotel || selectedPlaces.length === 0) {
      setRouteGeometry(null);
      setRouteStats(null);
      return;
    }

    const points = [
      [Number(selectedHotel.lat), Number(selectedHotel.lng)],
      ...selectedPlaces.map((p) => [Number(p.lat), Number(p.lng)]),
    ].filter(([lat, lng]) => Number.isFinite(lat) && Number.isFinite(lng));

    if (points.length < 2) {
      setRouteGeometry(null);
      setRouteStats(null);
      return;
    }

    const coordsParam = points.map(([lat, lng]) => `${lng},${lat}`).join(';');
    const url = `https://router.project-osrm.org/route/v1/driving/${coordsParam}?overview=full&geometries=geojson`;

    let cancelled = false;
    setRouteLoading(true);

    fetch(url)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`OSRM ${r.status}`))))
      .then((data) => {
        if (cancelled) return;
        const route = data && data.routes && data.routes[0];
        if (!route || !route.geometry || !route.geometry.coordinates) {
          setRouteGeometry(null);
          setRouteStats(null);
          return;
        }
        // OSRM returns [lng, lat]; Leaflet expects [lat, lng]
        const latlngs = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
        setRouteGeometry(latlngs);
        setRouteStats({
          distance_km: route.distance / 1000,
          duration_min: route.duration / 60,
        });
      })
      .catch(() => {
        if (cancelled) return;
        setRouteGeometry(null);
        setRouteStats(null);
      })
      .finally(() => {
        if (!cancelled) setRouteLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedHotel, selectedPlaces]);

  const MAX_DISTANCE_KM = 50;

  // When a hotel is selected in custom mode, only show places within 50km
  const visiblePlaces = (!readOnly && selectedHotel)
    ? touristPlaces.filter((place) => {
        const dist = calculateDistance(
          Number(selectedHotel.lat), Number(selectedHotel.lng),
          Number(place.lat), Number(place.lng)
        );
        return dist <= MAX_DISTANCE_KM;
      })
    : touristPlaces;

  const hotelPricePerNight = selectedHotel ? Number(selectedHotel.price_per_night) || 0 : 0;
  const hotelPrice = hotelPricePerNight * safeNights;
  const placesPrice = selectedPlaces.reduce(
    (sum, place) => sum + (Number(place.ticket_price) || 0),
    0
  );
  const combinedTotal = hotelPrice + placesPrice;

  const handleRemovePlace = (placeId) => {
    setSelectedPlaces((prev) => prev.filter((p) => p.id !== placeId));
    setPlaceDay((prev) => {
      const copy = { ...prev };
      delete copy[placeId];
      return copy;
    });
  };

  // Pick the day with the fewest destinations so far (load-balancing).
  const nextDayForNewPlace = () => {
    if (days <= 1) return 1;
    const counts = Array.from({ length: days }, () => 0);
    selectedPlaces.forEach((p) => {
      const d = placeDay[p.id] || 1;
      if (d >= 1 && d <= days) counts[d - 1]++;
    });
    let minIdx = 0;
    for (let i = 1; i < counts.length; i++) {
      if (counts[i] < counts[minIdx]) minIdx = i;
    }
    return minIdx + 1;
  };

  const handleAddPlace = (place) => {
    setSelectedPlaces((prev) =>
      prev.some((p) => p.id === place.id) ? prev : [...prev, place]
    );
    setPlaceDay((prev) =>
      prev[place.id] ? prev : { ...prev, [place.id]: nextDayForNewPlace() }
    );
  };

  const handleChangeDay = (placeId, day) => {
    setPlaceDay((prev) => ({ ...prev, [placeId]: day }));
  };

  const handleClearSelection = () => {
    setSelectedHotel(null);
    setSelectedPlaces([]);
    setPlaceDay({});
  };

  // Build itinerary grouped by day for display + checkout payload.
  const itineraryByDay = (() => {
    if (days <= 1) return null;
    const buckets = Array.from({ length: days }, (_, i) => ({ day: i + 1, places: [] }));
    selectedPlaces.forEach((p) => {
      const d = placeDay[p.id] || 1;
      const idx = Math.min(Math.max(d, 1), days) - 1;
      buckets[idx].places.push(p);
    });
    return buckets;
  })();

  const handleBookTrip = () => {
    if (typeof onBookCustomTrip === 'function' && selectedHotel && selectedPlaces.length > 0) {
      onBookCustomTrip({
        hotel: selectedHotel,
        tourist_places: selectedPlaces,
        total_price: combinedTotal,
        nights: safeNights,
        days,
        itinerary: itineraryByDay,
      });
    }
  };

  const mapRef = useRef(null);

  const handleShowRoute = () => {
    if (!mapRef.current || !selectedHotel || selectedPlaces.length === 0) return;
    const points = [
      [Number(selectedHotel.lat), Number(selectedHotel.lng)],
      ...selectedPlaces.map((p) => [Number(p.lat), Number(p.lng)]),
    ].filter(([lat, lng]) => Number.isFinite(lat) && Number.isFinite(lng));
    if (points.length === 0) return;
    const bounds = latLngBounds(points);
    mapRef.current.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
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
      [Number(selectedHotel.lat), Number(selectedHotel.lng)],
      ...selectedPlaces.map((place) => [Number(place.lat), Number(place.lng)])
    ];

    return coords;
  };

  // Calculate map center and zoom based on data
  const getMapBounds = () => {
    if (selectedHotel && selectedPlaces.length > 0) {
      const allPoints = [
        [Number(selectedHotel.lat), Number(selectedHotel.lng)],
        ...selectedPlaces.map((place) => [Number(place.lat), Number(place.lng)])
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
      <div className="absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow-soft p-3">
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
        <MapRefSetter mapRef={mapRef} />

        {/* OpenStreetMap Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Hotel Markers */}
        {hotels.map((hotel) => {
          const isSelectedHotel = selectedHotel?.id === hotel.id;
          return (
            <Marker
              key={`hotel-${hotel.id}`}
              position={[Number(hotel.lat), Number(hotel.lng)]}
              icon={isSelectedHotel ? selectedHotelIcon : hotelIcon}
            >
              <Popup>
                <div className="p-2 min-w-[180px]">
                  <h3 className="font-bold text-base">{hotel.name}</h3>
                  <p className="text-xs text-gray-600 mb-1">Hotel</p>
                  <p className="text-sm font-medium">
                    {formatCurrency(hotel.price_per_night)}/night
                  </p>
                  <p className="text-xs text-gray-600">
                    Rating: {Number(hotel.rating).toFixed(1)} ⭐
                  </p>
                  {readOnly ? (
                    isSelectedHotel && (
                      <p className="mt-2 text-xs font-medium text-blue-700">
                        Part of your package
                      </p>
                    )
                  ) : isSelectedHotel ? (
                    <button
                      onClick={() => setSelectedHotel(null)}
                      className="mt-2 w-full text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    >
                      Remove Hotel
                    </button>
                  ) : (
                    <button
                      onClick={() => setSelectedHotel(hotel)}
                      className="mt-2 w-full text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                    >
                      Select Hotel
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Tourist Place Markers (filtered to 50km from selected hotel in custom mode) */}
        {visiblePlaces.map((place) => {
          const isSelectedPlace = selectedPlaces.some((p) => p.id === place.id);
          return (
            <Marker
              key={`place-${place.id}`}
              position={[Number(place.lat), Number(place.lng)]}
              icon={isSelectedPlace ? selectedPlaceIcon : placeIcon}
            >
              <Popup>
                <div className="p-2 min-w-[180px]">
                  <h3 className="font-bold text-base">{place.name}</h3>
                  <p className="text-xs text-gray-600 mb-1">{place.category}</p>
                  <p className="text-sm font-medium">
                    {formatCurrency(place.ticket_price)} entry
                  </p>
                  {readOnly ? (
                    isSelectedPlace && (
                      <p className="mt-2 text-xs font-medium text-green-700">
                        Part of your package
                      </p>
                    )
                  ) : isSelectedPlace ? (
                    <button
                      onClick={() => handleRemovePlace(place.id)}
                      className="mt-2 w-full text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    >
                      Remove from Trip
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAddPlace(place)}
                      className="mt-2 w-full text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                    >
                      Add to Trip
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Route Line — uses OSRM road-following geometry if available,
            otherwise falls back to a dashed straight line between markers. */}
        {selectedHotel && selectedPlaces.length > 0 && routeGeometry && routeGeometry.length > 1 && (
          <Polyline
            positions={routeGeometry}
            color="#dc2626"
            weight={4}
            opacity={0.85}
          />
        )}
        {selectedHotel && selectedPlaces.length > 0 && !routeGeometry && (
          <Polyline
            positions={getRouteCoordinates()}
            color="red"
            weight={2}
            opacity={0.5}
            dashArray="6, 6"
          />
        )}
      </MapContainer>

      {/* Selected Items Summary */}
      {(selectedHotel || selectedPlaces.length > 0) && (
        <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-medium border border-gray-200 p-4 w-72 max-h-[calc(100%-2rem)] overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-900">
              {readOnly ? 'Package Itinerary' : 'Your Trip'}
            </h4>
            {!readOnly && (
              <button
                onClick={handleClearSelection}
                className="text-xs text-red-600 hover:text-red-700 font-medium"
                title="Clear all selections"
              >
                Clear
              </button>
            )}
          </div>

          {readOnly && (
            <p className="text-xs text-gray-500 mb-2">
              This is a fixed package — to build your own, go to Explore Map.
            </p>
          )}

          {selectedHotel && (
            <div className="mb-3 pb-3 border-b border-gray-100">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-blue-700 uppercase tracking-wide">Hotel</p>
                  <p className="text-sm font-medium text-gray-900 truncate">{selectedHotel.name}</p>
                  <p className="text-xs text-gray-600">
                    {formatCurrency(selectedHotel.price_per_night)} / malam
                    {safeNights > 1 && (
                      <span className="ml-1 text-gray-500">
                        × {safeNights} = {formatCurrency(hotelPrice)}
                      </span>
                    )}
                  </p>
                </div>
                {!readOnly && (
                  <button
                    onClick={() => setSelectedHotel(null)}
                    className="text-gray-400 hover:text-red-600 text-lg leading-none"
                    title="Remove hotel"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          )}

          {selectedPlaces.length > 0 && !isMultiDay && (
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
                    {!readOnly && (
                      <button
                        onClick={() => handleRemovePlace(place.id)}
                        className="text-gray-400 hover:text-red-600 text-lg leading-none flex-shrink-0"
                        title="Remove this destination"
                      >
                        ×
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {selectedPlaces.length > 0 && isMultiDay && itineraryByDay && (
            <div className="mb-3 space-y-2">
              <p className="text-xs font-medium text-green-700 uppercase tracking-wide">
                Destinasi per Hari ({selectedPlaces.length} total · {safeNights} malam)
              </p>
              {itineraryByDay.map((dayGroup) => (
                <div key={dayGroup.day} className="border border-gray-100 rounded-md p-2">
                  <p className="text-xs font-semibold text-gray-700 mb-1">
                    Hari {dayGroup.day}
                    {dayGroup.places.length === 0 && (
                      <span className="ml-1 font-normal text-gray-400">
                        (belum ada destinasi)
                      </span>
                    )}
                  </p>
                  <ul className="space-y-1">
                    {dayGroup.places.map((place) => (
                      <li
                        key={place.id}
                        className="flex items-start justify-between gap-2 text-xs text-gray-800"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="font-medium truncate block">{place.name}</span>
                          <span className="text-[10px] text-gray-500">
                            {formatCurrency(place.ticket_price)}
                          </span>
                        </div>
                        <select
                          value={placeDay[place.id] || 1}
                          onChange={(e) => handleChangeDay(place.id, parseInt(e.target.value, 10))}
                          className="text-[10px] border border-gray-300 rounded px-1 py-0.5"
                          title="Pindahkan ke hari lain"
                        >
                          {Array.from({ length: days }, (_, i) => i + 1).map((d) => (
                            <option key={d} value={d}>
                              H{d}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleRemovePlace(place.id)}
                          className="text-gray-400 hover:text-red-600 text-base leading-none flex-shrink-0"
                          title="Hapus dari trip"
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-gray-200 pt-2 mt-2">
            <div className="flex items-center justify-between text-sm font-semibold text-gray-900">
              <span>Total</span>
              <span>{formatCurrency(combinedTotal)}</span>
            </div>
          </div>

          {!readOnly && selectedHotel && selectedPlaces.length > 0 && (
            <button
              onClick={handleShowRoute}
              className="w-full mt-3 text-sm py-2 rounded-lg border border-primary-600 text-primary-700 hover:bg-primary-50 font-medium transition-colors"
              title="Zoom map to fit your route"
            >
              Show Route on Map
            </button>
          )}

          {/* Route / Travel Plan info (shown BEFORE book button) */}
          {!readOnly && selectedHotel && selectedPlaces.length > 0 && (() => {
            const route = [selectedHotel, ...selectedPlaces];
            let haversineTotal = 0;
            const legs = [];
            for (let i = 0; i < route.length - 1; i++) {
              const d = calculateDistance(
                Number(route[i].lat), Number(route[i].lng),
                Number(route[i + 1].lat), Number(route[i + 1].lng)
              );
              haversineTotal += d;
              legs.push({
                from: route[i].name,
                to: route[i + 1].name,
                km: d.toFixed(1),
              });
            }
            // Prefer real driving distance/time from OSRM when available.
            const realDistance = routeStats ? routeStats.distance_km : null;
            const realDurationMin = routeStats ? routeStats.duration_min : null;
            const fallbackHours = Math.max(1, Math.ceil(haversineTotal / 40));
            return (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg text-xs">
                <p className="font-semibold text-gray-800 mb-1">
                  Travel Plan {routeLoading && <span className="text-gray-500 font-normal">(calculating route...)</span>}
                </p>
                <ol className="list-decimal list-inside space-y-0.5 text-gray-700">
                  {legs.map((leg, i) => (
                    <li key={i}>
                      {leg.from} → {leg.to} <span className="text-gray-500">({leg.km} km lurus)</span>
                    </li>
                  ))}
                </ol>
                <div className="mt-2 flex justify-between text-gray-800 font-medium">
                  {realDistance != null ? (
                    <>
                      <span>Driving: {realDistance.toFixed(1)} km</span>
                      <span>~{Math.round(realDurationMin)} menit</span>
                    </>
                  ) : (
                    <>
                      <span>Total: {haversineTotal.toFixed(1)} km</span>
                      <span>~{fallbackHours} jam</span>
                    </>
                  )}
                </div>
                {realDistance == null && !routeLoading && (
                  <p className="mt-1 text-[10px] text-gray-500">
                    Routing service unavailable — showing straight-line estimate.
                  </p>
                )}
              </div>
            );
          })()}

          {!readOnly && onBookCustomTrip && (
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
              OK – Book This Trip
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MapView;

// Utility functions for the tourism travel planner

// Format currency to Indonesian Rupiah
export const formatCurrency = (amount) => {
  const num = Number(amount);
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number.isFinite(num) ? num : 0);
};

// Format date to readable format
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

// Format date only (without time)
export const formatDateOnly = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

// Calculate distance between two coordinates (Haversine formula)
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
};

// Generate OpenStreetMap directions URL
// Uses OSM's directions page with the OSRM routing engine.
export const generateMapsUrl = (hotel, destinations) => {
  if (!hotel || !destinations || destinations.length === 0) {
    return '#';
  }

  const points = [
    `${hotel.lat},${hotel.lng}`,
    ...destinations.map(dest => `${dest.lat},${dest.lng}`)
  ];

  const route = points.join(';');
  const lastPoint = points[points.length - 1];
  const [lastLat, lastLng] = lastPoint.split(',');

  return `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${route}#map=12/${lastLat}/${lastLng}`;
};

// Validate email format
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number (Indonesian format)
export const isValidPhone = (phone) => {
  const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,11}$/;
  return phoneRegex.test(phone.replace(/[-\s]/g, ''));
};

// Debounce function for search inputs
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Generate unique ID
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Get hotel category label
export const getHotelCategoryLabel = (category) => {
  const labels = {
    low: 'Budget',
    medium: 'Mid-range',
    high: 'Luxury'
  };
  return labels[category] || category;
};

// Get hotel category color
export const getHotelCategoryColor = (category) => {
  const colors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-purple-100 text-purple-800'
  };
  return colors[category] || 'bg-gray-100 text-gray-800';
};

// Get tourist place category icon
export const getPlaceCategoryIcon = (category) => {
  const icons = {
    Historical: '🏛️',
    Nature: '🌿',
    Cultural: '🎭',
    Beach: '🏖️',
    Religious: '⛪',
    Adventure: '🏔️',
    Museum: '🏛️',
    Park: '🌳',
    Monument: '🗿',
    Recreation: '🎢',
    Island: '🏝️',
    Market: '🛍️'
  };
  return icons[category] || '📍';
};

// Calculate estimated travel time (simple estimation)
export const estimateTravelTime = (distance) => {
  // Average speed of 40 km/h for city/tourist travel
  const avgSpeed = 40;
  const hours = distance / avgSpeed;
  
  if (hours < 1) {
    return `${Math.round(hours * 60)} minutes`;
  } else if (hours < 24) {
    return `${Math.round(hours * 10) / 10} hours`;
  } else {
    return `${Math.round(hours / 24 * 10) / 10} days`;
  }
};

// Generate itinerary text
export const generateItinerary = (hotel, destinations) => {
  const itinerary = [];
  
  // Day 1 - Check-in and first destination
  itinerary.push({
    day: 1,
    morning: `Check-in at ${hotel.name}`,
    afternoon: destinations[0] ? `Visit ${destinations[0].name}` : 'Free time',
    evening: 'Dinner and rest'
  });
  
  // Additional days for remaining destinations
  for (let i = 1; i < destinations.length; i++) {
    const dayNum = Math.floor(i / 2) + 2;
    const timeOfDay = i % 2 === 0 ? 'afternoon' : 'morning';
    
    if (!itinerary[dayNum - 1]) {
      itinerary[dayNum - 1] = { day: dayNum };
    }
    
    itinerary[dayNum - 1][timeOfDay] = `Visit ${destinations[i].name}`;
  }
  
  return itinerary;
};

// Copy text to clipboard
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy text: ', err);
    return false;
  }
};

// Scroll to element
export const scrollToElement = (elementId, offset = 0) => {
  const element = document.getElementById(elementId);
  if (element) {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;
    
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
};

// Get price range label
export const getPriceRangeLabel = (minPrice, maxPrice) => {
  if (minPrice === maxPrice) {
    return formatCurrency(minPrice);
  }
  return `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`;
};

// Validate budget
export const validateBudget = (budget) => {
  const num = parseFloat(budget);
  return !isNaN(num) && num >= 10000 && num <= 10000000;
};

// Get rating stars
export const getRatingStars = (rating) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  for (let i = 0; i < fullStars; i++) {
    stars.push('⭐');
  }
  
  if (hasHalfStar) {
    stars.push('✨');
  }
  
  const emptyStars = 5 - Math.ceil(rating);
  for (let i = 0; i < emptyStars; i++) {
    stars.push('☆');
  }
  
  return stars.join('');
};

// Calculate package score color
export const getScoreColor = (score) => {
  if (score >= 8) return 'text-green-600';
  if (score >= 6) return 'text-yellow-600';
  if (score >= 4) return 'text-orange-600';
  return 'text-red-600';
};

// =====================================================================
// Tour scheduling helpers
//   - getVisitMinutes(category)         -> typical visit duration
//   - getOpeningHours(category)         -> typical open/close window
//   - computeDailySchedule(hotel,places) -> full timeline for one malam
// =====================================================================

const _VISIT_MINUTES = {
  Historical: 90,
  Cultural:   60,
  Religious:  45,
  Museum:     60,
  Monument:   30,
  Park:       90,
  Recreation: 120,
  Adventure:  180,
  Nature:     120,
  Beach:      150,
  Island:     180,
  Market:     60,
};

export const getVisitMinutes = (category) => _VISIT_MINUTES[category] || 90;

const _OPENING_HOURS = {
  Historical: { open: '08:00', close: '17:00' },
  Cultural:   { open: '08:00', close: '21:00' },
  Religious:  { open: '04:00', close: '21:00' },
  Museum:     { open: '08:00', close: '16:00' },
  Monument:   { open: '06:00', close: '22:00' },
  Park:       { open: '06:00', close: '18:00' },
  Recreation: { open: '08:00', close: '21:00' },
  Adventure:  { open: '07:00', close: '17:00' },
  Nature:     { open: '06:00', close: '18:00' },
  Beach:      { open: '05:00', close: '19:00' },
  Island:     { open: '07:00', close: '17:00' },
  Market:     { open: '08:00', close: '22:00' },
};

export const getOpeningHours = (category) => _OPENING_HOURS[category] || { open: '08:00', close: '17:00' };

const _hhmm = (mins) => {
  const safe = ((Math.round(mins) % (24 * 60)) + 24 * 60) % (24 * 60);
  const h = Math.floor(safe / 60);
  const m = safe % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

export const formatHHMM = _hhmm;

export const formatDurationMinutes = (mins) => {
  const m = Math.max(0, Math.round(mins));
  if (m < 60) return `${m} mnt`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  if (rem === 0) return `${h} jam`;
  return `${h} jam ${rem} mnt`;
};

// Build a single-malam timeline starting from the hotel.
//   options.startMinutes        -> minutes-since-midnight (default 540 = 09:00)
//   options.drivingSpeedKmH     -> haversine fallback (default 40)
//   options.driveMinutesOverride -> array of real driving minutes per leg from OSRM
//   options.placeVisitOverride  -> per-place visit minutes (allows custom override)
export const computeDailySchedule = (hotel, places, options = {}) => {
  const {
    startMinutes = 540,
    drivingSpeedKmH = 40,
    driveMinutesOverride = null,
    placeVisitOverride = null,
  } = options;

  const safePlaces = Array.isArray(places) ? places.filter(Boolean) : [];
  if (!hotel || safePlaces.length === 0) {
    return {
      events: [],
      totalDriveMin: 0,
      totalVisitMin: 0,
      totalMin: 0,
      startTime: _hhmm(startMinutes),
      endTime: _hhmm(startMinutes),
    };
  }

  const events = [];
  let cursor = startMinutes;
  let totalDrive = 0;
  let totalVisit = 0;

  events.push({
    time: _hhmm(cursor),
    type: 'depart',
    label: `Berangkat dari ${hotel.name}`,
  });

  let prev = hotel;
  for (let i = 0; i < safePlaces.length; i++) {
    const place = safePlaces[i];
    const distKm = calculateDistance(
      Number(prev.lat), Number(prev.lng),
      Number(place.lat), Number(place.lng)
    );
    const haversineMin = Math.max(5, Math.round((distKm / drivingSpeedKmH) * 60));
    const driveMin = (Array.isArray(driveMinutesOverride) && driveMinutesOverride[i] != null)
      ? Math.max(1, Math.round(driveMinutesOverride[i]))
      : haversineMin;

    cursor += driveMin;
    totalDrive += driveMin;
    events.push({
      time: _hhmm(cursor),
      type: 'arrive',
      place,
      distanceKm: Math.round(distKm * 10) / 10,
      driveMin,
      label: `Tiba di ${place.name} (${(Math.round(distKm * 10) / 10)} km · ${driveMin} mnt)`,
    });

    const visitMin = (placeVisitOverride && placeVisitOverride[place.id] != null)
      ? Math.max(15, Math.round(placeVisitOverride[place.id]))
      : getVisitMinutes(place.category);

    cursor += visitMin;
    totalVisit += visitMin;
    const opening = getOpeningHours(place.category);
    events.push({
      time: _hhmm(cursor),
      type: 'leave',
      place,
      visitMin,
      opening,
      label: `Selesai kunjungan ${place.name} (~${formatDurationMinutes(visitMin)})`,
    });

    prev = place;
  }

  const distBack = calculateDistance(
    Number(prev.lat), Number(prev.lng),
    Number(hotel.lat), Number(hotel.lng)
  );
  const driveBack = Math.max(5, Math.round((distBack / drivingSpeedKmH) * 60));
  cursor += driveBack;
  totalDrive += driveBack;
  events.push({
    time: _hhmm(cursor),
    type: 'return',
    distanceKm: Math.round(distBack * 10) / 10,
    driveMin: driveBack,
    label: `Kembali ke ${hotel.name} (${(Math.round(distBack * 10) / 10)} km)`,
  });

  return {
    events,
    totalDriveMin: totalDrive,
    totalVisitMin: totalVisit,
    totalMin: totalDrive + totalVisit,
    startTime: _hhmm(startMinutes),
    endTime: _hhmm(cursor),
  };
};

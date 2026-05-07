const Hotel = require('../models/Hotel');
const TouristPlace = require('../models/TouristPlace');

// =====================================================================
// Tour-scheduling helpers (mirror frontend src/utils/helpers.js)
// =====================================================================
const VISIT_MINUTES = {
  Historical: 90,
  Cultural: 60,
  Religious: 45,
  Museum: 60,
  Monument: 30,
  Park: 90,
  Recreation: 120,
  Adventure: 180,
  Nature: 120,
  Beach: 150,
  Island: 180,
  Market: 60,
};
const OPENING_HOURS = {
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
const visitMin = (cat) => VISIT_MINUTES[cat] || 90;
const openingHours = (cat) => OPENING_HOURS[cat] || { open: '08:00', close: '17:00' };
const hhmm = (mins) => {
  const safe = ((Math.round(mins) % 1440) + 1440) % 1440;
  const h = Math.floor(safe / 60);
  const m = safe % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};
const haversineKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
};
const driveMinutes = (km, kmh = 40) => Math.max(5, Math.round((km / kmh) * 60));

// Build one malam's timeline starting from the hotel.
function buildMalamTimeline(hotel, places, startMinutes = 540) {
  if (!hotel || !places || places.length === 0) {
    return {
      events: [],
      totalDriveMin: 0,
      totalVisitMin: 0,
      totalMin: 0,
      startTime: hhmm(startMinutes),
      endTime: hhmm(startMinutes),
    };
  }
  const events = [];
  let cursor = startMinutes;
  let totalDrive = 0;
  let totalVisit = 0;
  events.push({ time: hhmm(cursor), type: 'depart', label: `Berangkat dari ${hotel.name}` });
  let prev = hotel;
  for (const place of places) {
    const km = haversineKm(Number(prev.lat), Number(prev.lng), Number(place.lat), Number(place.lng));
    const drive = driveMinutes(km);
    cursor += drive;
    totalDrive += drive;
    events.push({
      time: hhmm(cursor),
      type: 'arrive',
      place_id: place.id,
      place_name: place.name,
      distance_km: Math.round(km * 10) / 10,
      drive_min: drive,
      label: `Tiba di ${place.name} (${(Math.round(km * 10) / 10)} km · ${drive} mnt)`,
    });
    const v = visitMin(place.category);
    cursor += v;
    totalVisit += v;
    events.push({
      time: hhmm(cursor),
      type: 'leave',
      place_id: place.id,
      place_name: place.name,
      visit_min: v,
      opening: openingHours(place.category),
      label: `Selesai kunjungan ${place.name}`,
    });
    prev = place;
  }
  const distBack = haversineKm(Number(prev.lat), Number(prev.lng), Number(hotel.lat), Number(hotel.lng));
  const back = driveMinutes(distBack);
  cursor += back;
  totalDrive += back;
  events.push({
    time: hhmm(cursor),
    type: 'return',
    distance_km: Math.round(distBack * 10) / 10,
    drive_min: back,
    label: `Kembali ke ${hotel.name} (${(Math.round(distBack * 10) / 10)} km)`,
  });

  return {
    events,
    totalDriveMin: totalDrive,
    totalVisitMin: totalVisit,
    totalMin: totalDrive + totalVisit,
    startTime: hhmm(startMinutes),
    endTime: hhmm(cursor),
  };
}

// =====================================================================
// Place-popularity ranking
// =====================================================================
const POPULAR_CATEGORY_PRIORITY = {
  Historical: 1,
  Beach: 2,
  Nature: 3,
  Cultural: 4,
  Recreation: 5,
  Adventure: 6,
  Religious: 7,
  Monument: 8,
  Park: 9,
  Museum: 10,
  Island: 11,
  Market: 12,
};

function rankPlacesByPopularity(places) {
  // Famous landmarks are typically: high ticket price OR free iconic monuments.
  // Sort by category priority first, then by ticket_price descending so flagship
  // attractions like Borobudur surface above ordinary parks.
  return [...places].sort((a, b) => {
    const pa = POPULAR_CATEGORY_PRIORITY[a.category] || 99;
    const pb = POPULAR_CATEGORY_PRIORITY[b.category] || 99;
    if (pa !== pb) return pa - pb;
    if (b.ticket_price !== a.ticket_price) return b.ticket_price - a.ticket_price;
    return a.id - b.id;
  });
}

// Pick {count} places with category diversity + budget constraint.
function pickDiversePlaces(rankedPlaces, count, budget, offset = 0) {
  const selected = [];
  const used = new Set();
  let total = 0;
  // First pass: enforce category diversity.
  for (let i = offset; i < rankedPlaces.length && selected.length < count; i++) {
    const p = rankedPlaces[i];
    if (used.has(p.category)) continue;
    if (total + p.ticket_price > budget) continue;
    selected.push(p);
    total += p.ticket_price;
    used.add(p.category);
  }
  // Second pass: top up regardless of category if still short.
  if (selected.length < count) {
    for (let i = 0; i < rankedPlaces.length && selected.length < count; i++) {
      const p = rankedPlaces[i];
      if (selected.find((s) => s.id === p.id)) continue;
      if (total + p.ticket_price > budget) continue;
      selected.push(p);
      total += p.ticket_price;
    }
  }
  return { places: selected, totalPrice: total };
}

// Distribute a flat list of places into {nights} buckets (round-robin).
function splitPlacesByMalam(places, nights) {
  const buckets = Array.from({ length: nights }, () => []);
  places.forEach((place, idx) => {
    buckets[idx % nights].push(place);
  });
  return buckets.map((nightPlaces, idx) => {
    return {
      malam: idx + 1,
      places: nightPlaces,
    };
  });
}

// Distribute places across {nights} buckets, capping each malam at
// {maxEndMinutes} (default 17:00 = sore). Uses the actual malam timeline
// (drive + visit + return-to-hotel) to decide whether a candidate place
// still fits before pushing it to the next malam.
//
// Constraints (packages only):
//   - each malam ideally has ≥1 destinasi
//   - at most ONE empty malam allowed (rest day)
//   - leftover places (don't fit in any malam) are dropped
function packPlacesByMalamWithTimeCap(
  hotel,
  places,
  nights,
  startMinutes = 540,
  maxEndMinutes = 17 * 60,
) {
  const buckets = Array.from({ length: nights }, () => []);
  let cursorMalam = 0;

  for (const place of places) {
    if (cursorMalam >= nights) break;
    // Try to fit the place in the current malam.
    const candidate = [...buckets[cursorMalam], place];
    const sched = buildMalamTimeline(hotel, candidate, startMinutes);
    const endMinutes = startMinutes + sched.totalMin;
    if (endMinutes <= maxEndMinutes) {
      buckets[cursorMalam].push(place);
      continue;
    }
    // Doesn't fit. Move to next malam (skip ahead) and try there. If the
    // current malam is empty, force-add the place anyway so we don't have
    // an empty leading malam.
    if (buckets[cursorMalam].length === 0) {
      buckets[cursorMalam].push(place);
      cursorMalam += 1;
      continue;
    }
    cursorMalam += 1;
    if (cursorMalam < nights) {
      buckets[cursorMalam].push(place);
    }
  }

  // Backfill: if there are empty malam (>1) and any malam has ≥2 places,
  // move one place from a packed malam to the empty one so each malam ends
  // up with at least one destinasi (one empty rest-day is still OK).
  let emptyCount = buckets.filter((b) => b.length === 0).length;
  for (let attempt = 0; attempt < nights && emptyCount > 1; attempt++) {
    const emptyIdx = buckets.findIndex((b) => b.length === 0);
    if (emptyIdx === -1) break;
    const donorIdx = buckets.findIndex((b) => b.length > 1);
    if (donorIdx === -1) break;
    buckets[emptyIdx].push(buckets[donorIdx].pop());
    emptyCount = buckets.filter((b) => b.length === 0).length;
  }

  return buckets.map((nightPlaces, idx) => ({
    malam: idx + 1,
    places: nightPlaces,
  }));
}

class PackageGenerator {
  // Generate travel packages.
  // Strategy: produce up to 3 packages mixing hotel tiers (budget / mid / luxury)
  // around the same set of popular places for the city, so users see clear price
  // tiers instead of three near-identical packages.
  static async generatePackages(cityId, budget, options = {}) {
    const {
      packagesCount = 3,
      maxPlaces = 4,
      nights = 1,
    } = options;

    const safeNights = Math.max(1, Math.min(parseInt(nights, 10) || 1, 14));
    // Aim for ~2 destinasi per malam plus 1 extra so users get variety but
    // each malam still finishes by sore. The packing algorithm caps malam
    // at 17:00 and drops anything that wouldn't fit.
    const targetPlaces = Math.min(
      Math.max(maxPlaces, safeNights * 2 + 1),
      Math.min(safeNights * 3 + 1, 12),
    );

    const allHotels = await Hotel.getByCity(cityId);
    const allPlaces = await TouristPlace.getByCity(cityId);

    if (!allHotels || allHotels.length === 0 || !allPlaces || allPlaces.length === 0) {
      return [];
    }

    // Affordable hotels = those whose cost over the whole stay still leaves room
    // for at least one cheap entry ticket. We try to keep hotelTotal < 80% of budget.
    const hotelLimit = Math.max(budget * 0.85, budget - 10000);
    const affordableHotels = allHotels
      .filter((h) => h.price_per_night * safeNights <= hotelLimit)
      .sort((a, b) => a.price_per_night - b.price_per_night);

    // If even the cheapest hotel exceeds the budget, try with the cheapest one
    // anyway so the page returns at least one tier instead of empty.
    const fallbackHotel = allHotels.slice().sort((a, b) => a.price_per_night - b.price_per_night)[0];
    let hotelChoices = [];
    if (affordableHotels.length === 0 && fallbackHotel) {
      hotelChoices = [fallbackHotel];
    } else {
      // Pick distinct tiers: cheapest, median, priciest within budget.
      const cheap = affordableHotels[0];
      const luxury = affordableHotels[affordableHotels.length - 1];
      const midIdx = Math.max(0, Math.min(
        affordableHotels.length - 1,
        Math.floor(affordableHotels.length / 2),
      ));
      const mid = affordableHotels[midIdx];
      const seen = new Set();
      [cheap, mid, luxury].forEach((h) => {
        if (h && !seen.has(h.id)) {
          seen.add(h.id);
          hotelChoices.push(h);
        }
      });
    }
    hotelChoices = hotelChoices.slice(0, packagesCount);

    const ranked = rankPlacesByPopularity(allPlaces);

    const packages = [];
    for (let i = 0; i < hotelChoices.length; i++) {
      const hotel = hotelChoices[i];
      const hotelTotal = hotel.price_per_night * safeNights;
      const remaining = Math.max(0, budget - hotelTotal);

      // Each tier picks slightly different popular sets to add variety while
      // still favouring iconic destinations.
      const offset = i;  // 0, 1, 2 -> different starting point in the ranked list
      const pick = pickDiversePlaces(ranked, targetPlaces, remaining + 50000, offset);
      if (pick.places.length === 0) continue;

      // Time-capped packing: each malam ends by 17:00; overflow rolls into
      // the next malam. Empty malam allowed (rest day) but we backfill so
      // there is at most ONE empty malam.
      const itineraryRaw = packPlacesByMalamWithTimeCap(
        hotel,
        pick.places,
        safeNights,
        540,
        17 * 60,
      );
      const itinerary = itineraryRaw.map((bucket) => {
        const schedule = buildMalamTimeline(hotel, bucket.places, 540);
        return {
          malam: bucket.malam,
          places: bucket.places,
          schedule,
        };
      });

      // Drop any places that didn't fit anywhere from the package's
      // visible destination list, otherwise the UI shows attractions
      // that have no scheduled visit.
      const scheduledIds = new Set(
        itinerary.flatMap((b) => b.places.map((p) => p.id)),
      );
      const fittedPlaces = pick.places.filter((p) => scheduledIds.has(p.id));
      const fittedTotal = fittedPlaces.reduce(
        (sum, p) => sum + (Number(p.ticket_price) || 0),
        0,
      );

      const totalDriveMin = itinerary.reduce((sum, b) => sum + b.schedule.totalDriveMin, 0);
      const totalVisitMin = itinerary.reduce((sum, b) => sum + b.schedule.totalVisitMin, 0);

      packages.push({
        id: i + 1,
        hotel,
        hotel_tier: hotel.category,
        tourist_places: fittedPlaces,
        nights: safeNights,
        hotel_total: hotelTotal,
        places_total: fittedTotal,
        total_price: hotelTotal + fittedTotal,
        budget,
        remaining_budget: budget - (hotelTotal + fittedTotal),
        total_drive_min: totalDriveMin,
        total_visit_min: totalVisitMin,
        score: this.calculatePackageScore(hotel, pick.places, budget),
      });
    }

    // Order: cheapest first so user sees budget-friendly option up top.
    packages.sort((a, b) => a.total_price - b.total_price);
    return packages.slice(0, packagesCount);
  }

  static splitPlacesByDay(places, days) {
    return splitPlacesByMalam(places, days);
  }

  static calculatePackageScore(hotel, places, budget) {
    let score = 0;
    score += (hotel.rating / 5) * 40;
    score += Math.min(places.length / 4, 1) * 30;
    const categories = new Set(places.map((p) => p.category));
    score += Math.min(categories.size / 3, 1) * 20;
    const totalPrice = hotel.price_per_night + places.reduce((sum, p) => sum + p.ticket_price, 0);
    const efficiency = Math.max(0, 1 - (totalPrice - budget * 0.7) / (budget * 0.3)) * 10;
    score += Math.max(0, efficiency);
    return Math.round(score * 10) / 10;
  }

  // Calculate custom package price (kept for /custom flow).
  static async calculateCustomPackage(hotelId, placeIds, nights = 1) {
    try {
      const hotel = await Hotel.getById(hotelId);
      if (!hotel) {
        throw new Error('Hotel not found');
      }

      const places = await TouristPlace.getByIds(placeIds);
      if (places.length !== placeIds.length) {
        throw new Error('Some tourist places not found');
      }

      const safeNights = Math.max(1, Math.min(parseInt(nights, 10) || 1, 14));
      const hotelPrice = hotel.price_per_night * safeNights;
      const placesPrice = places.reduce((sum, place) => sum + place.ticket_price, 0);
      const totalPrice = hotelPrice + placesPrice;

      return {
        hotel,
        tourist_places: places,
        nights: safeNights,
        hotel_price: hotelPrice,
        places_price: placesPrice,
        total_price: totalPrice,
        breakdown: {
          hotel: {
            name: hotel.name,
            price_per_night: hotel.price_per_night,
            nights: safeNights,
            total: hotelPrice,
          },
          places: places.map((place) => ({
            name: place.name,
            category: place.category,
            ticket_price: place.ticket_price,
            total: place.ticket_price,
          })),
          summary: {
            subtotal: totalPrice,
            tax: 0,
            total: totalPrice,
          },
        },
      };
    } catch (error) {
      throw new Error(`Failed to calculate custom package: ${error.message}`);
    }
  }

  static getBudgetBreakdown(budget) {
    return {
      hotel: {
        amount: budget * 0.5,
        percentage: 50,
        description: 'Akomodasi (50% dari budget)',
      },
      tourist_places: {
        amount: budget * 0.3,
        percentage: 30,
        description: 'Tiket destinasi (30% dari budget)',
      },
      buffer: {
        amount: budget * 0.2,
        percentage: 20,
        description: 'Buffer makan, transport, dll. (20% dari budget)',
      },
      total: budget,
    };
  }

  static async validatePackage(hotelId, placeIds, budget) {
    try {
      const customPackage = await this.calculateCustomPackage(hotelId, placeIds);
      if (customPackage.total_price > budget) {
        return {
          valid: false,
          error: 'Package exceeds budget',
          excess: customPackage.total_price - budget,
        };
      }
      return {
        valid: true,
        package: customPackage,
        remaining_budget: budget - customPackage.total_price,
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message,
      };
    }
  }
}

module.exports = PackageGenerator;

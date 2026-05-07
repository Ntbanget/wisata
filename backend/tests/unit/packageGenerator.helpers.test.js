/**
 * Unit tests for the pure helpers in packageGenerator.js.
 *
 * These functions don't touch the database, so we can exercise the
 * scheduling / ranking / packing logic directly.
 *
 * The features under test were introduced in:
 *   - 0f7b025 (Diversify packages, add tour timing, switch to Malam terminology)
 *   - b990011 (Cap package malam at 17:00)
 *   - f96cfe1 (Include itinerary in response)
 */

const {
  __test__: {
    buildMalamTimeline,
    packPlacesByMalamWithTimeCap,
    splitPlacesByMalam,
    rankPlacesByPopularity,
    pickDiversePlaces,
    haversineKm,
    hhmm,
    visitMin,
  },
} = require('../../src/utils/packageGenerator');

// Lawang Sewu, Tugu Muda, Sam Poo Kong, Kota Lama -- a short Semarang itinerary.
const HOTEL = { id: 1, name: 'Pop Hotel Semarang', lat: -6.9849, lng: 110.4097, price_per_night: 320000 };
const LAWANG = { id: 11, name: 'Lawang Sewu',          lat: -6.9839, lng: 110.4106, category: 'Historical', ticket_price: 20000 };
const TUGU   = { id: 12, name: 'Tugu Muda',            lat: -6.9841, lng: 110.4096, category: 'Monument',   ticket_price: 0 };
const SAMPOO = { id: 13, name: 'Sam Poo Kong',         lat: -6.9959, lng: 110.3984, category: 'Religious',  ticket_price: 28000 };
const KOTA   = { id: 14, name: 'Kota Lama Semarang',   lat: -6.9672, lng: 110.4269, category: 'Historical', ticket_price: 0 };
const MARINA = { id: 15, name: 'Pantai Marina',        lat: -6.9477, lng: 110.3901, category: 'Beach',      ticket_price: 5000 };
const MASJID = { id: 16, name: 'Masjid Agung Jateng',  lat: -6.9836, lng: 110.4456, category: 'Religious',  ticket_price: 0 };
const KAMPUNG= { id: 17, name: 'Kampung Pelangi',      lat: -6.9878, lng: 110.4085, category: 'Cultural',   ticket_price: 0 };
const KLENTENG={id: 18, name: 'Klenteng Tay Kak Sie',  lat: -6.9740, lng: 110.4277, category: 'Religious',  ticket_price: 0 };
const TAMAN  = { id: 19, name: 'Taman Indonesia Kaya', lat: -6.9921, lng: 110.4200, category: 'Park',       ticket_price: 0 };

describe('haversineKm', () => {
  it('returns 0 for identical points', () => {
    expect(haversineKm(-6.98, 110.41, -6.98, 110.41)).toBe(0);
  });

  it('matches the well-known Lawang Sewu - Sam Poo Kong distance to within 0.5 km', () => {
    // ~1.6 km on Google Maps.
    const km = haversineKm(LAWANG.lat, LAWANG.lng, SAMPOO.lat, SAMPOO.lng);
    expect(km).toBeGreaterThan(1.0);
    expect(km).toBeLessThan(2.0);
  });
});

describe('hhmm', () => {
  it('formats minute counts as HH:MM', () => {
    expect(hhmm(0)).toBe('00:00');
    expect(hhmm(540)).toBe('09:00');
    expect(hhmm(17 * 60)).toBe('17:00');
  });

  it('wraps past midnight safely', () => {
    expect(hhmm(25 * 60)).toBe('01:00');
  });
});

describe('visitMin', () => {
  it('uses category-specific durations', () => {
    expect(visitMin('Beach')).toBe(150);
    expect(visitMin('Historical')).toBe(90);
  });

  it('falls back to 90 for unknown categories', () => {
    expect(visitMin('Unknown')).toBe(90);
  });
});

describe('buildMalamTimeline', () => {
  it('returns an empty timeline when no places are supplied', () => {
    const out = buildMalamTimeline(HOTEL, []);
    expect(out.events).toEqual([]);
    expect(out.totalMin).toBe(0);
  });

  it('emits arrive / depart events for each place plus a final return-to-hotel', () => {
    const out = buildMalamTimeline(HOTEL, [LAWANG, TUGU]);
    // 1 depart + 2*(arrive + depart) + 1 return = 6 events
    expect(out.events.length).toBeGreaterThanOrEqual(6);
    expect(out.events[0].label).toMatch(/Berangkat dari/);
    expect(out.events[out.events.length - 1].label).toMatch(/Kembali ke/);
    expect(out.startTime).toBe('09:00');
  });

  it('keeps a short single-malam tour finishing before sunset (well before 22:00)', () => {
    const out = buildMalamTimeline(HOTEL, [LAWANG, TUGU]);
    // Two close-by places, ~2.5 h total => ends well before 22:00.
    const endHour = parseInt(out.endTime.split(':')[0], 10);
    expect(endHour).toBeLessThan(15);
  });
});

describe('packPlacesByMalamWithTimeCap (sore cap @ 17:00)', () => {
  it('keeps a single comfortable malam in one bucket', () => {
    const buckets = packPlacesByMalamWithTimeCap(HOTEL, [LAWANG, TUGU], 1);
    expect(buckets).toHaveLength(1);
    expect(buckets[0].places.map((p) => p.id)).toEqual([LAWANG.id, TUGU.id]);
  });

  it('spills overflow to next malam when the schedule would push past 17:00', () => {
    // 8 destinations are too many for one day given 60-150 min visits + drives.
    const places = [LAWANG, MARINA, SAMPOO, MASJID, TUGU, TAMAN, KOTA, KLENTENG];
    const buckets = packPlacesByMalamWithTimeCap(HOTEL, places, 4);
    expect(buckets).toHaveLength(4);
    // Bucket 0 should not contain ALL the places (otherwise the cap doesn't work).
    expect(buckets[0].places.length).toBeLessThan(places.length);
    // Sum of places across buckets <= total input.
    const total = buckets.reduce((s, b) => s + b.places.length, 0);
    expect(total).toBeLessThanOrEqual(places.length);
  });

  it('allows AT MOST one empty malam (rest day) when there are fewer places than nights', () => {
    // 4 places, 4 nights -> empty count should be exactly 0 or 1.
    const buckets = packPlacesByMalamWithTimeCap(HOTEL, [LAWANG, TUGU, SAMPOO, KOTA], 4);
    const emptyCount = buckets.filter((b) => b.places.length === 0).length;
    expect(emptyCount).toBeLessThanOrEqual(1);
  });

  it('returns the requested number of malam buckets', () => {
    const buckets = packPlacesByMalamWithTimeCap(HOTEL, [LAWANG, TUGU, SAMPOO], 5);
    expect(buckets).toHaveLength(5);
    buckets.forEach((b, idx) => {
      expect(b.malam).toBe(idx + 1);
      expect(Array.isArray(b.places)).toBe(true);
    });
  });
});

describe('splitPlacesByMalam (round-robin fallback)', () => {
  it('balances places across nights', () => {
    const buckets = splitPlacesByMalam([LAWANG, TUGU, SAMPOO, KOTA], 2);
    expect(buckets).toHaveLength(2);
    expect(buckets[0].places).toHaveLength(2);
    expect(buckets[1].places).toHaveLength(2);
  });

  it('numbers buckets starting at 1', () => {
    const buckets = splitPlacesByMalam([LAWANG], 3);
    expect(buckets.map((b) => b.malam)).toEqual([1, 2, 3]);
  });
});

describe('rankPlacesByPopularity', () => {
  it('puts free iconic monuments / historical sites near the top', () => {
    const ranked = rankPlacesByPopularity([MARINA, KOTA, LAWANG, TUGU]);
    const ids = ranked.map((p) => p.id);
    // Lawang Sewu (paid Historical) and Kota Lama (free Historical) should
    // rank above the unpopular Beach.
    expect(ids.indexOf(LAWANG.id)).toBeLessThan(ids.indexOf(MARINA.id));
  });
});

describe('pickDiversePlaces', () => {
  it('respects the budget and returns at most {count} places', () => {
    const ranked = rankPlacesByPopularity([LAWANG, SAMPOO, KOTA, TUGU, MASJID, MARINA]);
    const out = pickDiversePlaces(ranked, 3, 50000); // 50k budget for tickets
    expect(out.places.length).toBeLessThanOrEqual(3);
    const total = out.places.reduce((s, p) => s + (p.ticket_price || 0), 0);
    expect(total).toBeLessThanOrEqual(50000);
  });
});

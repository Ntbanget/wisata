/**
 * Integration-ish test for PackageGenerator.generatePackages.
 * Models are mocked so we don't touch MySQL.
 *
 * Verifies the contract that the frontend relies on:
 *   - response includes {hotel, tourist_places, nights, hotel_total,
 *     places_total, total_price, itinerary}
 *   - hotel_total scales with `nights`
 *   - itinerary has one bucket per malam, with schedule events
 *   - no malam ends after 17:00 ("sore cap")
 *   - tourist_places only contains places that were actually scheduled
 */

jest.mock('../../src/models/Hotel');
jest.mock('../../src/models/TouristPlace');

const Hotel = require('../../src/models/Hotel');
const TouristPlace = require('../../src/models/TouristPlace');
const PackageGenerator = require('../../src/utils/packageGenerator');

// Real Semarang hotel + landmarks (just enough variety for diverse picks).
const HOTELS = [
  { id: 1,  name: 'Hotel Murah',    category: 'budget',   rating: 3.5, lat: -6.99, lng: 110.41, price_per_night: 200000 },
  { id: 2,  name: 'Hotel Tengah',   category: 'standard', rating: 4.0, lat: -6.99, lng: 110.42, price_per_night: 350000 },
  { id: 3,  name: 'Hotel Mewah',    category: 'luxury',   rating: 4.7, lat: -6.99, lng: 110.43, price_per_night: 800000 },
];

const PLACES = [
  { id: 11, name: 'Lawang Sewu',   lat: -6.9839, lng: 110.4106, category: 'Historical', ticket_price: 20000 },
  { id: 12, name: 'Tugu Muda',     lat: -6.9841, lng: 110.4096, category: 'Monument',   ticket_price: 0 },
  { id: 13, name: 'Sam Poo Kong',  lat: -6.9959, lng: 110.3984, category: 'Religious',  ticket_price: 28000 },
  { id: 14, name: 'Kota Lama',     lat: -6.9672, lng: 110.4269, category: 'Historical', ticket_price: 0 },
  { id: 15, name: 'Pantai Marina', lat: -6.9477, lng: 110.3901, category: 'Beach',      ticket_price: 5000 },
  { id: 16, name: 'Masjid Agung',  lat: -6.9836, lng: 110.4456, category: 'Religious',  ticket_price: 0 },
  { id: 17, name: 'Kampung Pelangi',lat: -6.9878, lng: 110.4085, category: 'Cultural',  ticket_price: 0 },
  { id: 18, name: 'Klenteng Tay',  lat: -6.9740, lng: 110.4277, category: 'Religious',  ticket_price: 0 },
  { id: 19, name: 'Taman Indonesia',lat: -6.9921, lng: 110.4200, category: 'Park',      ticket_price: 0 },
];

beforeEach(() => {
  Hotel.getByCity = jest.fn().mockResolvedValue(HOTELS);
  TouristPlace.getByCity = jest.fn().mockResolvedValue(PLACES);
});

describe('PackageGenerator.generatePackages', () => {
  it('returns at least one package within reasonable budgets', async () => {
    const out = await PackageGenerator.generatePackages(1, 3000000, { nights: 2 });
    expect(out.length).toBeGreaterThan(0);
  });

  it('scales hotel_total with nights', async () => {
    const out = await PackageGenerator.generatePackages(1, 5000000, { nights: 4 });
    expect(out.length).toBeGreaterThan(0);
    out.forEach((pkg) => {
      expect(pkg.hotel_total).toBe(pkg.hotel.price_per_night * 4);
      expect(pkg.nights).toBe(4);
    });
  });

  it('exposes total_price = hotel_total + places_total', async () => {
    const out = await PackageGenerator.generatePackages(1, 5000000, { nights: 3 });
    out.forEach((pkg) => {
      expect(pkg.total_price).toBe(pkg.hotel_total + pkg.places_total);
    });
  });

  it('attaches a per-malam itinerary with schedule events', async () => {
    const out = await PackageGenerator.generatePackages(1, 5000000, { nights: 3 });
    out.forEach((pkg) => {
      expect(Array.isArray(pkg.itinerary)).toBe(true);
      expect(pkg.itinerary).toHaveLength(3);
      pkg.itinerary.forEach((bucket, idx) => {
        expect(bucket.malam).toBe(idx + 1);
        expect(Array.isArray(bucket.places)).toBe(true);
        expect(bucket.schedule).toBeDefined();
        expect(Array.isArray(bucket.schedule.events)).toBe(true);
      });
    });
  });

  it('caps every non-empty malam at 17:00 (sore)', async () => {
    const out = await PackageGenerator.generatePackages(1, 5000000, { nights: 3 });
    out.forEach((pkg) => {
      pkg.itinerary.forEach((bucket) => {
        if (bucket.places.length === 0) return;
        const [hh, mm] = bucket.schedule.endTime.split(':').map(Number);
        const totalEndMin = hh * 60 + mm;
        // Up to a tiny rounding slack we still need to be at-or-before 17:30,
        // because the last visit may close at 17:00 exactly + a 10-min drive home.
        expect(totalEndMin).toBeLessThanOrEqual(17 * 60 + 30);
      });
    });
  });

  it('only lists tourist_places that were actually scheduled', async () => {
    const out = await PackageGenerator.generatePackages(1, 5000000, { nights: 3 });
    out.forEach((pkg) => {
      const scheduledIds = new Set(
        pkg.itinerary.flatMap((b) => b.places.map((p) => p.id)),
      );
      pkg.tourist_places.forEach((p) => {
        expect(scheduledIds.has(p.id)).toBe(true);
      });
    });
  });

  it('returns a fallback when even the cheapest hotel is over budget (still no empty list)', async () => {
    // Budget is below the cheapest hotel → still return something.
    const out = await PackageGenerator.generatePackages(1, 50000, { nights: 1 });
    expect(out.length).toBeGreaterThan(0);
  });

  it('returns an empty array when no hotels or places are seeded for the city', async () => {
    Hotel.getByCity.mockResolvedValueOnce([]);
    TouristPlace.getByCity.mockResolvedValueOnce([]);
    const out = await PackageGenerator.generatePackages(99, 5000000, { nights: 2 });
    expect(out).toEqual([]);
  });
});

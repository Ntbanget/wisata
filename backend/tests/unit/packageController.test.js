const PackageController = require('../../src/controllers/packageController');
const Package = require('../../src/models/Package');
const Hotel = require('../../src/models/Hotel');
const TouristPlace = require('../../src/models/TouristPlace');
const PackageGenerator = require('../../src/utils/packageGenerator');

jest.mock('../../src/models/Package');
jest.mock('../../src/models/Hotel');
jest.mock('../../src/models/TouristPlace');
jest.mock('../../src/utils/packageGenerator');

describe('PackageController.generatePackages', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('keeps admin packages regardless of requested nights and marks source correctly', async () => {
    Package.getPublishedByCity.mockResolvedValue([
      {
        id: 101,
        name: 'One-night admin package',
        city_id: 1,
        hotel_id: 10,
        tourist_place_ids: [1001],
        budget: 2000000,
        people_count: 2,
        nights: 1,
        status: 'published',
        generated_itinerary: null
      },
      {
        id: 102,
        name: 'Two-night admin package',
        city_id: 1,
        hotel_id: 11,
        tourist_place_ids: [1002],
        budget: 2000000,
        people_count: 2,
        nights: 2,
        status: 'published',
        generated_itinerary: null
      }
    ]);

    Hotel.getById.mockImplementation(async (id) => ({
      id,
      name: `Hotel ${id}`,
      category: 'standard',
      price_per_night: 300000,
      rating: 4.2,
      lat: -6.98,
      lng: 110.42
    }));

    TouristPlace.getByIds.mockImplementation(async (ids) => ids.map((id) => ({
      id,
      name: `Place ${id}`,
      city_id: 1,
      ticket_price: 50000,
      category: 'Historical',
      lat: -6.98,
      lng: 110.42
    })));

    PackageGenerator.generatePackages.mockResolvedValue([
      {
        id: 999,
        hotel: { id: 99, name: 'Generated Hotel', category: 'luxury' },
        hotel_tier: 'luxury',
        tourist_places: [],
        nights: 2,
        hotel_total: 600000,
        places_total: 100000,
        total_price: 700000,
        budget: 3000000,
        remaining_budget: 2300000,
        score: 8.5,
        itinerary: [],
        source: 'generated'
      }
    ]);

    const req = {
      query: {
        city_id: '1',
        budget: '3000000',
        nights: '2'
      }
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await PackageController.generatePackages(req, res);

    expect(res.json).toHaveBeenCalled();
    const payload = res.json.mock.calls[0][0];
    expect(payload.success).toBe(true);
    expect(payload.data).toBeDefined();
    expect(Array.isArray(payload.data.packages)).toBe(true);
    expect(payload.data.packages.find((pkg) => pkg.id === 101)).toBeDefined();
    expect(payload.data.packages.find((pkg) => pkg.id === 102)).toBeDefined();
    expect(payload.data.packages.find((pkg) => pkg.id === 999)).toBeDefined();
    expect(payload.data.packages.find((pkg) => pkg.id === 101)?.source).toBe('admin');
    expect(payload.data.packages.find((pkg) => pkg.id === 999)?.source).toBe('generated');
  });
});

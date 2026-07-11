const Package = require('../../src/models/Package');

describe('Package.parseRow', () => {
  it('parses tourist_place_ids when the database returns a parsed JSON array', () => {
    const row = {
      id: 1,
      tourist_place_ids: [11, 12, 13],
      preferences: { theme: 'honeymoon' },
      generated_itinerary: null
    };

    const parsed = Package.parseRow(row);

    expect(parsed.tourist_place_ids).toEqual([11, 12, 13]);
    expect(parsed.preferences).toEqual({ theme: 'honeymoon' });
  });

  it('parses tourist_place_ids when the database returns a JSON string', () => {
    const row = {
      id: 2,
      tourist_place_ids: '[21, 22]',
      preferences: '{"theme":"family"}',
      generated_itinerary: null
    };

    const parsed = Package.parseRow(row);

    expect(parsed.tourist_place_ids).toEqual([21, 22]);
    expect(parsed.preferences).toEqual({ theme: 'family' });
  });
});

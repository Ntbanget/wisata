/**
 * Unit tests for selectFeaturedCities.
 *
 * Originally these were inline expressions in LandingPage.js. They now live
 * in src/utils/popularCities.js so we can write proper assertions over the
 * curation rules without rendering the whole page (TDD-friendly).
 *
 * Feature added in commit f96cfe1: prioritize iconic cities (Semarang,
 * Yogyakarta) over alphabetically-first ones (Pekalongan, Purwokerto).
 */

import { selectFeaturedCities, POPULAR_CITY_NAMES } from '../popularCities';

const ALPHABETICAL_API_RESPONSE = [
  { id: 5, name: 'Jepara' },
  { id: 11, name: 'Kendal' },
  { id: 3, name: 'Magelang' },
  { id: 7, name: 'Pekalongan' },
  { id: 8, name: 'Pemalang' },
  { id: 9, name: 'Purwokerto' },
  { id: 6, name: 'Salatiga' },
  { id: 1, name: 'Semarang' },
  { id: 4, name: 'Surakarta (Solo)' },
  { id: 10, name: 'Wonosobo' },
  { id: 12, name: 'Yogyakarta' },
];

describe('selectFeaturedCities', () => {
  it('returns the 6 curated iconic cities in priority order', () => {
    const out = selectFeaturedCities(ALPHABETICAL_API_RESPONSE, 6);
    expect(out.map((c) => c.name)).toEqual([
      'Semarang',
      'Yogyakarta',
      'Magelang',
      'Surakarta (Solo)',
      'Wonosobo',
      'Jepara',
    ]);
  });

  it('does NOT surface Pekalongan or Purwokerto when iconic cities exist', () => {
    const out = selectFeaturedCities(ALPHABETICAL_API_RESPONSE, 6);
    const names = out.map((c) => c.name);
    expect(names).not.toContain('Pekalongan');
    expect(names).not.toContain('Purwokerto');
  });

  it('falls back to filler cities when curated set is short', () => {
    const onlyTwoIconic = [
      { id: 1, name: 'Semarang' },
      { id: 8, name: 'Pemalang' },
      { id: 11, name: 'Kendal' },
    ];
    const out = selectFeaturedCities(onlyTwoIconic, 6);
    // First should still be Semarang (the iconic one), then filler.
    expect(out[0].name).toBe('Semarang');
    expect(out.length).toBe(3);
  });

  it('respects the limit parameter', () => {
    const out = selectFeaturedCities(ALPHABETICAL_API_RESPONSE, 3);
    expect(out).toHaveLength(3);
    expect(out[0].name).toBe('Semarang');
  });

  it('returns [] for non-array input (defensive)', () => {
    expect(selectFeaturedCities(null)).toEqual([]);
    expect(selectFeaturedCities(undefined)).toEqual([]);
    expect(selectFeaturedCities('not-an-array')).toEqual([]);
  });

  it('exports the curated name list (so tests / other code can introspect it)', () => {
    expect(POPULAR_CITY_NAMES).toContain('Semarang');
    expect(POPULAR_CITY_NAMES).toContain('Yogyakarta');
    expect(POPULAR_CITY_NAMES).not.toContain('Pekalongan');
  });
});

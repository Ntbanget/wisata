/**
 * Curated set of cities to feature on the home page.
 *
 * Why curated? `City.getAll()` orders alphabetically, so a naive `.slice(0, 6)`
 * surfaces less iconic destinations (Pekalongan, Purwokerto) above must-see
 * spots like Semarang and Yogyakarta. Edit this array to reorder/feature
 * different cities — no DB change required.
 */
export const POPULAR_CITY_NAMES = [
  'Semarang',
  'Yogyakarta',
  'Magelang',
  'Surakarta (Solo)',
  'Wonosobo',
  'Jepara',
];

/**
 * Pick which cities to show on the home page, in this order:
 *   1. each of POPULAR_CITY_NAMES that exists in the API list
 *   2. then any other cities (alphabetically) as filler
 *   3. capped to {limit} entries (default 6)
 *
 * @param {Array<{id:number, name:string}>} cities API list (any order).
 * @param {number} [limit=6] number of slots to fill.
 * @returns {Array} ordered list of cities to render.
 */
export function selectFeaturedCities(cities, limit = 6) {
  if (!Array.isArray(cities)) return [];
  const featured = POPULAR_CITY_NAMES
    .map((n) => cities.find((c) => c && c.name === n))
    .filter(Boolean);
  const featuredIds = new Set(featured.map((c) => c.id));
  const filler = cities.filter((c) => c && !featuredIds.has(c.id));
  return [...featured, ...filler].slice(0, limit);
}

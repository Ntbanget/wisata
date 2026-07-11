/**
 * Unit tests for src/utils/helpers.js
 *
 * Covers the pure helpers we rely on for itinerary rendering:
 *   - formatCurrency, formatDurationMinutes, formatHHMM
 *   - calculateDistance (haversine)
 *   - computeDailySchedule (per-malam timeline)
 *   - getVisitMinutes / getOpeningHours
 *
 * Add new test cases here BEFORE adding new helper logic (TDD red → green).
 */

import {
  formatCurrency,
  formatDurationMinutes,
  formatHHMM,
  calculateDistance,
  computeDailySchedule,
  getVisitMinutes,
  getOpeningHours,
  isValidEmail,
  isValidPhone,
  getAutoImageUrl,
} from '../helpers';

describe('formatCurrency', () => {
  it('formats Indonesian Rupiah without decimals', () => {
    const result = formatCurrency(320000);
    // toLocaleString output varies by node version; just assert key bits.
    expect(result).toMatch(/Rp/);
    expect(result).toMatch(/320/);
  });

  it('handles 0 gracefully', () => {
    expect(formatCurrency(0)).toMatch(/Rp/);
  });
});

describe('formatHHMM', () => {
  it('pads with leading zeros', () => {
    expect(formatHHMM(540)).toBe('09:00');
    expect(formatHHMM(60 * 17)).toBe('17:00');
  });

  it('wraps after midnight', () => {
    expect(formatHHMM(60 * 25)).toBe('01:00');
  });
});

describe('formatDurationMinutes', () => {
  it('shows just minutes for under 60', () => {
    expect(formatDurationMinutes(45)).toBe('45 mnt');
  });
  it('shows whole hours when remainder is 0', () => {
    expect(formatDurationMinutes(120)).toBe('2 jam');
  });
  it('shows hours + minutes otherwise', () => {
    expect(formatDurationMinutes(150)).toBe('2 jam 30 mnt');
  });
});

describe('calculateDistance', () => {
  it('returns 0 for identical points', () => {
    expect(calculateDistance(-7, 110, -7, 110)).toBe(0);
  });

  it('matches the well-known Jakarta - Yogyakarta great-circle distance to ~10%', () => {
    const km = calculateDistance(-6.21, 106.84, -7.79, 110.36);
    expect(km).toBeGreaterThan(380);
    expect(km).toBeLessThan(450);
  });
});

describe('getVisitMinutes', () => {
  it('uses category overrides', () => {
    expect(getVisitMinutes('Beach')).toBe(150);
  });
  it('falls back to 90 for unknown categories', () => {
    expect(getVisitMinutes('Anything')).toBe(90);
  });
});

describe('getOpeningHours', () => {
  it('returns {open, close} for known categories', () => {
    expect(getOpeningHours('Religious')).toEqual({ open: '04:00', close: '21:00' });
  });
});

describe('getAutoImageUrl', () => {
  it('uses explicit image URLs from alternate property names', () => {
    expect(getAutoImageUrl({ imageUrl: 'https://example.com/hotel.jpg' }, 'hotel')).toBe('https://example.com/hotel.jpg');
    expect(getAutoImageUrl({ photo_url: 'https://example.com/photo.jpg' }, 'hotel')).toBe('https://example.com/photo.jpg');
  });
});

describe('isValidEmail', () => {
  it('accepts well-formed emails', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
  });
  it('rejects malformed emails', () => {
    expect(isValidEmail('not-an-email')).toBe(false);
    expect(isValidEmail('foo@bar')).toBe(false);
  });
});

describe('isValidPhone', () => {
  it('accepts a 10-12 digit Indonesian number', () => {
    expect(isValidPhone('081234567890')).toBe(true);
  });
});

describe('computeDailySchedule', () => {
  const hotel = { id: 1, name: 'Pop Hotel Semarang', lat: -6.9849, lng: 110.4097 };
  const lawang = { id: 11, name: 'Lawang Sewu', lat: -6.9839, lng: 110.4106, category: 'Historical', ticket_price: 20000 };
  const tugu   = { id: 12, name: 'Tugu Muda',   lat: -6.9841, lng: 110.4096, category: 'Monument',   ticket_price: 0 };

  it('returns an empty timeline when no places given', () => {
    const out = computeDailySchedule(hotel, []);
    expect(out.events).toEqual([]);
    expect(out.totalMin).toBe(0);
  });

  it('starts at 09:00 by default', () => {
    const out = computeDailySchedule(hotel, [lawang]);
    expect(out.startTime).toBe('09:00');
    expect(out.events[0].label).toMatch(/Berangkat dari/);
  });

  it('emits arrive + depart events for each place plus a return-to-hotel', () => {
    const out = computeDailySchedule(hotel, [lawang, tugu]);
    const types = out.events.map((e) => e.type);
    expect(types[0]).toBe('depart');
    expect(types).toContain('arrive');
    expect(types[types.length - 1]).toMatch(/return|depart/);
  });

  it('respects the `startMinutes` option', () => {
    const out = computeDailySchedule(hotel, [lawang], { startMinutes: 600 });
    expect(out.startTime).toBe('10:00');
  });
});

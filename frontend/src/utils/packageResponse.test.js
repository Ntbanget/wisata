import { normalizePackageApiResponse, getPackagesFromPackageApiResponse } from './packageResponse';

describe('package response normalization', () => {
  it('unwraps nested payloads from the API response', () => {
    const response = {
      success: true,
      data: {
        packages: [{ id: 1, name: 'Promo Paket' }],
        search_criteria: { city_id: 1, nights: 2 }
      }
    };

    expect(normalizePackageApiResponse(response)).toEqual(response.data);
    expect(getPackagesFromPackageApiResponse(response)).toEqual([{ id: 1, name: 'Promo Paket' }]);
  });

  it('supports direct payloads without a nested data wrapper', () => {
    const response = {
      packages: [{ id: 2, name: 'Rekomendasi' }],
      search_criteria: { city_id: 2, nights: 3 }
    };

    expect(normalizePackageApiResponse(response)).toEqual(response);
    expect(getPackagesFromPackageApiResponse(response)).toEqual([{ id: 2, name: 'Rekomendasi' }]);
  });
});

export const normalizePackageApiResponse = (response) => {
  if (!response || typeof response !== 'object') {
    return { packages: [] };
  }

  if (Array.isArray(response)) {
    return { packages: response };
  }

  if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
    return response.data;
  }

  if (response.packages || response.search_criteria || response.budget_breakdown) {
    return response;
  }

  return { packages: [] };
};

export const getPackagesFromPackageApiResponse = (response) => {
  const payload = normalizePackageApiResponse(response);
  return Array.isArray(payload.packages) ? payload.packages : [];
};

export const buildPackageSearchParams = (criteria = {}) => {
  if (!criteria || typeof criteria !== 'object') {
    return {};
  }

  return {
    city_id: criteria.city_id,
    budget: criteria.budget,
    packages_count: criteria.packages_count || 3,
    max_places: criteria.max_places || 4,
    nights: criteria.nights || 1,
  };
};

export const resolvePackagePageSessionSnapshot = (sessionSnapshot, shouldRestoreFromSession = false) => {
  if (!sessionSnapshot?.isFresh) {
    return null;
  }

  const savedPackages = sessionSnapshot.results?.packages || sessionSnapshot.results?.data?.packages || [];
  const hasStoredPackages = Array.isArray(savedPackages) && savedPackages.length > 0;
  const hasStoredCriteria = Boolean(sessionSnapshot.criteria?.city_id || sessionSnapshot.criteria?.budget);

  if (shouldRestoreFromSession || hasStoredPackages || hasStoredCriteria) {
    return sessionSnapshot;
  }

  return null;
};

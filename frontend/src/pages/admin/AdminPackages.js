import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Plus, Edit, Trash2, Search, CheckCircle, RefreshCcw } from 'lucide-react';
import apiService from '../../services/api';
import { formatCurrency } from '../../utils/helpers';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

const AdminPackages = () => {
  const navigate = useNavigate();
  const [packages, setPackages] = useState([]);
  const [cities, setCities] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [suggestPlaces, setSuggestPlaces] = useState([]);
  const [form, setForm] = useState({
    id: null,
    name: '',
    city_id: '',
    hotel_id: '',
    budget: '',
    people_count: 1,
    nights: 1,
    status: 'draft',
    tourist_place_ids: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([loadPackages(), loadCities()]);
    } catch (err) {
      console.error(err);
      setError('Failed to load admin packages');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPackages = async () => {
    try {
      const response = await apiService.getAdminPackages();
      setPackages(response.data || []);
    } catch (err) {
      console.error('Error loading packages:', err);
      setError('Failed to load admin packages');
    }
  };

  const loadCities = async () => {
    try {
      const response = await apiService.getCities();
      setCities(response.data || response || []);
    } catch (err) {
      console.error('Error loading cities:', err);
    }
  };

  const loadHotels = async (cityId) => {
    if (!cityId) {
      setHotels([]);
      return;
    }

    try {
      const response = await apiService.getHotelsByCity(cityId);
      setHotels(response.data || []);
    } catch (err) {
      console.error('Error loading hotels:', err);
      setHotels([]);
    }
  };

  const loadSuggestions = async (cityId) => {
    if (!cityId) {
      setSuggestPlaces([]);
      return;
    }

    try {
      const response = await apiService.suggestPackagePlaces(cityId);
      setSuggestPlaces(response.data || []);
    } catch (err) {
      console.error('Error loading suggested places:', err);
      setSuggestPlaces([]);
    }
  };

  const handleFieldChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleCityChange = async (value) => {
    handleFieldChange('city_id', value);
    handleFieldChange('hotel_id', '');
    handleFieldChange('tourist_place_ids', []);
    await loadHotels(value);
    await loadSuggestions(value);
  };

  const handlePlaceToggle = (placeId) => {
    setForm((prev) => {
      const alreadySelected = prev.tourist_place_ids.includes(placeId);
      const nextPlaces = alreadySelected
        ? prev.tourist_place_ids.filter((id) => id !== placeId)
        : [...prev.tourist_place_ids, placeId];
      return { ...prev, tourist_place_ids: nextPlaces };
    });
  };

  const handleEdit = (pkg) => {
    setForm({
      id: pkg.id,
      name: pkg.name || '',
      city_id: pkg.city_id || '',
      hotel_id: pkg.hotel_id || '',
      budget: pkg.budget || '',
      people_count: pkg.people_count || 1,
      nights: pkg.nights || 1,
      status: pkg.status || 'draft',
      tourist_place_ids: Array.isArray(pkg.tourist_place_ids) ? pkg.tourist_place_ids : []
    });
    loadHotels(pkg.city_id);
    loadSuggestions(pkg.city_id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this package permanently?')) {
      return;
    }

    try {
      setIsSaving(true);
      await apiService.deleteAdminPackage(id);
      setSuccess('Package deleted successfully');
      setError(null);
      setForm({
        id: null,
        name: '',
        city_id: '',
        hotel_id: '',
        budget: '',
        people_count: 1,
        nights: 1,
        status: 'draft',
        tourist_place_ids: []
      });
      await loadPackages();
    } catch (err) {
      console.error('Error deleting package:', err);
      setError('Failed to delete package');
      setSuccess(null);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.city_id || !form.name || !form.budget || !form.people_count || !form.nights) {
      setError('City, name, budget, people count, and nights are required.');
      return;
    }

    const payload = {
      city_id: form.city_id,
      hotel_id: form.hotel_id || null,
      name: form.name,
      budget: parseFloat(form.budget),
      people_count: parseInt(form.people_count, 10),
      nights: parseInt(form.nights, 10),
      status: form.status,
      tourist_place_ids: form.tourist_place_ids
    };

    try {
      setIsSaving(true);
      if (form.id) {
        await apiService.updateAdminPackage(form.id, payload);
        setSuccess('Package updated successfully');
      } else {
        await apiService.createAdminPackage(payload);
        setSuccess('Package created successfully');
      }
      setForm({
        id: null,
        name: '',
        city_id: '',
        hotel_id: '',
        budget: '',
        people_count: 1,
        nights: 1,
        status: 'draft',
        tourist_place_ids: []
      });
      setHotels([]);
      setSuggestPlaces([]);
      await loadPackages();
    } catch (err) {
      console.error('Error saving package:', err);
      setError('Failed to save package');
      setSuccess(null);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredPackages = packages;

  if (isLoading) {
    return (
      <div className="p-8">
        <LoadingSpinner size="large" text="Loading admin packages..." />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Package Builder</h1>
          <p className="text-gray-600 mt-2">Create and manage manual packages that can be published to customer search results.</p>
        </div>
        <button
          type="button"
          className="btn-outline flex items-center gap-2"
          onClick={() => {
            setForm({
              id: null,
              name: '',
              city_id: '',
              hotel_id: '',
              budget: '',
              people_count: 1,
              nights: 1,
              status: 'draft',
              tourist_place_ids: []
            });
            setHotels([]);
            setSuggestPlaces([]);
            setError(null);
            setSuccess(null);
          }}
        >
          <RefreshCcw className="w-4 h-4" />
          New Package
        </button>
      </div>

      {error && <ErrorMessage error={error} />}
      {success && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
          {success}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Package Details</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Package Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                className="input-field w-full"
                placeholder="Example: Semarang Highlights"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <select
                  value={form.city_id}
                  onChange={(e) => handleCityChange(e.target.value)}
                  className="input-field w-full"
                >
                  <option value="">Select city</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>{city.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hotel</label>
                <select
                  value={form.hotel_id}
                  onChange={(e) => handleFieldChange('hotel_id', e.target.value)}
                  className="input-field w-full"
                >
                  <option value="">Select hotel (optional)</option>
                  {hotels.map((hotel) => (
                    <option key={hotel.id} value={hotel.id}>{hotel.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Budget (Rp)</label>
                <input
                  type="number"
                  value={form.budget}
                  onChange={(e) => handleFieldChange('budget', e.target.value)}
                  className="input-field w-full"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => handleFieldChange('status', e.target.value)}
                  className="input-field w-full"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">People</label>
                <input
                  type="number"
                  value={form.people_count}
                  onChange={(e) => handleFieldChange('people_count', e.target.value)}
                  className="input-field w-full"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nights</label>
                <input
                  type="number"
                  value={form.nights}
                  onChange={(e) => handleFieldChange('nights', e.target.value)}
                  className="input-field w-full"
                  min="1"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-700">Suggested Places</p>
                <span className="text-xs text-gray-500">Based on city and popularity</span>
              </div>
              <div className="grid gap-3">
                {suggestPlaces.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
                    Choose a city to load suggested destinations.
                  </div>
                ) : (
                  suggestPlaces.map((place) => {
                    const selected = form.tourist_place_ids.includes(place.id);
                    return (
                      <button
                        type="button"
                        key={place.id}
                        onClick={() => handlePlaceToggle(place.id)}
                        className={`relative block rounded-xl border px-4 py-3 text-left transition ${selected ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 bg-white hover:border-indigo-300'}`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                              {place.name}
                              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
                                #{place.suggestion_rank}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{place.category} • Rp {formatCurrency(place.ticket_price)}</p>
                          </div>
                          {selected && (
                            <CheckCircle className="w-5 h-5 text-indigo-600" />
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="btn-primary w-full py-3"
            >
              {form.id ? 'Update Package' : 'Create Package'}
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Package className="w-6 h-6 text-indigo-600" />
              <h2 className="text-xl font-semibold text-gray-900">Saved Packages</h2>
            </div>
            {packages.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
                No admin packages yet.
              </div>
            ) : (
              <div className="space-y-4">
                {packages.map((pkg) => (
                  <div key={pkg.id} className="rounded-xl border border-gray-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-900">{pkg.name || `Package #${pkg.id}`}</p>
                        <p className="text-sm text-gray-500">City ID {pkg.city_id} • {pkg.status}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(pkg)}
                          className="rounded-lg border border-indigo-100 bg-indigo-50 p-2 text-indigo-700"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(pkg.id)}
                          className="rounded-lg border border-red-100 bg-red-50 p-2 text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-gray-600 space-y-1">
                      <p>Budget: Rp {formatCurrency(pkg.budget)}</p>
                      <p>Hotel ID: {pkg.hotel_id || 'None'}</p>
                      <p>Destinations: {(pkg.tourist_place_ids || []).length}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPackages;

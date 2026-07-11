import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Edit, Trash2, Search, X } from 'lucide-react';
import apiService from '../../services/api';
import { formatCurrency, getAutoImageUrl } from '../../utils/helpers';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

const emptyForm = {
  name: '',
  city_id: '',
  category: 'Nature',
  ticket_price: '',
  description: '',
  image_url: '',
  latitude: '',
  longitude: '',
  opening_hours: '',
  rating: '0'
};

const AdminDestinations = () => {
  const [destinations, setDestinations] = useState([]);
  const [cities, setCities] = useState([]);
  const [cityOptions, setCityOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingDestination, setEditingDestination] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    loadDestinations();
    loadCities();
  }, []);

  const loadCities = async () => {
    try {
      const response = await apiService.getCities();
      setCities(response.data || []);
    } catch (err) {
      console.error('Error loading cities:', err);
    }
  };

  const loadDestinations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.getAllTouristPlaces();
      const destinationList = response.data || [];
      setDestinations(destinationList);
      setCityOptions([...new Set(destinationList.map((dest) => dest.city_name).filter(Boolean))].sort());
    } catch (err) {
      console.error('Error loading destinations:', err);
      setError('Failed to load destinations');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDestinations = destinations.filter((dest) => {
    const matchesSearch = searchTerm === '' ||
      dest.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dest.city_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCity = selectedCity === '' || dest.city_name === selectedCity;

    return matchesSearch && matchesCity;
  });

  const openAddModal = () => {
    setEditingDestination(null);
    setFormData(emptyForm);
    setIsModalOpen(true);
  };

  const openEditModal = (destination) => {
    setEditingDestination(destination);
    setFormData({
      name: destination.name || '',
      city_id: destination.city_id || '',
      category: destination.category || 'Nature',
      ticket_price: destination.ticket_price || '',
      description: destination.description || '',
      image_url: destination.image_url || '',
      latitude: destination.latitude || '',
      longitude: destination.longitude || '',
      opening_hours: destination.opening_hours || '',
      rating: destination.rating || '0'
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingDestination(null);
    setFormData(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        city_id: Number(formData.city_id),
        ticket_price: Number(formData.ticket_price),
        latitude: formData.latitude ? Number(formData.latitude) : null,
        longitude: formData.longitude ? Number(formData.longitude) : null,
        rating: Number(formData.rating || 0)
      };

      if (editingDestination) {
        await apiService.updateTouristPlace(editingDestination.id, payload);
      } else {
        await apiService.createTouristPlace(payload);
      }

      closeModal();
      await loadDestinations();
    } catch (err) {
      console.error('Error saving destination:', err);
      setError(err?.message || 'Failed to save destination');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (destinationId) => {
    if (!window.confirm('Hapus destinasi ini?')) return;

    try {
      await apiService.deleteTouristPlace(destinationId);
      await loadDestinations();
    } catch (err) {
      console.error('Error deleting destination:', err);
      setError(err?.message || 'Failed to delete destination');
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <LoadingSpinner size="large" text="Loading destinations..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <ErrorMessage error={error} />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Destinations</h1>
          <p className="text-gray-600 mt-2">Manage tourist destinations</p>
        </div>
        <button onClick={openAddModal} className="btn-primary flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>Add Destination</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search destination name or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="input-field"
          >
            <option value="">All cities</option>
            {cityOptions.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDestinations.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            No destinations found
          </div>
        ) : (
          filteredDestinations.map((dest) => (
            <div key={dest.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <img
                src={getAutoImageUrl(dest, 'destination') || '/images/destination-placeholder.svg'}
                alt={dest.name}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/images/destination-placeholder.svg';
                }}
              />
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{dest.name}</h3>
                  <span className="px-2 py-1 text-xs font-medium rounded bg-indigo-100 text-indigo-700">
                    {dest.category}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{dest.city_name || 'Unknown City'}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(dest.ticket_price)}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button onClick={() => openEditModal(dest)} className="p-2 hover:bg-blue-100 rounded-lg transition-colors">
                      <Edit className="w-4 h-4 text-blue-600" />
                    </button>
                    <button onClick={() => handleDelete(dest.id)} className="p-2 hover:bg-red-100 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingDestination ? 'Edit Destination' : 'Add Destination'}
              </h2>
              <button onClick={closeModal} className="p-2 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Destination Name</label>
                  <input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <select
                    required
                    value={formData.city_id}
                    onChange={(e) => setFormData({ ...formData, city_id: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Select city</option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input-field"
                  >
                    <option value="Historical">Historical</option>
                    <option value="Nature">Nature</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Beach">Beach</option>
                    <option value="Religious">Religious</option>
                    <option value="Adventure">Adventure</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ticket Price</label>
                  <input
                    type="number"
                    required
                    value={formData.ticket_price}
                    onChange={(e) => setFormData({ ...formData, ticket_price: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <input
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="input-field"
                    placeholder="https://..."
                  />
                  <p className="mt-1 text-xs text-gray-500">Masukkan link gambar real destinasi wisata dari sumber publik yang valid.</p>
                  {formData.image_url && (
                    <div className="mt-3 overflow-hidden rounded-lg border border-gray-200">
                      <img
                        src={formData.image_url}
                        alt="Preview destinasi"
                        className="h-32 w-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/images/destination-placeholder.svg';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                  <input
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                  <input
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Opening Hours</label>
                <input
                  value={formData.opening_hours}
                  onChange={(e) => setFormData({ ...formData, opening_hours: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={closeModal} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded-lg bg-indigo-600 text-white disabled:opacity-70">
                  {isSubmitting ? 'Saving...' : editingDestination ? 'Update Destination' : 'Create Destination'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDestinations;

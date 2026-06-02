import React, { useState, useEffect } from 'react';
import { Building, Plus, Edit, Trash2, Search } from 'lucide-react';
import { apiService } from '../../services/api';
import { formatCurrency, getHotelCategoryLabel } from '../../utils/helpers';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

const AdminHotels = () => {
  const [hotels, setHotels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadHotels();
  }, []);

  const loadHotels = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.getAllHotels();
      setHotels(response.data || []);
    } catch (err) {
      console.error('Error loading hotels:', err);
      setError('Failed to load hotels');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredHotels = hotels.filter(hotel => {
    return searchTerm === '' || 
      hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hotel.city_name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (isLoading) {
    return (
      <div className="p-8">
        <LoadingSpinner size="large" text="Loading hotels..." />
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
          <h1 className="text-3xl font-bold text-gray-900">Hotels</h1>
          <p className="text-gray-600 mt-2">Manage hotel listings</p>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>Add Hotel</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search hotels..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Hotels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHotels.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            No hotels found
          </div>
        ) : (
          filteredHotels.map((hotel) => (
            <div key={hotel.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {hotel.image_url && (
                <img
                  src={hotel.image_url}
                  alt={hotel.name}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{hotel.name}</h3>
                  <span className="px-2 py-1 text-xs font-medium rounded bg-indigo-100 text-indigo-700">
                    {getHotelCategoryLabel(hotel.category)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{hotel.city_name || 'Unknown City'}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(hotel.price_per_night)}/night
                  </span>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 hover:bg-blue-100 rounded-lg transition-colors">
                      <Edit className="w-4 h-4 text-blue-600" />
                    </button>
                    <button className="p-2 hover:bg-red-100 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminHotels;

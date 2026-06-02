import React, { useState, useEffect } from 'react';
import { Car, Plus, Edit, Trash2, Search } from 'lucide-react';
import { apiService } from '../../services/api';
import { formatCurrency } from '../../utils/helpers';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

const AdminVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.getAllVehicles();
      setVehicles(response.data || []);
    } catch (err) {
      console.error('Error loading vehicles:', err);
      setError('Failed to load vehicles');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    return searchTerm === '' || 
      vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.category.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (isLoading) {
    return (
      <div className="p-8">
        <LoadingSpinner size="large" text="Loading vehicles..." />
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
          <h1 className="text-3xl font-bold text-gray-900">Vehicles</h1>
          <p className="text-gray-600 mt-2">Manage transportation vehicles</p>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>Add Vehicle</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search vehicles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            No vehicles found
          </div>
        ) : (
          filteredVehicles.map((vehicle) => (
            <div key={vehicle.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{vehicle.name}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    !vehicle.available ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {vehicle.available ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                <div className="space-y-2 text-sm text-gray-600 mb-2">
                  <p><span className="font-medium">Category:</span> {vehicle.category}</p>
                  <p><span className="font-medium">Capacity:</span> {vehicle.capacity} people</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(vehicle.price_per_day)}/day
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

export default AdminVehicles;

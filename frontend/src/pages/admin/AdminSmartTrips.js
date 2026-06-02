import React, { useState, useEffect } from 'react';
import { Brain, Plus, Edit, Trash2, Search, Check, X } from 'lucide-react';
import { apiService } from '../../services/api';
import { formatCurrency } from '../../utils/helpers';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

const AdminSmartTrips = () => {
  const [smartTrips, setSmartTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadSmartTrips();
  }, []);

  const loadSmartTrips = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.getAdminSmartTrips();
      setSmartTrips(response.data?.requests || []);
    } catch (err) {
      console.error('Error loading smart trips:', err);
      setError('Failed to load smart trip requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (tripId, status) => {
    try {
      await apiService.updateSmartTripStatus(tripId, status);
      loadSmartTrips();
    } catch (err) {
      console.error('Error updating smart trip status:', err);
      setError('Failed to update smart trip status');
    }
  };

  const filteredSmartTrips = smartTrips.filter(trip => {
    return searchTerm === '' || 
      trip.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.city_name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (isLoading) {
    return (
      <div className="p-8">
        <LoadingSpinner size="large" text="Loading smart trip requests..." />
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Smart Trip Requests</h1>
        <p className="text-gray-600 mt-2">Manage AI-powered trip planning requests</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Smart Trips Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                City
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Budget
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                People
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredSmartTrips.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                  No smart trip requests found
                </td>
              </tr>
            ) : (
              filteredSmartTrips.map((trip) => (
                <tr key={trip.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{trip.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {trip.user_name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {trip.city_name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {trip.budget ? formatCurrency(trip.budget) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {trip.people_count || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      trip.status === 'completed' ? 'bg-green-100 text-green-700' :
                      trip.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      trip.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {trip.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center space-x-2">
                      {trip.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(trip.id, 'processing')}
                            className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Process"
                          >
                            <Brain className="w-4 h-4 text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(trip.id, 'completed')}
                            className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                            title="Complete"
                          >
                            <Check className="w-4 h-4 text-green-600" />
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(trip.id, 'cancelled')}
                            className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                            title="Cancel"
                          >
                            <X className="w-4 h-4 text-red-600" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminSmartTrips;

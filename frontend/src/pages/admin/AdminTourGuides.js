import React, { useState, useEffect } from 'react';
import { User, Plus, Edit, Trash2, Search, Star } from 'lucide-react';
import { apiService } from '../../services/api';
import { formatCurrency } from '../../utils/helpers';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

const AdminTourGuides = () => {
  const [tourGuides, setTourGuides] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadTourGuides();
  }, []);

  const loadTourGuides = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.getAllTourGuides();
      setTourGuides(response.data || []);
    } catch (err) {
      console.error('Error loading tour guides:', err);
      setError('Failed to load tour guides');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTourGuides = tourGuides.filter(guide => {
    return searchTerm === '' || 
      guide.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guide.specialization.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (isLoading) {
    return (
      <div className="p-8">
        <LoadingSpinner size="large" text="Loading tour guides..." />
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
          <h1 className="text-3xl font-bold text-gray-900">Tour Guides</h1>
          <p className="text-gray-600 mt-2">Manage tour guide listings</p>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>Add Tour Guide</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search tour guides..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Tour Guides Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTourGuides.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            No tour guides found
          </div>
        ) : (
          filteredTourGuides.map((guide) => (
            <div key={guide.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {guide.image_url && (
                <img
                  src={guide.image_url}
                  alt={guide.name}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{guide.name}</h3>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium text-gray-900">{guide.rating}</span>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-600 mb-2">
                  <p><span className="font-medium">Specialization:</span> {guide.specialization}</p>
                  <p><span className="font-medium">Experience:</span> {guide.experience_years} years</p>
                  <p><span className="font-medium">Languages:</span> {guide.languages}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(guide.price_per_day)}/day
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

export default AdminTourGuides;

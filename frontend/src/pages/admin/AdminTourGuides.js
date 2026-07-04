import React, { useState, useEffect } from 'react';
import { User, Plus, Edit, Trash2, Search, Star, X, Check } from 'lucide-react';
import apiService from '../../services/api';
import { formatCurrency } from '../../utils/helpers';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

const AdminTourGuides = () => {
  const [tourGuides, setTourGuides] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    specialization: 'Cultural',
    experience_years: '',
    languages: '',
    price_per_day: '',
    image_url: '',
    bio: '',
    rating: 0,
    available: true
  });
  const [ratingValue, setRatingValue] = useState(0);

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

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleOpenModal = (guide = null) => {
    if (guide) {
      setSelectedGuide(guide);
      setFormData({
        name: guide.name,
        specialization: guide.specialization,
        experience_years: guide.experience_years,
        languages: guide.languages,
        price_per_day: guide.price_per_day,
        image_url: guide.image_url || '',
        bio: guide.bio || '',
        rating: guide.rating,
        is_available: guide.is_available
      });
    } else {
      setSelectedGuide(null);
      setFormData({
        name: '',
        specialization: 'Cultural',
        experience_years: '',
        languages: '',
        price_per_day: '',
        image_url: '',
        bio: '',
        rating: 0,
        available: true
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedGuide(null);
    setFormData({
      name: '',
      specialization: 'Cultural',
      experience_years: '',
      languages: '',
      price_per_day: '',
      image_url: '',
      bio: '',
      rating: 0,
      available: true
    });
  };

  const handleOpenDeleteModal = (guide) => {
    setSelectedGuide(guide);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedGuide(null);
  };

  const handleOpenRatingModal = (guide) => {
    setSelectedGuide(guide);
    setRatingValue(guide.rating);
    setIsRatingModalOpen(true);
  };

  const handleCloseRatingModal = () => {
    setIsRatingModalOpen(false);
    setSelectedGuide(null);
    setRatingValue(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (selectedGuide) {
        await apiService.updateTourGuide(selectedGuide.id, formData);
        showToast('Tour guide updated successfully');
      } else {
        await apiService.createTourGuide(formData);
        showToast('Tour guide created successfully');
      }
      handleCloseModal();
      loadTourGuides();
    } catch (err) {
      console.error('Error saving tour guide:', err);
      setError(err.response?.data?.message || 'Failed to save tour guide');
      showToast('Failed to save tour guide', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      await apiService.deleteTourGuide(selectedGuide.id);
      showToast('Tour guide deleted successfully');
      handleCloseDeleteModal();
      loadTourGuides();
    } catch (err) {
      console.error('Error deleting tour guide:', err);
      setError(err.response?.data?.message || 'Failed to delete tour guide');
      showToast('Failed to delete tour guide', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRatingUpdate = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      await apiService.updateTourGuideRating(selectedGuide.id, ratingValue);
      showToast('Rating updated successfully');
      handleCloseRatingModal();
      loadTourGuides();
    } catch (err) {
      console.error('Error updating rating:', err);
      setError(err.response?.data?.message || 'Failed to update rating');
      showToast('Failed to update rating', 'error');
    } finally {
      setIsSubmitting(false);
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
        <button 
          onClick={() => handleOpenModal()}
          className="btn-primary flex items-center space-x-2"
        >
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
            <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No tour guides found</p>
            <p className="text-sm">Add your first tour guide to get started</p>
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
                    <button 
                      onClick={() => handleOpenRatingModal(guide)}
                      className="p-2 hover:bg-yellow-100 rounded-lg transition-colors"
                      title="Update Rating"
                    >
                      <Star className="w-4 h-4 text-yellow-600" />
                    </button>
                    <button 
                      onClick={() => handleOpenModal(guide)}
                      className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4 text-blue-600" />
                    </button>
                    <button 
                      onClick={() => handleOpenDeleteModal(guide)}
                      className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedGuide ? 'Edit Tour Guide' : 'Add New Tour Guide'}
                </h2>
                <button 
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Guide Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    placeholder="e.g., John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specialization *</label>
                  <select
                    required
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    className="input-field"
                  >
                    <option value="Cultural">Cultural</option>
                    <option value="Historical">Historical</option>
                    <option value="Nature">Nature</option>
                    <option value="Adventure">Adventure</option>
                    <option value="Religious">Religious</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.experience_years}
                    onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                    className="input-field"
                    placeholder="e.g., 5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Languages *</label>
                  <input
                    type="text"
                    required
                    value={formData.languages}
                    onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                    className="input-field"
                    placeholder="e.g., English, Indonesian"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price per Day (IDR) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.price_per_day}
                    onChange={(e) => setFormData({ ...formData, price_per_day: e.target.value })}
                    className="input-field"
                    placeholder="e.g., 300000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="input-field"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="input-field"
                    rows="3"
                    placeholder="Guide bio..."
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="available"
                    checked={formData.available}
                    onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <label htmlFor="available" className="ml-2 text-sm text-gray-700">Available for booking</label>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : (selectedGuide ? 'Update Tour Guide' : 'Add Tour Guide')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Delete Tour Guide</h2>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete <strong>{selectedGuide?.name}</strong>?
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCloseDeleteModal}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rating Update Modal */}
      {isRatingModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Update Rating</h2>
                  <p className="text-sm text-gray-600">{selectedGuide?.name}</p>
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating (0-5)</label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRatingValue(star)}
                      className="p-2 hover:bg-yellow-100 rounded-lg transition-colors"
                    >
                      <Star 
                        className={`w-8 h-8 ${star <= ratingValue ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                      />
                    </button>
                  ))}
                  <span className="ml-4 text-2xl font-bold text-gray-900">{ratingValue}/5</span>
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCloseRatingModal}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRatingUpdate}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Updating...' : 'Update Rating'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {toast.type === 'success' ? (
            <Check className="w-5 h-5" />
          ) : (
            <X className="w-5 h-5" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default AdminTourGuides;

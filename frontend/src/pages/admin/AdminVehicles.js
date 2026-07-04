import React, { useState, useEffect } from 'react';
import { Car, Plus, Edit, Trash2, Search, X, Check } from 'lucide-react';
import apiService from '../../services/api';
import { formatCurrency } from '../../utils/helpers';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

const AdminVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'normal',
    capacity: '',
    price_per_day: '',
    image_url: '',
    description: '',
    available: true,
    is_active: true
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

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

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleOpenModal = (vehicle = null) => {
    if (vehicle) {
      setSelectedVehicle(vehicle);
      setFormData({
        name: vehicle.name,
        category: vehicle.category,
        capacity: vehicle.capacity,
        price_per_day: vehicle.price_per_day,
        image_url: vehicle.image_url || '',
        description: vehicle.description || '',
        is_active: vehicle.is_active !== undefined ? vehicle.is_active : true
      });
      setImagePreview(vehicle.image_url || '');
      setImageFile(null);
    } else {
      setSelectedVehicle(null);
      setFormData({
        name: '',
        category: 'normal',
        capacity: '',
        price_per_day: '',
        image_url: '',
        description: '',
        available: true,
        is_active: true
      });
      setImagePreview('');
      setImageFile(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedVehicle(null);
    setFormData({
      name: '',
      category: 'normal',
      capacity: '',
      price_per_day: '',
      image_url: '',
      description: '',
      available: true,
      is_active: true
    });
    setImagePreview('');
    setImageFile(null);
  };

  const handleOpenDeleteModal = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedVehicle(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('capacity', formData.capacity);
      formDataToSend.append('price_per_day', formData.price_per_day);
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('available', formData.available);
      formDataToSend.append('is_active', formData.is_active);
      
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      } else if (formData.image_url) {
        formDataToSend.append('image_url', formData.image_url);
      }

      if (selectedVehicle) {
        await apiService.updateVehicle(selectedVehicle.id, formDataToSend);
        showToast('Vehicle updated successfully');
      } else {
        await apiService.createVehicle(formDataToSend);
        showToast('Vehicle created successfully');
      }
      handleCloseModal();
      loadVehicles();
    } catch (err) {
      console.error('Error saving vehicle:', err);
      setError(err.response?.data?.message || 'Failed to save vehicle');
      showToast('Failed to save vehicle', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      await apiService.deleteVehicle(selectedVehicle.id);
      showToast('Vehicle deleted successfully');
      handleCloseDeleteModal();
      loadVehicles();
    } catch (err) {
      console.error('Error deleting vehicle:', err);
      setError(err.response?.data?.message || 'Failed to delete vehicle');
      showToast('Failed to delete vehicle', 'error');
    } finally {
      setIsSubmitting(false);
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
        <button 
          onClick={() => handleOpenModal()}
          className="btn-primary flex items-center space-x-2"
        >
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
            <Car className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No vehicles found</p>
            <p className="text-sm">Add your first vehicle to get started</p>
          </div>
        ) : (
          filteredVehicles.map((vehicle) => (
            <div key={vehicle.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{vehicle.name}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    !vehicle.is_active ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {vehicle.is_active ? 'Available' : 'Unavailable'}
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
                    <button 
                      onClick={() => handleOpenModal(vehicle)}
                      className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4 text-blue-600" />
                    </button>
                    <button 
                      onClick={() => handleOpenDeleteModal(vehicle)}
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
                  {selectedVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    placeholder="e.g., Toyota Avanza"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input-field"
                  >
                    <option value="normal">Normal (Car)</option>
                    <option value="hiace">Hiace</option>
                    <option value="elf">Elf</option>
                    <option value="bus">Bus</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacity (people) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="input-field"
                    placeholder="e.g., 4"
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
                    placeholder="e.g., 500000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Image</label>
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif"
                      onChange={handleImageChange}
                      className="input-field"
                    />
                    <div className="text-sm text-gray-500">Or enter image URL:</div>
                    <input
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      className="input-field"
                      placeholder="https://example.com/image.jpg"
                    />
                    {imagePreview && (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg border border-gray-200"
                      />
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-field"
                    rows="3"
                    placeholder="Vehicle description..."
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
                  {isSubmitting ? 'Saving...' : (selectedVehicle ? 'Update Vehicle' : 'Add Vehicle')}
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
                  <h2 className="text-xl font-bold text-gray-900">Delete Vehicle</h2>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete <strong>{selectedVehicle?.name}</strong>?
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

export default AdminVehicles;

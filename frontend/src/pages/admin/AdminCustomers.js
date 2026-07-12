import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Edit, Trash2, Plus, X } from 'lucide-react';
import apiService from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { useAuth } from '../../context/AuthContext';

const AdminCustomers = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.email === 'admin@wisata.test';
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [createFormData, setCreateFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'customer'
  });
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'customer',
    is_active: true
  });
  const [createError, setCreateError] = useState(null);
  const [editError, setEditError] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.getAdminCustomers();
      setCustomers(response.data || []);
    } catch (err) {
      console.error('Error loading customers:', err);
      setError('Failed to load customers');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesFilter = filter === 'all' || customer.role === filter;
    const matchesSearch = searchTerm === '' || 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleDelete = async (customer) => {
    try {
      await apiService.deleteUser(customer.id);
      setCustomers(customers.filter(c => c.id !== customer.id));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Failed to delete user');
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setCreateError(null);
    setIsCreating(true);

    try {
      await apiService.createAdmin(
        createFormData.name,
        createFormData.email,
        createFormData.password,
        createFormData.phone
      );
      setShowCreateModal(false);
      setCreateFormData({ name: '', email: '', password: '', phone: '', role: 'customer' });
      loadCustomers();
    } catch (err) {
      console.error('Error creating admin:', err);
      const errorMsg = err.response?.data?.message || err.error || err.message || 'Failed to create admin';
      setCreateError(errorMsg);
    } finally {
      setIsCreating(false);
    }
  };

  const handleViewCustomer = async (customer) => {
    setSelectedCustomer(customer);
    setShowViewModal(true);
    setIsLoadingDetails(true);
    setCustomerDetails(null);

    try {
      const response = await apiService.getCustomerById(customer.id);
      setCustomerDetails(response.data);
    } catch (err) {
      console.error('Error fetching customer details:', err);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer);
    setEditFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone || '',
      role: customer.role,
      is_active: customer.is_active
    });
    setEditError(null);
    setShowEditModal(true);
  };

  const handleUpdateCustomer = async (e) => {
    e.preventDefault();
    setEditError(null);
    setIsEditing(true);

    try {
      await apiService.updateCustomer(selectedCustomer.id, editFormData);
      setShowEditModal(false);
      setSelectedCustomer(null);
      loadCustomers();
    } catch (err) {
      console.error('Error updating customer:', err);
      const errorMsg = err.response?.data?.message || err.error || err.message || 'Failed to update customer';
      setEditError(errorMsg);
    } finally {
      setIsEditing(false);
    }
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    setCreateError(null);
    setIsCreating(true);

    try {
      await apiService.createCustomer(createFormData);
      setShowCreateModal(false);
      setCreateFormData({ name: '', email: '', password: '', phone: '', role: 'customer' });
      loadCustomers();
    } catch (err) {
      console.error('Error creating customer:', err);
      const errorMsg = err.response?.data?.message || err.error || err.message || 'Failed to create customer';
      setCreateError(errorMsg);
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <LoadingSpinner size="large" text="Loading customers..." />
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
        <h1 className="text-3xl font-bold text-gray-900">Users</h1>
        <p className="text-gray-600 mt-2">Manage all user accounts</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">All Roles</option>
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {isSuperAdmin && (
            <button
              onClick={() => {
                setCreateFormData({ name: '', email: '', password: '', phone: '', role: 'admin' });
                setShowCreateModal(true);
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Admin</span>
            </button>
          )}
          <button
            onClick={() => {
              setCreateFormData({ name: '', email: '', password: '', phone: '', role: 'customer' });
              setShowCreateModal(true);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
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
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                  No customers found
                </td>
              </tr>
            ) : (
              filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{customer.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {customer.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {customer.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {customer.phone || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      customer.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {customer.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      customer.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {customer.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center space-x-2">
                      <button
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View Details"
                        onClick={() => handleViewCustomer(customer)}
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Edit"
                        onClick={() => handleEditCustomer(customer)}
                      >
                        <Edit className="w-4 h-4 text-blue-600" />
                      </button>
                      {customer.role !== 'admin' && (
                        <button
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                          title="Delete"
                          onClick={() => setDeleteConfirm(customer)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Delete User</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Admin/Customer Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {createFormData.role === 'admin' ? 'Create New Admin' : 'Create New Customer'}
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {createError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg text-sm">
                {createError}
              </div>
            )}

            <form onSubmit={createFormData.role === 'admin' ? handleCreateAdmin : handleCreateCustomer}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={createFormData.name}
                    onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                    className="input-field"
                    placeholder="Enter name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={createFormData.email}
                    onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                    className="input-field"
                    placeholder="Enter email"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={createFormData.password}
                    onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
                    className="input-field"
                    placeholder="Enter password (min 6 characters)"
                    required
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={createFormData.phone}
                    onChange={(e) => setCreateFormData({ ...createFormData, phone: e.target.value })}
                    className="input-field"
                    placeholder="Enter phone number (optional)"
                  />
                </div>
              </div>

              <div className="flex space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className={`flex-1 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    createFormData.role === 'admin' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {isCreating ? 'Creating...' : (createFormData.role === 'admin' ? 'Create Admin' : 'Create Customer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Customer Modal */}
      {showViewModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Customer Details</h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {isLoadingDetails ? (
              <div className="text-center py-8">
                <LoadingSpinner size="medium" text="Loading details..." />
              </div>
            ) : customerDetails ? (
              <div className="space-y-6">
                {/* Customer Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Profile Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">ID:</span>
                      <span className="ml-2 font-medium">#{customerDetails.customer.id}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Name:</span>
                      <span className="ml-2 font-medium">{customerDetails.customer.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Email:</span>
                      <span className="ml-2 font-medium">{customerDetails.customer.email}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Phone:</span>
                      <span className="ml-2 font-medium">{customerDetails.customer.phone || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Role:</span>
                      <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
                        {customerDetails.customer.role}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Status:</span>
                      <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                        customerDetails.customer.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {customerDetails.customer.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Joined:</span>
                      <span className="ml-2 font-medium">
                        {new Date(customerDetails.customer.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bookings */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Booking History</h4>
                  {customerDetails.bookings && customerDetails.bookings.length > 0 ? (
                    <div className="space-y-2">
                      {customerDetails.bookings.map((booking) => (
                        <div key={booking.id} className="bg-gray-50 rounded-lg p-3 text-sm">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-medium">Booking #{booking.id}</span>
                              <div className="text-gray-500">{booking.user_name}</div>
                            </div>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                              booking.status === 'PENDING_PAYMENT' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {booking.status}
                            </span>
                          </div>
                          <div className="mt-2 text-gray-600">
                            Total: Rp {booking.total_price?.toLocaleString()} | Nights: {booking.nights}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm py-4 text-center bg-gray-50 rounded-lg">
                      No bookings found
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-red-500 text-sm py-4 text-center">
                Failed to load customer details
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {showEditModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Edit Customer</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {editError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg text-sm">
                {editError}
              </div>
            )}

            <form onSubmit={handleUpdateCustomer}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={editFormData.role}
                    onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                    className="input-field"
                  >
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={editFormData.is_active}
                    onChange={(e) => setEditFormData({ ...editFormData, is_active: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                    Active
                  </label>
                </div>
              </div>

              <div className="flex space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEditing}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isEditing ? 'Updating...' : 'Update Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;

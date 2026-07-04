import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Check, X, Clock, AlertCircle, FileText } from 'lucide-react';
import apiService from '../../services/api';
import { formatCurrency } from '../../utils/helpers';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { useAuth } from '../../context/AuthContext';

const CustomerBookings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [paymentProof, setPaymentProof] = useState(null);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('=== CALLING getMyBookings ===');
      console.log('User email:', user?.email);
      const response = await apiService.getMyBookings({ email: user?.email });
      console.log('=== MY BOOKINGS RESPONSE ===', response);
      const bookings = response.data || response.bookings || [];
      console.log('=== EXTRACTED BOOKINGS ===', bookings);
      setBookings(bookings);
    } catch (err) {
      console.error('Error loading bookings:', err);
      console.error('Error response:', err.response);
      console.error('Error message:', err.message);
      setError('Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        setError('Only JPG, JPEG, and PNG files are allowed');
        return;
      }
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      setPaymentProof(file);
      setError(null);
    }
  };

  const handleUploadProof = async (bookingId) => {
    if (!paymentProof) {
      setError('Please select a payment proof file');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append('payment_proof', paymentProof);

      // Upload payment proof
      const uploadResponse = await apiService.uploadPaymentProof(formData);
      const fileUrl = uploadResponse.file_url;

      // Create payment record
      await apiService.createPayment({
        booking_id: bookingId,
        amount: selectedBooking.total_price,
        payment_method: 'transfer',
        proof_image: fileUrl
      });

      setPaymentProof(null);
      setSelectedBooking(null);
      loadBookings();
    } catch (err) {
      console.error('Error uploading payment proof:', err);
      setError('Failed to upload payment proof');
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'PENDING_PAYMENT': { color: 'bg-yellow-100 text-yellow-700', label: 'Menunggu Pembayaran' },
      'pending': { color: 'bg-yellow-100 text-yellow-700', label: 'Menunggu Pembayaran' },
      'confirmed': { color: 'bg-green-100 text-green-700', label: 'Pembayaran Diterima' },
      'cancelled': { color: 'bg-red-100 text-red-700', label: 'Dibatalkan' }
    };
    const config = statusMap[status] || { color: 'bg-gray-100 text-gray-700', label: status };
    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <LoadingSpinner size="large" text="Loading bookings..." />
      </div>
    );
  }

  if (error && !selectedBooking) {
    return (
      <div className="p-8">
        <ErrorMessage error={error} />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
        <p className="text-gray-600 mt-2">View and manage your travel bookings</p>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
          <p className="text-gray-600 mb-6">Start exploring packages and book your first trip!</p>
          <button
            onClick={() => navigate('/customer/home')}
            className="btn-primary"
          >
            Browse Packages
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">Booking #{booking.id}</h3>
                    {getStatusBadge(booking.status)}
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><span className="font-medium">City:</span> {booking.city_name}</p>
                    <p><span className="font-medium">Total:</span> {formatCurrency(booking.total_price)}</p>
                    <p><span className="font-medium">Date:</span> {new Date(booking.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {(booking.status === 'PENDING_PAYMENT' || booking.status === 'pending') && (
                    <button
                      onClick={() => setSelectedBooking(booking)}
                      className="btn-primary flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Upload Proof
                    </button>
                  )}
                  <button
                    onClick={() => navigate(`/customer/bookings/${booking.id}`)}
                    className="btn-outline"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Payment Proof Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Upload Payment Proof</h2>
              <p className="text-sm text-gray-600 mt-1">Booking #{selectedBooking.id} - {formatCurrency(selectedBooking.total_price)}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Proof (JPG, JPEG, PNG - Max 5MB)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="payment_proof"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="payment_proof"
                    className="cursor-pointer"
                  >
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-600 mb-2">
                      {paymentProof ? paymentProof.name : 'Click to upload payment proof'}
                    </p>
                    <p className="text-xs text-gray-400">
                      Accepts: JPG, JPEG, PNG (Max 5MB)
                    </p>
                  </label>
                </div>
              </div>
              {error && <ErrorMessage error={error} />}
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setSelectedBooking(null);
                  setPaymentProof(null);
                  setError(null);
                }}
                className="btn-outline"
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                onClick={() => handleUploadProof(selectedBooking.id)}
                className="btn-primary"
                disabled={uploading || !paymentProof}
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerBookings;

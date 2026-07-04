import React, { useState, useEffect } from 'react';
import { Calendar, Filter, Search, Eye, Check, X } from 'lucide-react';
import apiService from '../../services/api';
import { formatCurrency } from '../../utils/helpers';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showSendMessage, setShowSendMessage] = useState(false);
  const [messageTitle, setMessageTitle] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [messageType, setMessageType] = useState('admin_message');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [sendError, setSendError] = useState(null);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.getAdminBookings();
      setBookings(response.data || []);
    } catch (err) {
      console.error('Error loading bookings:', err);
      setError('Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (bookingId, status) => {
    try {
      await apiService.updateBookingStatus(bookingId, status);
      loadBookings();
    } catch (err) {
      console.error('Error updating booking status:', err);
      setError('Failed to update booking status');
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const bookingStatus = booking.status?.toUpperCase() || '';
    const normalizedFilter = filter === 'pending' ? 'PENDING_PAYMENT' : filter.toUpperCase();
    const matchesFilter = filter === 'all' || bookingStatus === normalizedFilter;
    const matchesSearch = searchTerm === '' || 
      booking.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.id.toString().includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="p-8">
        <LoadingSpinner size="large" text="Loading bookings..." />
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
        <h1 className="text-3xl font-bold text-gray-900">Bookings</h1>
        <p className="text-gray-600 mt-2">Manage all travel bookings</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search bookings..."
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
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
              <option value="payment_rejected">Payment Rejected</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hotel
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trip Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
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
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                  No bookings found
                </td>
              </tr>
            ) : (
              filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{booking.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{booking.user_name}</div>
                    <div className="text-sm text-gray-500">{booking.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {booking.hotel_name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {booking.trip_date || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(booking.total_price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                      booking.status === 'PENDING_PAYMENT' ? 'bg-yellow-100 text-yellow-700' :
                      booking.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                      booking.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowDetails(true);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                      {booking.status === 'PENDING_PAYMENT' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(booking.id, 'CONFIRMED')}
                            className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                            title="Confirm"
                          >
                            <Check className="w-4 h-4 text-green-600" />
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(booking.id, 'CANCELLED')}
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

      {/* Booking Details Modal */}
      {showDetails && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Booking Details #{selectedBooking.id}</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">User Information</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <p><span className="text-gray-600">Name:</span> {selectedBooking.user_name}</p>
                  <p><span className="text-gray-600">Email:</span> {selectedBooking.email}</p>
                  <p><span className="text-gray-600">Phone:</span> {selectedBooking.phone || 'N/A'}</p>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Trip Details</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <p><span className="text-gray-600">Hotel:</span> {selectedBooking.hotel_name || 'N/A'}</p>
                  <p><span className="text-gray-600">Trip Date:</span> {selectedBooking.trip_date || 'N/A'}</p>
                  <p><span className="text-gray-600">Nights:</span> {selectedBooking.nights || 1}</p>
                  <p><span className="text-gray-600">People:</span> {selectedBooking.people_count || 1}</p>
                  <p><span className="text-gray-600">Total:</span> {formatCurrency(selectedBooking.total_price)}</p>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <div className="flex items-center gap-3 mr-auto">
                <button
                  onClick={() => setShowSendMessage(true)}
                  className="btn-outline"
                >
                  Send Message
                </button>
              </div>
              <button
                onClick={() => {
                  setShowDetails(false);
                  setSelectedBooking(null);
                }}
                className="btn-outline"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Message Modal */}
      {showSendMessage && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Kirim Pesan ke User #{selectedBooking.id}</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Judul</label>
                <input
                  type="text"
                  value={messageTitle}
                  onChange={(e) => setMessageTitle(e.target.value)}
                  className="input-field w-full"
                  placeholder="Judul pesan"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipe Pesan</label>
                <select value={messageType} onChange={(e) => setMessageType(e.target.value)} className="input-field">
                  <option value="admin_message">Admin Message</option>
                  <option value="trip_reminder">Trip Reminder</option>
                  <option value="general">General</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Isi Pesan</label>
                <textarea
                  value={messageBody}
                  onChange={(e) => setMessageBody(e.target.value)}
                  className="input-field w-full h-32"
                  placeholder="Tulis pesan kepada user..."
                />
              </div>
              {sendError && <ErrorMessage error={sendError} />}
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowSendMessage(false)}
                className="btn-outline"
                disabled={sendingMessage}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setSendError(null);
                  if (!messageTitle || !messageBody) {
                    setSendError('Judul dan isi pesan harus diisi');
                    return;
                  }
                  try {
                    setSendingMessage(true);
                    await apiService.adminSendNotification({
                      user_id: selectedBooking.user_id,
                      booking_id: selectedBooking.id,
                      title: messageTitle,
                      message: messageBody,
                      type: messageType
                    });
                    setShowSendMessage(false);
                    setMessageTitle('');
                    setMessageBody('');
                    setMessageType('admin_message');
                    // refresh bookings list
                    await loadBookings();
                  } catch (err) {
                    console.error('Error sending admin message:', err);
                    setSendError(err?.error || 'Failed to send message');
                  } finally {
                    setSendingMessage(false);
                  }
                }}
                className="btn-primary"
                disabled={sendingMessage}
              >
                {sendingMessage ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;

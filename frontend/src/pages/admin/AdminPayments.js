import React, { useState, useEffect } from 'react';
import { Filter, Search, Check, X, Eye, Trash2 } from 'lucide-react';
import apiService from '../../services/api';
import { formatCurrency } from '../../utils/helpers';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [proofUrl, setProofUrl] = useState(null);
  const [proofLoading, setProofLoading] = useState(false);
  const [proofError, setProofError] = useState(null);

  const getProofImageUrl = (payment) => {
    if (!payment?.proof_image) return null;
    return `/api/payments/${payment.id}/proof`;
  };

  const loadProofImage = async (payment) => {
    if (!payment?.proof_image) {
      setProofError('Tidak ada bukti transfer.');
      return;
    }

    setProofError(null);
    setProofLoading(true);
    setProofUrl(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/payments/${payment.id}/proof`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Proof fetch failed:', response.status, errorText);
        throw new Error(errorText || `HTTP ${response.status}`);
      }

      const blob = await response.blob();
      if (!blob || blob.size === 0) {
        throw new Error('Empty proof image');
      }

      const objectUrl = URL.createObjectURL(blob);
      setProofUrl(objectUrl);
    } catch (err) {
      console.error('Error loading proof image:', err);
      setProofError('Gagal memuat bukti transfer.');
    } finally {
      setProofLoading(false);
    }
  };

  const openPaymentDetails = (payment) => {
    setSelectedPayment(payment);
    setShowDetails(true);
    loadProofImage(payment);
  };

  const closePaymentDetails = () => {
    setShowDetails(false);
    setSelectedPayment(null);
    setProofError(null);
    setProofLoading(false);
    if (proofUrl) {
      URL.revokeObjectURL(proofUrl);
      setProofUrl(null);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.getAdminPayments();
      console.log('=== ADMIN PAYMENTS RESPONSE ===', response);
      const paymentsData = response?.data || response?.payments || response || [];
      console.log('=== FRONTEND PAYMENTS DATA ===', paymentsData);
      setPayments(Array.isArray(paymentsData) ? paymentsData : []);
    } catch (err) {
      console.error('Error loading payments:', err);
      setError('Failed to load payments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPayment = async (paymentId, status) => {
    try {
      const statusLower = status.toLowerCase();
      const adminNotes = statusLower === 'approved' ? 'Approved by admin' : 'Rejected by admin';
      await apiService.verifyPayment(paymentId, statusLower, adminNotes);
      loadPayments();
    } catch (err) {
      console.error('Error verifying payment:', err);
      setError('Failed to verify payment');
    }
  };

  const handleDeletePayment = async (paymentId) => {
    if (!window.confirm('Are you sure you want to delete this payment?')) {
      return;
    }

    try {
      await apiService.deletePayment(paymentId);
      loadPayments();
    } catch (err) {
      console.error('Error deleting payment:', err);
      setError('Failed to delete payment');
    }
  };

  const filteredPayments = payments.filter(payment => {
    const normalizedFilter = filter === 'approved' ? 'paid' : filter;
    const matchesFilter = filter === 'all' || 
      payment.status?.toLowerCase() === normalizedFilter.toLowerCase();
    const matchesSearch = searchTerm === '' || 
      payment.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.id.toString().includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="p-8">
        <LoadingSpinner size="large" text="Loading payments..." />
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
        <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
        <p className="text-gray-600 mt-2">Manage and verify payment proofs</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search payments..."
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
              <option value="paid">Paid</option>
              <option value="rejected">Rejected</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Booking ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Method
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bukti Transfer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created At
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
            {filteredPayments.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                  No payments found
                </td>
              </tr>
            ) : (
              filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{payment.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{payment.user_name || 'N/A'}</div>
                    <div className="text-sm text-gray-500">{payment.user_email || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    #{payment.booking_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(payment.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                    {payment.payment_method}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {payment.proof_image ? (
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-12 rounded-md border border-gray-200 bg-gray-50 flex items-center justify-center text-xs text-gray-500">
                          Proof
                        </div>
                        <button
                          onClick={() => openPaymentDetails(payment)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          View
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">Belum ada</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payment.created_at ? new Date(payment.created_at).toLocaleString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      payment.status?.toLowerCase() === 'paid' ? 'bg-green-100 text-green-700' :
                      payment.status?.toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      payment.status?.toLowerCase() === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openPaymentDetails(payment)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                      {payment.status?.toLowerCase() === 'pending' && (
                        <>
                          <button
                            onClick={() => handleVerifyPayment(payment.id, 'APPROVED')}
                            className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                            title="Approve"
                          >
                            <Check className="w-4 h-4 text-green-600" />
                          </button>
                          <button
                            onClick={() => handleVerifyPayment(payment.id, 'REJECTED')}
                            className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                            title="Reject"
                          >
                            <X className="w-4 h-4 text-red-600" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDeletePayment(payment.id)}
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                        title="Delete Payment"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Payment Details Modal */}
      {showDetails && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Payment Details #{selectedPayment.id}</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Payment Information</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <p><span className="text-gray-600">Amount:</span> {formatCurrency(selectedPayment.amount)}</p>
                  <p><span className="text-gray-600">Method:</span> {selectedPayment.payment_method}</p>
                  <p><span className="text-gray-600">Status:</span> {selectedPayment.status}</p>
                  <p><span className="text-gray-600">Booking ID:</span> #{selectedPayment.booking_id}</p>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Payment Proof</h3>
                <div className="bg-gray-50 rounded-lg p-4 flex justify-center items-center min-h-[220px]">
                  {proofLoading ? (
                    <div className="text-sm text-gray-600">Memuat bukti transfer...</div>
                  ) : proofError ? (
                    <div className="text-sm text-red-600">{proofError}</div>
                  ) : proofUrl ? (
                    <img
                      src={proofUrl}
                      alt="Payment Proof"
                      style={{ maxWidth: '100%', maxHeight: '80vh' }}
                      className="rounded-lg"
                    />
                  ) : (
                    <div className="text-sm text-gray-500">Tidak ada bukti transfer tersedia.</div>
                  )}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => {
                  setShowDetails(false);
                  setSelectedPayment(null);
                }}
                className="btn-outline"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayments;

import React, { useState, useEffect } from 'react';
import { CreditCard, Filter, Search, Check, X, Eye } from 'lucide-react';
import { apiService } from '../../services/api';
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

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.getAdminPayments();
      setPayments(response.data?.payments || []);
    } catch (err) {
      console.error('Error loading payments:', err);
      setError('Failed to load payments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPayment = async (paymentId, status) => {
    try {
      await apiService.verifyPayment(paymentId, status);
      loadPayments();
    } catch (err) {
      console.error('Error verifying payment:', err);
      setError('Failed to verify payment');
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesFilter = filter === 'all' || payment.status === filter;
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
              <option value="waiting_verification">Waiting Verification</option>
              <option value="paid">Paid</option>
              <option value="rejected">Rejected</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payments Table */}
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
                Booking ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Method
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
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      payment.status === 'paid' ? 'bg-green-100 text-green-700' :
                      payment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      payment.status === 'waiting_verification' ? 'bg-blue-100 text-blue-700' :
                      payment.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      payment.status === 'refunded' ? 'bg-purple-100 text-purple-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {payment.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedPayment(payment);
                          setShowDetails(true);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                      {(payment.status === 'pending' || payment.status === 'waiting_verification') && (
                        <>
                          <button
                            onClick={() => handleVerifyPayment(payment.id, 'paid')}
                            className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                            title="Approve"
                          >
                            <Check className="w-4 h-4 text-green-600" />
                          </button>
                          <button
                            onClick={() => handleVerifyPayment(payment.id, 'rejected')}
                            className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                            title="Reject"
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
              {selectedPayment.proof_image && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Payment Proof</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <img
                      src={selectedPayment.proof_image}
                      alt="Payment Proof"
                      className="max-w-full h-auto rounded-lg"
                    />
                  </div>
                </div>
              )}
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

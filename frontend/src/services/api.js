import axios from 'axios';

const getApiBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:5000/api';
  }

  // Fallback production - should never be used if REACT_APP_API_URL
  // is correctly set in Vercel environment variables.
  return 'https://wisata-production-9a51.up.railway.app/api';
};

// Create axios instance with base configuration
const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add JWT token to headers if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Handle common error cases
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          break;
        case 403:
          // Forbidden
          console.error('Access forbidden');
          break;
        case 404:
          // Not found
          console.error('Resource not found');
          break;
        case 429:
          // Rate limited
          console.error('Too many requests');
          break;
        case 500:
          // Server error
          console.error('Server error');
          break;
        default:
          console.error(`HTTP Error: ${status}`);
      }
      
      return Promise.reject(data || error);
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network error - no response received');
      return Promise.reject({ error: 'Network error' });
    } else {
      // Something else happened
      console.error('Request error:', error.message);
      return Promise.reject({ error: error.message });
    }
  }
);

// API Service methods
const apiService = {
  // Cities
  getCities: () => api.get('/cities'),
  getCityById: (id) => api.get(`/cities/${id}`),
  getCityWithStats: (id) => api.get(`/cities/${id}/stats`),

  // Packages
  generatePackages: (params) => api.get('/packages', { params }),
  calculateCustomPackage: (data) => api.post('/packages/custom', data),
  validatePackage: (data) => api.post('/packages/validate', data),
  getBudgetBreakdown: (budget) => api.get('/packages/budget-breakdown', { params: { budget } }),
  getAllPackages: (params) => api.get('/packages', { params }),

  // Bookings
  createBooking: (data) => api.post('/booking', data),
  getBookingById: (id) => api.get(`/booking/${id}`),
  getAllBookings: (params) => api.get('/booking', { params }),
  getBookingsByEmail: (email, params) => api.get('/booking/email', { params: { email, ...params } }),
  getMyBookings: (params) => api.get('/booking/my-bookings', { params }),
  updateBookingStatus: (id, status) => api.put(`/booking/${id}/status`, { status }),
  cancelBooking: (id) => api.put(`/booking/${id}/cancel`),
  confirmBooking: (id) => api.put(`/booking/${id}/confirm`),
  getBookingStats: (params) => api.get('/booking/stats', { params }),
  getPopularDestinations: (params) => api.get('/booking/popular', { params }),
  deleteBooking: (id) => api.delete(`/booking/${id}`),

  // Hotels
  getAllHotels: (params) => api.get('/hotels', { params }),
  getHotelsByCity: (cityId, params) => api.get(`/hotels/city/${cityId}`, { params }),
  getHotelById: (id) => api.get(`/hotels/${id}`),

  // Tourist Places
  getAllTouristPlaces: (params) => api.get('/tourist-places', { params }),
  getTouristPlacesByCity: (cityId, params) => api.get(`/tourist-places/city/${cityId}`, { params }),
  getTouristPlaceById: (id) => api.get(`/tourist-places/${id}`),

  // Vehicles
  getAllVehicles: (params) => api.get('/vehicles', { params }),
  getVehicleById: (id) => api.get(`/vehicles/${id}`),
  getVehiclesByCapacity: (minCapacity, maxCapacity) => api.get(`/vehicles/capacity/${minCapacity}/${maxCapacity}`),
  getRecommendedVehicle: (peopleCount) => api.get('/vehicles/recommend', { params: { people_count: peopleCount } }),
  createVehicle: (data) => api.post('/vehicles', data, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  updateVehicle: (id, data) => api.put(`/vehicles/${id}`, data, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  deleteVehicle: (id) => api.delete(`/vehicles/${id}`),

  // Tour Guides
  getAllTourGuides: (params) => api.get('/tour-guides', { params }),
  getTourGuideById: (id) => api.get(`/tour-guides/${id}`),
  getTourGuidesBySpecialization: (specialization) => api.get(`/tour-guides/specialization/${specialization}`),
  getTopRatedTourGuides: (limit = 5) => api.get('/tour-guides/top-rated', { params: { limit } }),
  createTourGuide: (data) => api.post('/tour-guides', data),
  updateTourGuide: (id, data) => api.put(`/tour-guides/${id}`, data),
  deleteTourGuide: (id) => api.delete(`/tour-guides/${id}`),
  updateTourGuideRating: (id, rating) => api.put(`/tour-guides/${id}/rating`, { rating }),

  // Payments
  createPayment: (data) => api.post('/payments', data),
  getPaymentById: (id) => api.get(`/payments/${id}`),
  getPaymentsByBookingId: (bookingId) => api.get(`/payments/booking/${bookingId}`),
  getMyPayments: (params) => api.get('/payments/my-payments', { params }),
  uploadPaymentProof: (file) => {
    const formData = new FormData();
    formData.append('payment_proof', file);
    return api.post('/payments/upload-proof', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Authentication
  login: (email, password) => api.post('/auth/login', { email, password }),
  adminLogin: (email, password) => api.post('/auth/admin/login', { email, password }),
  register: (name, email, password, phone) => api.post('/auth/register', { name, email, password, phone }),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (currentPassword, newPassword) => api.put('/auth/change-password', { current_password: currentPassword, new_password: newPassword }),

  // Admin
  getAdminDashboard: (params) => api.get('/admin/dashboard', { params }),
  getAdminBookings: (params) => api.get('/admin/bookings', { params }),
  getAdminPayments: (params) => api.get('/admin/payments', { params }),
  verifyPayment: (id, status, adminNotes) => api.put(`/admin/payments/${id}/verify`, { status, admin_notes: adminNotes }),
  deletePayment: (id) => api.delete(`/payments/${id}`),
  getPaymentProof: (id) => api.get(`/payments/${id}/proof`, { responseType: 'blob' }),
  getAdminCustomers: (params) => api.get('/admin/customers', { params }),
  getAdminSmartTrips: (params) => api.get('/admin/smart-trips', { params }),
  updateSmartTripStatus: (id, status) => api.put(`/admin/smart-trips/${id}/status`, { status }),
  getAnalytics: (params) => api.get('/admin/analytics', { params }),
  getAdminPackages: (params) => api.get('/admin/packages', { params }),
  createAdminPackage: (data) => api.post('/admin/packages', data),
  updateAdminPackage: (id, data) => api.put(`/admin/packages/${id}`, data),
  deleteAdminPackage: (id) => api.delete(`/admin/packages/${id}`),
  suggestPackagePlaces: (cityId) => api.get('/admin/packages/suggest-places', { params: { city_id: cityId } }),

  // Activity Logs
  getAdminActivityLogs: (params) => api.get('/admin/activity-logs', { params }),
  getActivityLogFilters: () => api.get('/admin/activity-logs/filters'),

  // Notifications
  getNotifications: (params) => api.get('/notifications', { params }),
  getNotificationsUnreadCount: () => api.get('/notifications/unread-count'),
  markNotificationAsRead: (id) => api.put(`/notifications/${id}/read`),
  adminSendNotification: (data) => api.post('/notifications/admin-send', data),

  // Health check
  healthCheck: () => api.get('/health'),
};

export { apiService };
export default apiService;

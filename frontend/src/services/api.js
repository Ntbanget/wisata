import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add any request modifications here
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
          // Unauthorized - handle token refresh or logout
          console.error('Unauthorized access');
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
export const apiService = {
  // Cities
  getCities: () => api.get('/cities'),
  getCityById: (id) => api.get(`/cities/${id}`),
  getCityWithStats: (id) => api.get(`/cities/${id}/stats`),

  // Packages
  generatePackages: (params) => api.get('/packages', { params }),
  calculateCustomPackage: (data) => api.post('/packages/custom', data),
  validatePackage: (data) => api.post('/packages/validate', data),
  getBudgetBreakdown: (budget) => api.get('/packages/budget-breakdown', { params: { budget } }),

  // Bookings
  createBooking: (data) => api.post('/booking', data),
  getBookingById: (id) => api.get(`/booking/${id}`),
  getAllBookings: (params) => api.get('/booking', { params }),
  getBookingsByEmail: (email, params) => api.get('/booking/email', { params: { email, ...params } }),
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

  // Health check
  healthCheck: () => api.get('/health'),
};

export default api;

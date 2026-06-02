const Booking = require('../models/Booking');
const User = require('../models/User');
const Payment = require('../models/Payment');
const Vehicle = require('../models/Vehicle');
const TourGuide = require('../models/TourGuide');

class AdminController {
  // Get dashboard statistics
  static async getDashboardStats(req, res) {
    try {
      const { start_date, end_date } = req.query;

      // Get booking statistics
      const bookingStats = await Booking.getStats(null, start_date, end_date);
      
      // Get payment statistics
      const paymentStats = await Payment.getStats(start_date, end_date);
      
      // Get user statistics
      const userStats = await User.getStats();

      // Get recent bookings
      const recentBookings = await Booking.getAll(1, 10);
      
      // Get pending payments
      const pendingPayments = await Payment.getByStatus('waiting_verification', 1, 10);

      res.json({
        success: true,
        data: {
          bookings: bookingStats,
          payments: paymentStats,
          users: userStats,
          recent_bookings: recentBookings.bookings,
          pending_payments: pendingPayments.payments
        }
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch dashboard statistics',
        message: error.message
      });
    }
  }

  // Get all bookings for admin
  static async getAllBookings(req, res) {
    try {
      const { page = 1, limit = 20, status } = req.query;
      
      const result = await Booking.getAll(parseInt(page), parseInt(limit), status);

      res.json({
        success: true,
        data: result.bookings,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Error fetching bookings:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch bookings',
        message: error.message
      });
    }
  }

  // Update booking status (admin)
  static async updateBookingStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, admin_notes } = req.body;

      const updatedBooking = await Booking.updateStatus(id, status);

      if (admin_notes) {
        await Booking.update(id, { admin_notes });
      }

      res.json({
        success: true,
        data: updatedBooking,
        message: 'Booking status updated successfully'
      });
    } catch (error) {
      console.error('Error updating booking status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update booking status',
        message: error.message
      });
    }
  }

  // Get all payments for admin
  static async getAllPayments(req, res) {
    try {
      const { page = 1, limit = 20, status } = req.query;
      
      if (status) {
        const result = await Payment.getByStatus(status, parseInt(page), parseInt(limit));
        res.json({
          success: true,
          data: result.payments,
          pagination: result.pagination
        });
      } else {
        // Get all payments (need to implement this in Payment model)
        res.json({
          success: true,
          data: [],
          pagination: { page, limit, total: 0, totalPages: 0 }
        });
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch payments',
        message: error.message
      });
    }
  }

  // Verify payment (admin)
  static async verifyPayment(req, res) {
    try {
      const { id } = req.params;
      const { status, admin_notes } = req.body;

      const payment = await Payment.getById(id);
      if (!payment) {
        return res.status(404).json({
          success: false,
          error: 'Payment not found'
        });
      }

      // Update payment status
      const updatedPayment = await Payment.updateStatus(id, status, req.user.id);

      // Update booking payment status
      await Booking.updatePaymentStatus(payment.booking_id, status, admin_notes);

      // Update booking status based on payment status
      if (status === 'paid') {
        await Booking.updateStatus(payment.booking_id, 'confirmed');
      } else if (status === 'rejected') {
        await Booking.updateStatus(payment.booking_id, 'pending');
      }

      res.json({
        success: true,
        data: updatedPayment,
        message: 'Payment verified successfully'
      });
    } catch (error) {
      console.error('Error verifying payment:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to verify payment',
        message: error.message
      });
    }
  }

  // Get all users for admin
  static async getAllCustomers(req, res) {
    try {
      const { page = 1, limit = 20, role } = req.query;

      const result = await User.getAll(parseInt(page), parseInt(limit), role);

      // Remove passwords from response
      const usersWithoutPasswords = result.users.map(user => {
        const { password_hash, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });

      res.json({
        success: true,
        data: usersWithoutPasswords,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch users',
        message: error.message
      });
    }
  }

  // Get all vehicles for admin
  static async getAllVehicles(req, res) {
    try {
      const vehicles = await Vehicle.getAll();

      res.json({
        success: true,
        data: vehicles,
        count: vehicles.length
      });
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch vehicles',
        message: error.message
      });
    }
  }

  // Get all tour guides for admin
  static async getAllTourGuides(req, res) {
    try {
      const guides = await TourGuide.getAll();

      res.json({
        success: true,
        data: guides,
        count: guides.length
      });
    } catch (error) {
      console.error('Error fetching tour guides:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch tour guides',
        message: error.message
      });
    }
  }

  // Get analytics data
  static async getAnalytics(req, res) {
    try {
      const { start_date, end_date, period = 'daily' } = req.query;

      // Get booking statistics
      const bookingStats = await Booking.getStats(null, start_date, end_date);
      
      // Get payment statistics
      const paymentStats = await Payment.getStats(start_date, end_date);

      // Get user statistics
      const userStats = await User.getStats();

      // Get popular destinations
      const popularDestinations = await Booking.getPopularDestinations(10);

      // Get popular hotels
      const popularHotels = await Booking.getPopularHotels(10);

      res.json({
        success: true,
        data: {
          bookings: bookingStats,
          payments: paymentStats,
          users: userStats,
          popular_destinations: popularDestinations,
          popular_hotels: popularHotels
        }
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch analytics',
        message: error.message
      });
    }
  }
}

module.exports = AdminController;
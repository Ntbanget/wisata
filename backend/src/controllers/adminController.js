const Booking = require('../models/Booking');
const User = require('../models/User');
const Payment = require('../models/Payment');
const Vehicle = require('../models/Vehicle');
const TourGuide = require('../models/TourGuide');
const TouristPlace = require('../models/TouristPlace');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');
const Package = require('../models/Package');
const PackageGenerator = require('../utils/packageGenerator');
const { logActivity } = require('../helpers/activityLogger');

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
      const pendingPayments = await Payment.getByStatus('pending', 1, 10);

      res.json({
        success: true,
        data: {
          total_bookings: bookingStats.total_bookings || 0,
          total_revenue: bookingStats.total_revenue || 0,
          total_customers: (userStats.users || 0) + (userStats.customers || 0),
          pending_payments: paymentStats.pending || 0,
          bookings: bookingStats,
          payments: paymentStats,
          users: userStats,
          recent_bookings: recentBookings.bookings,
          pending_payments_list: pendingPayments.payments
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

      // Log activity
      try {
        await logActivity(
          req.user.id,
          req.user.name,
          'UPDATE_BOOKING_STATUS',
          'BOOKING',
          parseInt(id),
          `Updated booking status to ${status} for booking ID ${id}`
        );
      } catch (logError) {
        console.error('Activity log error:', logError);
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

      console.log("=== ADMIN PAYMENTS QUERY === status:", status, "page:", page, "limit:", limit);

      if (status) {
        const result = await Payment.getByStatus(status, parseInt(page), parseInt(limit));
        console.log("=== ADMIN PAYMENTS RAW ===", result);
        console.log("=== PAYMENTS RESULT === count:", result.payments?.length);
        res.json({
          success: true,
          data: result.payments,
          pagination: result.pagination
        });
      } else {
        // Get all payments
        const result = await Payment.getAll(parseInt(page), parseInt(limit));
        console.log("=== ADMIN PAYMENTS RAW ===", result);
        console.log("=== PAYMENTS RESULT === count:", result.payments?.length);
        res.json({
          success: true,
          data: result.payments,
          pagination: result.pagination
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

      const paymentStatus = Payment.normalizeStatus(status);
      if (!paymentStatus) {
        return res.status(400).json({
          success: false,
          error: 'Invalid payment status',
          message: 'Status must be one of: pending, approved, rejected, paid'
        });
      }

      // Update payment status
      const updatedPayment = await Payment.updateStatus(id, paymentStatus, req.user.id);

      // Update booking payment status
      console.log("=== UPDATING BOOKING PAYMENT STATUS ===");
      console.log("booking_id:", payment.booking_id);
      console.log("paymentStatus:", paymentStatus);
      console.log("adminNotes:", admin_notes);
      await Booking.updatePaymentStatus(payment.booking_id, paymentStatus, admin_notes);

      // Update booking status based on payment status
      if (paymentStatus === 'paid') {
        await Booking.updateStatus(payment.booking_id, 'CONFIRMED');
        try {
          const booking = await Booking.getById(payment.booking_id);
          if (booking && booking.user_id) {
            await Notification.create({
              user_id: booking.user_id,
              booking_id: booking.id,
              title: 'Pembayaran Diterima',
              message: `Pembayaran Anda untuk Booking #${booking.id} telah diterima dan booking telah dikonfirmasi. Admin akan menghubungi Anda melalui fitur pesan.`,
              type: 'payment_approved',
              created_by: 'SYSTEM'
            });
          }
        } catch (notifErr) {
          console.error('Failed to create payment_approved notification:', notifErr);
        }
      } else if (paymentStatus === 'rejected') {
        await Booking.updateStatus(payment.booking_id, 'PAYMENT_REJECTED');
        try {
          const booking = await Booking.getById(payment.booking_id);
          if (booking && booking.user_id) {
            await Notification.create({
              user_id: booking.user_id,
              booking_id: booking.id,
              title: 'Pembayaran Ditolak',
              message: 'Pembayaran Anda ditolak. Silakan upload ulang bukti transfer atau hubungi admin.',
              type: 'payment_rejected',
              created_by: 'SYSTEM'
            });
          }
        } catch (notifErr) {
          console.error('Failed to create payment_rejected notification:', notifErr);
        }
      }

      // Log activity
      try {
        const actionType = paymentStatus === 'paid' ? 'APPROVE_PAYMENT' : 'REJECT_PAYMENT';
        await logActivity(
          req.user.id,
          req.user.name,
          actionType,
          'PAYMENT',
          parseInt(id),
          `${paymentStatus === 'paid' ? 'Approved' : 'Rejected'} payment with ID ${id} for booking ${payment.booking_id}`
        );
      } catch (logError) {
        console.error('Activity log error:', logError);
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

      console.log("=== ADMIN CUSTOMERS QUERY === role:", role, "page:", page, "limit:", limit);

      const result = await User.getAll(parseInt(page), parseInt(limit), role);

      console.log("=== CUSTOMERS RESULT === count:", result.users?.length);

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

  // Get customer by ID with details
  static async getCustomerById(req, res) {
    try {
      const { id } = req.params;
      const customer = await User.getById(id);

      if (!customer) {
        return res.status(404).json({
          success: false,
          error: 'Customer not found'
        });
      }

      // Get customer bookings
      const bookings = await Booking.getByUserId(id);

      // Remove password from response
      const { password_hash, ...customerWithoutPassword } = customer;

      res.json({
        success: true,
        data: {
          customer: customerWithoutPassword,
          bookings: bookings || []
        }
      });
    } catch (error) {
      console.error('Error fetching customer:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch customer',
        message: error.message
      });
    }
  }

  // Create customer
  static async createCustomer(req, res) {
    try {
      const { name, email, password, phone, role = 'customer' } = req.body;

      // Validate input
      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields',
          message: 'Name, email, and password are required'
        });
      }

      // Check if user already exists
      const existingUser = await User.getByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'User already exists',
          message: 'An account with this email already exists'
        });
      }

      // Hash password
      const bcrypt = require('bcryptjs');
      const password_hash = await bcrypt.hash(password, 10);

      // Create user
      const userId = await User.create({
        name,
        email,
        password_hash,
        phone,
        role
      });

      // Log activity
      try {
        await logActivity(
          req.user.id,
          req.user.name,
          'CREATE_CUSTOMER',
          'USER',
          userId,
          `Created new customer: ${name} (${email})`
        );
      } catch (logError) {
        console.error('Activity log error:', logError);
      }

      const user = await User.getById(userId);
      const { password_hash: _, ...userWithoutPassword } = user;

      res.status(201).json({
        success: true,
        message: 'Customer created successfully',
        data: userWithoutPassword
      });
    } catch (error) {
      console.error('Error creating customer:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create customer',
        message: error.message
      });
    }
  }

  // Update customer
  static async updateCustomer(req, res) {
    try {
      const { id } = req.params;
      const { name, email, phone, role, is_active } = req.body;

      const existingCustomer = await User.getById(id);
      if (!existingCustomer) {
        return res.status(404).json({
          success: false,
          error: 'Customer not found'
        });
      }

      // Prevent self-update via admin panel
      if (parseInt(id) === req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'Access denied: You cannot update your own account via admin panel. Use profile settings instead.'
        });
      }

      // Only super admin can change role to admin
      if (role === 'admin' && existingCustomer.role !== 'admin') {
        if (req.user.email !== 'admin@wisata.test') {
          return res.status(403).json({
            success: false,
            error: 'Forbidden',
            message: 'Access denied: Only super admin can change user role to admin'
          });
        }
      }

      // If changing email, check if new email already exists
      if (email && email !== existingCustomer.email) {
        const emailExists = await User.getByEmail(email);
        if (emailExists) {
          return res.status(409).json({
            success: false,
            error: 'Email already exists',
            message: 'An account with this email already exists'
          });
        }
      }

      // Build update data
      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (email !== undefined) updateData.email = email;
      if (phone !== undefined) updateData.phone = phone;
      if (role !== undefined) updateData.role = role;
      if (is_active !== undefined) updateData.is_active = is_active;

      const updatedCustomer = await User.update(id, updateData);

      // Log activity
      try {
        await logActivity(
          req.user.id,
          req.user.name,
          'UPDATE_CUSTOMER',
          'USER',
          parseInt(id),
          `Updated customer: ${existingCustomer.name} (${existingCustomer.email})`
        );
      } catch (logError) {
        console.error('Activity log error:', logError);
      }

      const { password_hash, ...customerWithoutPassword } = updatedCustomer;

      res.json({
        success: true,
        message: 'Customer updated successfully',
        data: customerWithoutPassword
      });
    } catch (error) {
      console.error('Error updating customer:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update customer',
        message: error.message
      });
    }
  }

  static async getAdminPackages(req, res) {
    try {
      const { status } = req.query;
      const packages = await Package.getAllByAdmin(status);

      res.json({
        success: true,
        data: packages
      });
    } catch (error) {
      console.error('Error fetching admin packages:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch admin packages',
        message: error.message
      });
    }
  }

  static async createAdminPackage(req, res) {
    try {
      const {
        city_id,
        hotel_id,
        tourist_place_ids,
        name,
        budget,
        people_count,
        nights,
        status
      } = req.body;

      if (!city_id || !name || !budget || !people_count || !nights) {
        return res.status(400).json({
          success: false,
          error: 'city_id, name, budget, people_count, and nights are required'
        });
      }

      const packageData = {
        city_id: parseInt(city_id),
        hotel_id: hotel_id ? parseInt(hotel_id) : null,
        tourist_place_ids: Array.isArray(tourist_place_ids) ? tourist_place_ids.map((id) => parseInt(id)) : [],
        name,
        budget: parseFloat(budget),
        people_count: parseInt(people_count),
        nights: parseInt(nights),
        status: status === 'published' ? 'published' : 'draft',
        created_by: req.user?.id || null,
        total_estimated_cost: parseFloat(budget),
        preferences: {},
        generated_itinerary: null
      };

      const createdPackage = await Package.create(packageData);

      try {
        await logActivity(
          req.user?.id || null,
          req.user?.name || 'Admin',
          'CREATE_PACKAGE',
          'PACKAGE',
          createdPackage?.id || null,
          `Created package "${name}" for city ${city_id}`
        );
      } catch (logError) {
        console.error('Activity log error:', logError);
      }

      res.json({
        success: true,
        data: createdPackage,
        message: 'Package created successfully'
      });
    } catch (error) {
      console.error('Error creating admin package:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create admin package',
        message: error.message
      });
    }
  }

  static async updateAdminPackage(req, res) {
    try {
      const { id } = req.params;
      const updateData = {
        city_id: req.body.city_id !== undefined ? parseInt(req.body.city_id) : undefined,
        hotel_id: req.body.hotel_id !== undefined ? (req.body.hotel_id ? parseInt(req.body.hotel_id) : null) : undefined,
        tourist_place_ids: req.body.tourist_place_ids !== undefined ? req.body.tourist_place_ids.map((id) => parseInt(id)) : undefined,
        name: req.body.name,
        budget: req.body.budget !== undefined ? parseFloat(req.body.budget) : undefined,
        people_count: req.body.people_count !== undefined ? parseInt(req.body.people_count) : undefined,
        nights: req.body.nights !== undefined ? parseInt(req.body.nights) : undefined,
        status: req.body.status,
        total_estimated_cost: req.body.total_estimated_cost !== undefined ? parseFloat(req.body.total_estimated_cost) : undefined,
        generated_itinerary: req.body.generated_itinerary,
        preferences: req.body.preferences,
        created_by: req.user?.id || undefined
      };

      const updatedPackage = await Package.update(id, updateData);
      if (!updatedPackage) {
        return res.status(404).json({ success: false, error: 'Package not found' });
      }

      res.json({
        success: true,
        data: updatedPackage,
        message: 'Package updated successfully'
      });
    } catch (error) {
      console.error('Error updating admin package:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update admin package',
        message: error.message
      });
    }
  }

  static async deleteAdminPackage(req, res) {
    try {
      const { id } = req.params;
      await Package.delete(id);

      res.json({
        success: true,
        message: 'Package deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting admin package:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete admin package',
        message: error.message
      });
    }
  }

  static async suggestPlaces(req, res) {
    try {
      const { city_id } = req.query;
      if (!city_id) {
        return res.status(400).json({
          success: false,
          error: 'city_id is required'
        });
      }

      const cityId = parseInt(city_id);
      const places = await TouristPlace.getByCity(cityId);
      const ranked = PackageGenerator.rankPlacesByPopularity(places);
      const suggested = ranked.map((place, index) => ({
        ...place,
        suggestion_rank: index + 1,
        suggestion_score: Math.max(100 - index * 5, 10)
      }));

      res.json({
        success: true,
        data: suggested
      });
    } catch (error) {
      console.error('Error fetching suggested places:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch suggested places',
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

  // Get activity logs
  static async getActivityLogs(req, res) {
    try {
      const { page = 1, limit = 20, action_type, admin_id, start_date, end_date } = req.query;

      const result = await ActivityLog.getAll(
        parseInt(page),
        parseInt(limit),
        action_type,
        admin_id ? parseInt(admin_id) : null,
        start_date,
        end_date
      );

      res.json({
        success: true,
        data: result.logs,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch activity logs',
        message: error.message
      });
    }
  }

  // Get activity log filters
  static async getActivityLogFilters(req, res) {
    try {
      const actionTypes = await ActivityLog.getActionTypes();
      const admins = await ActivityLog.getAdmins();

      res.json({
        success: true,
        data: {
          actionTypes,
          admins
        }
      });
    } catch (error) {
      console.error('Error fetching activity log filters:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch activity log filters',
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
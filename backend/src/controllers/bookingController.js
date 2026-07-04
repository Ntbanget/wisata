const Booking = require('../models/Booking');
const validator = require('validator');

class BookingController {
  // Create new booking
  static async createBooking(req, res) {
    try {
      console.log('=== POST /api/booking ===');
      console.log('SQL: INSERT INTO bookings (user_name, email, city_id, total_price, budget, hotel_id, ...)');
      console.log('=== BOOKING REQUEST RECEIVED ===');
      console.log('Full req.body:', req.body);
      console.log('is_custom:', req.body.is_custom);
      console.log('vehicle_mode:', req.body.vehicle_mode);
      console.log('custom_vehicles:', req.body.custom_vehicles);
      console.log('tourist_places:', req.body.tourist_places);
      console.log('vehicle_id:', req.body.vehicle_id);
      console.log('guide_id:', req.body.guide_id);

      const {
        user_name,
        email,
        city_id,
        total_price,
        budget,
        hotel_id,
        tourist_places,
        vehicle_id,
        guide_id,
        payment_method,
        payment_proof,
        trip_date,
        nights,
        total_rooms,
        people_count,
        vehicle_mode,
        custom_vehicles
      } = req.body;

      // Validate required fields
      if (!user_name || !email || !city_id || !total_price || !budget || !hotel_id) {
        console.log('❌ VALIDATION ERROR: Missing required fields');
        console.log('user_name:', user_name);
        console.log('email:', email);
        console.log('city_id:', city_id);
        console.log('total_price:', total_price);
        console.log('budget:', budget);
        console.log('hotel_id:', hotel_id);
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: user_name, email, city_id, total_price, budget, hotel_id'
        });
      }

      // Validate user_name
      if (user_name.trim().length === 0 || user_name.length > 200) {
        return res.status(400).json({
          success: false,
          error: 'User name must be between 1 and 200 characters'
        });
      }

      // Validate email
      if (!validator.isEmail(email)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid email address'
        });
      }

      // VALIDATION: If payment proof is provided, user MUST exist or be authenticated
      // This prevents orphaned bookings without payment records
      if (payment_proof && !req.user && !email) {
        return res.status(400).json({
          success: false,
          error: 'Payment proof requires authentication. Please login or provide a valid email.'
        });
      }

      // Validate city_id
      if (!validator.isInt(String(city_id), { min: 1 })) {
        return res.status(400).json({
          success: false,
          error: 'Invalid city_id'
        });
      }

      // Validate prices
      const totalPriceNum = parseFloat(total_price);
      const budgetNum = parseFloat(budget);

      // TEMPORARY LOGGING FOR BUG INVESTIGATION
      console.log({
        booking_type: req.body.booking_type,
        budget: req.body.budget,
        total_price: req.body.total_price,
        package_id: req.body.package_id,
        is_custom: req.body.is_custom,
        body: req.body
      });

      if (!validator.isFloat(String(total_price), { min: 0 }) || !validator.isFloat(String(budget), { min: 0 })) {
        return res.status(400).json({
          success: false,
          error: 'Prices must be positive numbers'
        });
      }

      // Only apply budget validation for package bookings (not custom bookings)
      const isCustom = req.body.is_custom === true || req.body.is_custom === 'true';
      if (!isCustom && totalPriceNum > budgetNum) {
        return res.status(400).json({
          success: false,
          error: 'Total price cannot exceed budget'
        });
      }

      // Validate hotel_id
      if (!validator.isInt(String(hotel_id), { min: 1 })) {
        return res.status(400).json({
          success: false,
          error: 'Invalid hotel_id'
        });
      }

      // Validate tourist_places
      let touristPlacesArray = [];
      if (tourist_places) {
        console.log('=== TOURIST PLACES VALIDATION START ===');
        console.log('tourist_places type:', typeof tourist_places);
        console.log('tourist_places value:', JSON.stringify(tourist_places));

        if (!Array.isArray(tourist_places)) {
          console.log('❌ VALIDATION ERROR: tourist_places must be an array, got:', typeof tourist_places);
          return res.status(400).json({
            success: false,
            error: 'tourist_places must be an array'
          });
        }

        touristPlacesArray = tourist_places.filter((place, index) => {
          console.log(`  Checking place[${index}]:`, JSON.stringify(place));
          console.log(`  place[${index}].id:`, place?.id);
          console.log(`  place[${index}].ticket_price:`, place?.ticket_price);

          if (!place) {
            console.log(`  ❌ place[${index}] is null/undefined`);
            return false;
          }

          if (!place.id) {
            console.log(`  ❌ place[${index}].id is null/undefined`);
            return false;
          }

          if (!place.ticket_price) {
            console.log(`  ❌ place[${index}].ticket_price is null/undefined`);
            return false;
          }

          const isValidId = validator.isInt(String(place.id), { min: 1 });
          const isValidPrice = validator.isFloat(String(place.ticket_price), { min: 0 });

          console.log(`  place[${index}] valid:`, isValidId && isValidPrice);
          return isValidId && isValidPrice;
        });

        console.log('tourist_places validation:');
        console.log('  Input count:', tourist_places.length);
        console.log('  Valid count:', touristPlacesArray.length);
        console.log('  Filtered out:', tourist_places.length - touristPlacesArray.length);

        if (touristPlacesArray.length === 0) {
          console.log('❌ VALIDATION ERROR: No valid tourist places found');
          return res.status(400).json({
            success: false,
            error: 'At least one valid tourist place is required'
          });
        }
      }

      // Validate vehicle_id if provided
      if (vehicle_id && !validator.isInt(String(vehicle_id), { min: 1 })) {
        return res.status(400).json({
          success: false,
          error: 'Invalid vehicle_id'
        });
      }

      // Validate guide_id if provided
      if (guide_id && !validator.isInt(String(guide_id), { min: 1 })) {
        return res.status(400).json({
          success: false,
          error: 'Invalid guide_id'
        });
      }

      // Validate vehicle_mode if provided
      if (vehicle_mode && !['automatic', 'custom'].includes(vehicle_mode)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid vehicle_mode. Must be automatic or custom'
        });
      }

      // Validate custom_vehicles if provided
      let customVehiclesArray = [];
      if (custom_vehicles) {
        console.log('custom_vehicles validation:');
        console.log('  Type:', typeof custom_vehicles);
        console.log('  Value:', custom_vehicles);

        if (typeof custom_vehicles !== 'object') {
          console.log('❌ VALIDATION ERROR: custom_vehicles must be an object');
          return res.status(400).json({
            success: false,
            error: 'custom_vehicles must be an object'
          });
        }

        // Convert custom_vehicles object to array format
        customVehiclesArray = Object.entries(custom_vehicles).map(([vehicleId, quantity]) => ({
          vehicle_id: parseInt(vehicleId),
          quantity: parseInt(quantity)
        })).filter(cv => cv.quantity > 0);

        console.log('  Converted to array:', customVehiclesArray);
      }

      // Create booking data with PENDING_PAYMENT status
      const bookingData = {
        user_name: user_name.trim(),
        email: email.trim().toLowerCase(),
        city_id: parseInt(city_id),
        total_price: totalPriceNum,
        budget: budgetNum,
        hotel_id: parseInt(hotel_id),
        hotel_price: totalPriceNum - touristPlacesArray.reduce((sum, place) => sum + place.ticket_price, 0),
        tourist_places: touristPlacesArray,
        user_id: req.user ? req.user.id : null,
        vehicle_id: vehicle_id ? parseInt(vehicle_id) : null,
        guide_id: guide_id ? parseInt(guide_id) : null,
        payment_method: payment_method || null,
        payment_proof: payment_proof || null,
        trip_date: trip_date || null,
        nights: nights ? parseInt(nights) : 1,
        total_rooms: total_rooms ? parseInt(total_rooms) : null,
        people_count: people_count ? parseInt(people_count) : 1,
        vehicle_mode: vehicle_mode || 'automatic',
        custom_vehicles: customVehiclesArray.length > 0 ? customVehiclesArray : null,
        status: 'PENDING_PAYMENT' // Set initial status to PENDING_PAYMENT
      };

      // Create booking
      const newBooking = await Booking.create(bookingData);

      console.log("=== BOOKING CREATED SUCCESSFULLY ===");
      console.log("newBooking:", JSON.stringify(newBooking, null, 2));
      console.log("newBooking type:", typeof newBooking);
      console.log("newBooking is null:", newBooking === null);

      res.status(201).json({
        success: true,
        data: newBooking,
        message: 'Booking created successfully'
      });
    } catch (err) {
      console.error("===== CREATE BOOKING CRASH =====");
      console.error(err);
      console.error(err.stack);

      // Return proper error response instead of throwing
      return res.status(400).json({
        success: false,
        error: err.message || 'Failed to create booking'
      });
    }
  }

  // Get booking by ID
  static async getBookingById(req, res) {
    try {
      const { id } = req.params;
      
      if (!validator.isInt(id, { min: 1 })) {
        return res.status(400).json({
          success: false,
          error: 'Invalid booking ID'
        });
      }

      const booking = await Booking.getById(id);
      
      if (!booking) {
        return res.status(404).json({
          success: false,
          error: 'Booking not found'
        });
      }

      res.json({
        success: true,
        data: booking
      });
    } catch (error) {
      console.error('Error fetching booking:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch booking',
        message: error.message
      });
    }
  }

  // Get all bookings (with pagination)
  static async getAllBookings(req, res) {
    try {
      const { page = 1, limit = 20, status } = req.query;
      
      // Validate pagination parameters
      const pageNum = validator.isInt(page, { min: 1 }) ? parseInt(page) : 1;
      const limitNum = validator.isInt(limit, { min: 1, max: 100 }) ? parseInt(limit) : 20;
      
      // Validate status
      let statusFilter = null;
      if (status) {
        const validStatuses = ['PENDING_PAYMENT', 'CONFIRMED', 'PAYMENT_REJECTED', 'CANCELLED'];
        if (validStatuses.includes(status)) {
          statusFilter = status;
        } else {
          return res.status(400).json({
            success: false,
            error: 'Invalid status. Must be: PENDING_PAYMENT, CONFIRMED, PAYMENT_REJECTED, or CANCELLED'
          });
        }
      }

      const result = await Booking.getAll(pageNum, limitNum, statusFilter);

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

  // Get bookings by user email
  static async getBookingsByEmail(req, res) {
    try {
      const { email } = req.query;
      const { page = 1, limit = 10 } = req.query;

      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'Email is required'
        });
      }

      if (!validator.isEmail(email)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid email address'
        });
      }

      // Validate pagination parameters
      const pageNum = validator.isInt(String(page), { min: 1 }) ? parseInt(page) : 1;
      const limitNum = validator.isInt(String(limit), { min: 1, max: 50 }) ? parseInt(limit) : 10;

      const result = await Booking.getByEmail(email.trim().toLowerCase(), pageNum, limitNum);

      res.json({
        success: true,
        data: result.bookings,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Error fetching bookings by email:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch bookings',
        message: error.message
      });
    }
  }

  // Update booking status
  static async updateBookingStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!validator.isInt(id, { min: 1 })) {
        return res.status(400).json({
          success: false,
          error: 'Invalid booking ID'
        });
      }

      const validStatuses = ['PENDING_PAYMENT', 'CONFIRMED', 'PAYMENT_REJECTED', 'CANCELLED'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid status. Must be: PENDING_PAYMENT, CONFIRMED, PAYMENT_REJECTED, or CANCELLED'
        });
      }

      const updatedBooking = await Booking.updateStatus(parseInt(id), status);
      
      if (!updatedBooking) {
        return res.status(404).json({
          success: false,
          error: 'Booking not found'
        });
      }

      res.json({
        success: true,
        data: updatedBooking,
        message: `Booking status updated to ${status}`
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

  // Cancel booking
  static async cancelBooking(req, res) {
    try {
      const { id } = req.params;
      
      if (!validator.isInt(id, { min: 1 })) {
        return res.status(400).json({
          success: false,
          error: 'Invalid booking ID'
        });
      }

      const cancelledBooking = await Booking.cancel(parseInt(id));
      
      if (!cancelledBooking) {
        return res.status(404).json({
          success: false,
          error: 'Booking not found'
        });
      }

      res.json({
        success: true,
        data: cancelledBooking,
        message: 'Booking cancelled successfully'
      });
    } catch (error) {
      console.error('Error cancelling booking:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to cancel booking',
        message: error.message
      });
    }
  }

  // Confirm booking
  static async confirmBooking(req, res) {
    try {
      const { id } = req.params;
      
      if (!validator.isInt(id, { min: 1 })) {
        return res.status(400).json({
          success: false,
          error: 'Invalid booking ID'
        });
      }

      const confirmedBooking = await Booking.confirm(parseInt(id));
      
      if (!confirmedBooking) {
        return res.status(404).json({
          success: false,
          error: 'Booking not found'
        });
      }

      res.json({
        success: true,
        data: confirmedBooking,
        message: 'Booking confirmed successfully'
      });
    } catch (error) {
      console.error('Error confirming booking:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to confirm booking',
        message: error.message
      });
    }
  }

  // Get booking statistics
  static async getBookingStats(req, res) {
    try {
      const { city_id, start_date, end_date } = req.query;
      
      // Validate city_id if provided
      let cityFilter = null;
      if (city_id) {
        if (validator.isInt(city_id, { min: 1 })) {
          cityFilter = parseInt(city_id);
        } else {
          return res.status(400).json({
            success: false,
            error: 'Invalid city_id'
          });
        }
      }

      // Validate dates if provided
      let startDate = null;
      let endDate = null;
      
      if (start_date) {
        if (validator.isDate(start_date)) {
          startDate = new Date(start_date);
        } else {
          return res.status(400).json({
            success: false,
            error: 'Invalid start_date format'
          });
        }
      }
      
      if (end_date) {
        if (validator.isDate(end_date)) {
          endDate = new Date(end_date);
        } else {
          return res.status(400).json({
            success: false,
            error: 'Invalid end_date format'
          });
        }
      }

      const stats = await Booking.getStats(cityFilter, startDate, endDate);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error fetching booking stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch booking statistics',
        message: error.message
      });
    }
  }

  // Get popular destinations
  static async getPopularDestinations(req, res) {
    try {
      const { limit = 10 } = req.query;
      
      const limitNum = validator.isInt(limit, { min: 1, max: 50 }) ? parseInt(limit) : 10;
      
      const destinations = await Booking.getPopularDestinations(limitNum);

      res.json({
        success: true,
        data: destinations,
        count: destinations.length
      });
    } catch (error) {
      console.error('Error fetching popular destinations:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch popular destinations',
        message: error.message
      });
    }
  }

  // Delete booking (admin only)
  static async deleteBooking(req, res) {
    try {
      const { id } = req.params;
      
      if (!validator.isInt(id, { min: 1 })) {
        return res.status(400).json({
          success: false,
          error: 'Invalid booking ID'
        });
      }

      const deleted = await Booking.delete(parseInt(id));
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: 'Booking not found'
        });
      }

      res.json({
        success: true,
        message: 'Booking deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting booking:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete booking',
        message: error.message
      });
    }
  }
}

module.exports = BookingController;

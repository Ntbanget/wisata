const Booking = require('../models/Booking');
const validator = require('validator');

class BookingController {
  // Create new booking
  static async createBooking(req, res) {
    try {
      const {
        user_name,
        email,
        city_id,
        total_price,
        budget,
        hotel_id,
        tourist_places
      } = req.body;

      // Validate required fields
      if (!user_name || !email || !city_id || !total_price || !budget || !hotel_id) {
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

      if (!validator.isFloat(String(total_price), { min: 0 }) || !validator.isFloat(String(budget), { min: 0 })) {
        return res.status(400).json({
          success: false,
          error: 'Prices must be positive numbers'
        });
      }

      if (totalPriceNum > budgetNum) {
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
        if (!Array.isArray(tourist_places)) {
          return res.status(400).json({
            success: false,
            error: 'tourist_places must be an array'
          });
        }

        touristPlacesArray = tourist_places.filter(place => 
          place && 
          validator.isInt(String(place.id), { min: 1}) && 
          validator.isFloat(String(place.ticket_price), { min: 0 })
        );

        if (touristPlacesArray.length === 0) {
          return res.status(400).json({
            success: false,
            error: 'At least one valid tourist place is required'
          });
        }
      }

      // Create booking data
      const bookingData = {
        user_name: user_name.trim(),
        email: email.trim().toLowerCase(),
        city_id: parseInt(city_id),
        total_price: totalPriceNum,
        budget: budgetNum,
        hotel_id: parseInt(hotel_id),
        hotel_price: totalPriceNum - touristPlacesArray.reduce((sum, place) => sum + place.ticket_price, 0),
        tourist_places: touristPlacesArray
      };

      // Create booking
      const newBooking = await Booking.create(bookingData);

      res.status(201).json({
        success: true,
        data: newBooking,
        message: 'Booking created successfully'
      });
    } catch (error) {
      console.error('Error creating booking:', error);
      
      if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({
          success: false,
          error: 'Invalid reference: city, hotel, or tourist place not found'
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Failed to create booking',
        message: error.message
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
        const validStatuses = ['pending', 'confirmed', 'cancelled'];
        if (validStatuses.includes(status)) {
          statusFilter = status;
        } else {
          return res.status(400).json({
            success: false,
            error: 'Invalid status. Must be: pending, confirmed, or cancelled'
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
      const pageNum = validator.isInt(page, { min: 1 }) ? parseInt(page) : 1;
      const limitNum = validator.isInt(limit, { min: 1, max: 50 }) ? parseInt(limit) : 10;

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

      const validStatuses = ['pending', 'confirmed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid status. Must be: pending, confirmed, or cancelled'
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

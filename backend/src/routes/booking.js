const express = require('express');
const BookingController = require('../controllers/bookingController');

const router = express.Router();

// POST /api/booking - Create new booking
router.post('/', BookingController.createBooking);

// GET /api/booking - Get all bookings (with pagination)
router.get('/', BookingController.getAllBookings);

// GET /api/booking/email - Get bookings by user email
router.get('/email', BookingController.getBookingsByEmail);

// GET /api/booking/stats - Get booking statistics
router.get('/stats', BookingController.getBookingStats);

// GET /api/booking/popular - Get popular destinations
router.get('/popular', BookingController.getPopularDestinations);

// GET /api/booking/:id - Get booking by ID
router.get('/:id', BookingController.getBookingById);

// PUT /api/booking/:id/status - Update booking status
router.put('/:id/status', BookingController.updateBookingStatus);

// PUT /api/booking/:id/cancel - Cancel booking
router.put('/:id/cancel', BookingController.cancelBooking);

// PUT /api/booking/:id/confirm - Confirm booking
router.put('/:id/confirm', BookingController.confirmBooking);

// DELETE /api/booking/:id - Delete booking (admin only)
router.delete('/:id', BookingController.deleteBooking);

module.exports = router;

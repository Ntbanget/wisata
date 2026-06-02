const express = require('express');
const BookingController = require('../controllers/bookingController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { adminOnly } = require('../middleware/role');

const router = express.Router();

// POST /api/booking - Create new booking (REQUIRES AUTHENTICATION)
// Users must be logged in to create booking
router.post('/', authenticate, BookingController.createBooking);

// GET /api/booking - Get all bookings (admin only)
router.get('/', authenticate, adminOnly, BookingController.getAllBookings);

// GET /api/booking/email - Get bookings by user email (public for now, will be deprecated)
router.get('/email', BookingController.getBookingsByEmail);

// GET /api/booking/stats - Get booking statistics (admin only)
router.get('/stats', authenticate, adminOnly, BookingController.getBookingStats);

// GET /api/booking/popular - Get popular destinations (public)
router.get('/popular', BookingController.getPopularDestinations);

// GET /api/booking/:id - Get booking by ID (public for now)
router.get('/:id', BookingController.getBookingById);

// PUT /api/booking/:id/status - Update booking status (admin only)
router.put('/:id/status', authenticate, adminOnly, BookingController.updateBookingStatus);

// PUT /api/booking/:id/cancel - Cancel booking (requires authentication)
router.put('/:id/cancel', authenticate, BookingController.cancelBooking);

// PUT /api/booking/:id/confirm - Confirm booking (admin only)
router.put('/:id/confirm', authenticate, adminOnly, BookingController.confirmBooking);

// DELETE /api/booking/:id - Delete booking (admin only)
router.delete('/:id', authenticate, adminOnly, BookingController.deleteBooking);

module.exports = router;

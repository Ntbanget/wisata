const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const { authenticate, authenticateAdmin } = require('../middleware/auth');
const { adminOnly } = require('../middleware/role');

// CRITICAL: All admin routes require BOTH authenticateAdmin AND adminOnly
// authenticateAdmin = validates token + checks role is admin
// adminOnly = additional role check as safety net

// Dashboard
router.get('/dashboard', authenticateAdmin, adminOnly, AdminController.getDashboardStats);

// Bookings
router.get('/bookings', authenticateAdmin, adminOnly, AdminController.getAllBookings);
router.put('/bookings/:id/status', authenticateAdmin, adminOnly, AdminController.updateBookingStatus);

// Payments
router.get('/payments', authenticateAdmin, adminOnly, AdminController.getAllPayments);
router.put('/payments/:id/verify', authenticateAdmin, adminOnly, AdminController.verifyPayment);

// Users
router.get('/customers', authenticateAdmin, adminOnly, AdminController.getAllCustomers);

// Vehicles
router.get('/vehicles', authenticateAdmin, adminOnly, AdminController.getAllVehicles);

// Tour Guides
router.get('/tour-guides', authenticateAdmin, adminOnly, AdminController.getAllTourGuides);

// Analytics
router.get('/analytics', authenticateAdmin, adminOnly, AdminController.getAnalytics);

module.exports = router;
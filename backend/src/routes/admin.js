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

// Package management
router.get('/packages', authenticateAdmin, adminOnly, AdminController.getAdminPackages);
router.post('/packages', authenticateAdmin, adminOnly, AdminController.createAdminPackage);
router.put('/packages/:id', authenticateAdmin, adminOnly, AdminController.updateAdminPackage);
router.delete('/packages/:id', authenticateAdmin, adminOnly, AdminController.deleteAdminPackage);
router.get('/packages/suggest-places', authenticateAdmin, adminOnly, AdminController.suggestPlaces);

// Activity Logs
router.get('/activity-logs', authenticateAdmin, adminOnly, AdminController.getActivityLogs);
router.get('/activity-logs/filters', authenticateAdmin, adminOnly, AdminController.getActivityLogFilters);

module.exports = router;
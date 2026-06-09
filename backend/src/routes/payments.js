// Payment routes
const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');
const { adminOnly } = require('../middleware/role');
const upload = require('../middleware/upload');

// Protected routes - USER MUST BE AUTHENTICATED
router.post('/', authenticate, PaymentController.createPayment);
router.get('/my-payments', authenticate, PaymentController.getMyPayments);
router.post('/upload-proof', authenticate, upload.single('payment_proof'), PaymentController.uploadPaymentProof);

// Protected routes (read-only) - requires authentication
router.get('/booking/:bookingId', authenticate, PaymentController.getPaymentsByBookingId);
router.get('/:id', authenticate, PaymentController.getPaymentById);

// Admin routes
router.get('/stats', authenticate, adminOnly, PaymentController.getPaymentStats);
router.get('/status/:status', authenticate, adminOnly, PaymentController.getPaymentsByStatus);
router.put('/:id/status', authenticate, adminOnly, PaymentController.updatePaymentStatus);
router.delete('/:id', authenticate, adminOnly, PaymentController.deletePayment);

module.exports = router;
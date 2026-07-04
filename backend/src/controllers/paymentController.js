const path = require('path');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');

class PaymentController {
  // Create new payment
  static async createPayment(req, res) {
    try {
      const { booking_id, amount, payment_method, proof_image } = req.body;

      // Validate input
      if (!booking_id || !amount || !payment_method) {
        return res.status(400).json({
          error: 'Missing required fields',
          message: 'Booking ID, amount, and payment method are required'
        });
      }

      // CRITICAL: Verify that user owns this booking
      const booking = await Booking.getById(booking_id);
      if (!booking) {
        return res.status(404).json({
          error: 'Booking not found',
          message: 'Cannot create payment for non-existent booking'
        });
      }

      // Check ownership - either user owns the booking or is admin
      const userId = req.user.id;
      const isAdmin = req.user.role === 'admin';
      const isOwner = booking.user_id === userId;

      if (!isAdmin && !isOwner) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'You can only create payments for your own bookings'
        });
      }

      const paymentId = await Payment.create({
        booking_id,
        user_id: req.user.id,
        amount,
        payment_method,
        proof_image,
        status: 'pending'
      });

      const payment = await Payment.getById(paymentId);

      res.status(201).json({
        success: true,
        message: 'Payment created successfully',
        data: payment
      });
    } catch (error) {
      console.error('Create payment error:', error);
      res.status(500).json({
        error: 'Failed to create payment',
        message: error.message
      });
    }
  }

  // Get payment by ID
  static async getPaymentById(req, res) {
    try {
      const { id } = req.params;
      const payment = await Payment.getById(id);

      if (!payment) {
        return res.status(404).json({
          error: 'Payment not found'
        });
      }

      // Check if user has access to this payment
      if (req.user && req.user.role !== 'admin' && payment.user_id !== req.user.id) {
        return res.status(403).json({
          error: 'Access denied'
        });
      }

      res.json({
        success: true,
        data: payment
      });
    } catch (error) {
      console.error('Get payment error:', error);
      res.status(500).json({
        error: 'Failed to fetch payment',
        message: error.message
      });
    }
  }

  // Get payment proof image for admin
  static async getPaymentProof(req, res) {
    try {
      const { id } = req.params;
      const payment = await Payment.getById(id);

      if (!payment) {
        return res.status(404).json({
          error: 'Payment not found'
        });
      }

      if (!payment.proof_image) {
        return res.status(404).json({
          error: 'Payment proof not found'
        });
      }

      const proofFile = payment.proof_image.replace(/^\//, '');
      const proofPath = path.resolve(__dirname, '../../', proofFile);

      res.sendFile(proofPath, (err) => {
        if (err) {
          console.error('Error sending proof file:', err);
          if (!res.headersSent) {
            res.status(404).json({
              error: 'Unable to send payment proof file'
            });
          }
        }
      });
    } catch (error) {
      console.error('Get payment proof error:', error);
      res.status(500).json({
        error: 'Failed to fetch payment proof',
        message: error.message
      });
    }
  }

  // Get payments by booking ID
  static async getPaymentsByBookingId(req, res) {
    try {
      const { bookingId } = req.params;
      const payments = await Payment.getByBookingId(bookingId);

      res.json({
        success: true,
        data: payments
      });
    } catch (error) {
      console.error('Get payments by booking error:', error);
      res.status(500).json({
        error: 'Failed to fetch payments',
        message: error.message
      });
    }
  }

  // Get my payments (authenticated user)
  static async getMyPayments(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 20 } = req.query;

      const result = await Payment.getByUserId(userId, parseInt(page), parseInt(limit));

      res.json({
        success: true,
        data: result.payments,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Get my payments error:', error);
      res.status(500).json({
        error: 'Failed to fetch payments',
        message: error.message
      });
    }
  }

  // Upload payment proof
  static async uploadPaymentProof(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: 'No file uploaded',
          message: 'Please upload a payment proof file'
        });
      }

      const fileUrl = `/uploads/payments/${req.file.filename}`;

      res.json({
        success: true,
        message: 'Payment proof uploaded successfully',
        file_url: fileUrl
      });
    } catch (error) {
      console.error('Upload payment proof error:', error);
      try {
        if (req.user && req.user.id) {
          await Notification.create({
            user_id: req.user.id,
            title: 'Upload Bukti Pembayaran Gagal',
            message: 'Terjadi kesalahan saat mengunggah bukti pembayaran. Silakan coba kembali.',
            type: 'payment_failed',
            created_by: 'SYSTEM'
          });
        }
      } catch (notifErr) {
        console.error('Failed to create upload failure notification:', notifErr);
      }
      res.status(500).json({
        error: 'Failed to upload payment proof',
        message: error.message
      });
    }
  }

  // Update payment status (admin only)
  static async updatePaymentStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, admin_notes } = req.body;
      const adminNotes = admin_notes || null;

      const paymentStatus = Payment.normalizeStatus(status);
      if (!paymentStatus) {
        return res.status(400).json({
          error: 'Invalid status',
          message: 'Status must be one of: pending, approved, rejected, paid'
        });
      }

      const updatedPayment = await Payment.updateStatus(id, paymentStatus, req.user.id);

      // Update booking status based on payment status
      if (updatedPayment) {
        const booking = await Booking.getById(updatedPayment.booking_id);
        if (booking) {
          if (paymentStatus === 'paid') {
            await Booking.updateStatus(updatedPayment.booking_id, 'CONFIRMED');
            await Booking.updatePaymentStatus(updatedPayment.booking_id, 'paid', adminNotes);
          } else if (paymentStatus === 'rejected') {
            await Booking.updateStatus(updatedPayment.booking_id, 'PAYMENT_REJECTED');
            await Booking.updatePaymentStatus(updatedPayment.booking_id, 'rejected', adminNotes);
          }
        }
      }

      res.json({
        success: true,
        message: 'Payment status updated successfully',
        data: updatedPayment
      });
    } catch (error) {
      console.error('Update payment status error:', error);
      res.status(500).json({
        error: 'Failed to update payment status',
        message: error.message
      });
    }
  }

  // Get payment statistics (admin only)
  static async getPaymentStats(req, res) {
    try {
      const { start_date, end_date } = req.query;
      const stats = await Payment.getStats(start_date, end_date);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get payment stats error:', error);
      res.status(500).json({
        error: 'Failed to fetch payment statistics',
        message: error.message
      });
    }
  }

  // Get payments by status (admin only)
  static async getPaymentsByStatus(req, res) {
    try {
      const { status } = req.params;
      const { page = 1, limit = 20 } = req.query;

      const result = await Payment.getByStatus(status, parseInt(page), parseInt(limit));

      res.json({
        success: true,
        data: result.payments,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Get payments by status error:', error);
      res.status(500).json({
        error: 'Failed to fetch payments',
        message: error.message
      });
    }
  }

  // Delete payment (admin only)
  static async deletePayment(req, res) {
    try {
      const { id } = req.params;
      await Payment.delete(id);

      res.json({
        success: true,
        message: 'Payment deleted successfully'
      });
    } catch (error) {
      console.error('Delete payment error:', error);
      res.status(500).json({
        error: 'Failed to delete payment',
        message: error.message
      });
    }
  }
}

module.exports = PaymentController;
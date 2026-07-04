const { query } = require('../src/models/database');
const Booking = require('../src/models/Booking');
const Payment = require('../src/models/Payment');
const Notification = require('../src/models/Notification');

(async function expireBookings() {
  try {
    console.log('Checking for bookings older than 24 hours with no payment or proof...');

    const rows = await query(
      `SELECT id FROM bookings WHERE status = 'PENDING_PAYMENT' AND created_at <= DATE_SUB(NOW(), INTERVAL 24 HOUR)`
    );

    if (!rows || rows.length === 0) {
      console.log('No bookings to expire.');
      process.exit(0);
    }

    for (const r of rows) {
      const bookingId = r.id;
      const booking = await Booking.getById(bookingId);
      if (!booking) continue;

      const payments = await Payment.getByBookingId(bookingId);

      // If any payment has proof_image, skip expiration
      const hasProof = Array.isArray(payments) && payments.some(p => p.proof_image && p.proof_image.trim() !== '');
      if (hasProof) {
        console.log(`Booking ${bookingId} has payment proof; skipping.`);
        continue;
      }

      // If there are payments but none have proof, or no payments at all -> expire
      console.log(`Expiring booking ${bookingId} (no proof found).`);
      await Booking.updateStatus(bookingId, 'EXPIRED');

      try {
        if (booking.user_id) {
          await Notification.create({
            user_id: booking.user_id,
            booking_id: bookingId,
            title: 'Booking Kadaluarsa',
            message: 'Booking otomatis dibatalkan karena tidak ada pembayaran dalam waktu 24 jam.',
            type: 'booking_expired',
            created_by: 'SYSTEM'
          });
        }
      } catch (notifErr) {
        console.error('Failed to create booking_expired notification for', bookingId, notifErr);
      }
    }

    console.log('Expire job completed.');
    process.exit(0);
  } catch (error) {
    console.error('Expire bookings job failed:', error);
    process.exit(1);
  }
})();

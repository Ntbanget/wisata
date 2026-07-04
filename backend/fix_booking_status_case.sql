-- Fix booking status case inconsistency
-- This script updates the status column definition to ensure uppercase values

-- Update existing lowercase statuses to uppercase
UPDATE bookings SET status = 'PENDING_PAYMENT' WHERE status = 'pending_payment';
UPDATE bookings SET status = 'CONFIRMED' WHERE status = 'confirmed';
UPDATE bookings SET status = 'CANCELLED' WHERE status = 'cancelled';

-- Note: If the status column has an ENUM constraint, you may need to modify it:
-- ALTER TABLE bookings MODIFY COLUMN status ENUM('PENDING_PAYMENT', 'CONFIRMED', 'CANCELLED') NOT NULL;

-- Display summary
SELECT 'Booking status case fixed' AS message;
SELECT status, COUNT(*) as count FROM bookings GROUP BY status;

-- Migration for Priority Features Implementation
-- 1. Hotel room capacity
-- 2. Booking status PENDING_PAYMENT
-- 3. Payments table

USE wisata_db;

-- Add room_capacity column to hotels table if it doesn't exist
SET @add_room_capacity = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE table_schema = 'wisata_db' AND table_name = 'hotels' AND column_name = 'room_capacity') = 0,
  'ALTER TABLE hotels ADD COLUMN room_capacity INT DEFAULT 2 AFTER price_per_night',
  'SELECT ''room_capacity column already exists'' as message'
));

PREPARE stmt FROM @add_room_capacity;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Update booking status enum to include PENDING_PAYMENT
SET @modify_booking_status = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE table_schema = 'wisata_db' AND table_name = 'bookings' AND column_name = 'status' AND COLUMN_TYPE LIKE '%pending%') > 0
   AND (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE table_schema = 'wisata_db' AND table_name = 'bookings' AND column_name = 'status' AND COLUMN_TYPE LIKE '%PENDING_PAYMENT%') = 0,
  'ALTER TABLE bookings MODIFY COLUMN status ENUM(''pending'', ''confirmed'', ''cancelled'', ''PENDING_PAYMENT'') DEFAULT ''pending''',
  'SELECT ''booking status already includes PENDING_PAYMENT or column structure different'' as message'
));

PREPARE stmt FROM @modify_booking_status;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Create payments table if it doesn't exist
SET @create_payments = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES
   WHERE table_schema = 'wisata_db' AND table_name = 'payments') = 0,
  'CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    user_id INT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_proof VARCHAR(500) NULL,
    payment_date TIMESTAMP NULL,
    status ENUM(''PENDING'', ''APPROVED'', ''REJECTED'') DEFAULT ''PENDING'',
    verified_by INT NULL,
    verified_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_booking_id (booking_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci',
  'SELECT ''payments table already exists'' as message'
));

PREPARE stmt FROM @create_payments;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Update existing hotels with default room_capacity of 2
SET @update_hotels = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE table_schema = 'wisata_db' AND table_name = 'hotels' AND column_name = 'room_capacity') > 0
   AND (SELECT COUNT(*) FROM hotels WHERE room_capacity IS NULL) > 0,
  'UPDATE hotels SET room_capacity = 2 WHERE room_capacity IS NULL',
  'SELECT ''No hotels need room_capacity update'' as message'
));

PREPARE stmt FROM @update_hotels;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT '=== PRIORITY FEATURES MIGRATION COMPLETED ===' as message;

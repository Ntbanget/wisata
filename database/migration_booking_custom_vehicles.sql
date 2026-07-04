-- Migration for Custom Vehicle Support in Bookings
-- This script adds support for custom vehicle selection in bookings

USE wisata_db;

-- Add missing columns to bookings table
-- Add user_id column if it doesn't exist
SET @add_user_id = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE table_schema = 'wisata_db' AND table_name = 'bookings' AND column_name = 'user_id') = 0,
  'ALTER TABLE bookings ADD COLUMN user_id INT NULL AFTER status',
  'SELECT ''user_id column already exists'' as message'
));

PREPARE stmt FROM @add_user_id;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add vehicle_id column if it doesn't exist
SET @add_vehicle_id = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE table_schema = 'wisata_db' AND table_name = 'bookings' AND column_name = 'vehicle_id') = 0,
  'ALTER TABLE bookings ADD COLUMN vehicle_id INT NULL AFTER user_id',
  'SELECT ''vehicle_id column already exists'' as message'
));

PREPARE stmt FROM @add_vehicle_id;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add guide_id column if it doesn't exist
SET @add_guide_id = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE table_schema = 'wisata_db' AND table_name = 'bookings' AND column_name = 'guide_id') = 0,
  'ALTER TABLE bookings ADD COLUMN guide_id INT NULL AFTER vehicle_id',
  'SELECT ''guide_id column already exists'' as message'
));

PREPARE stmt FROM @add_guide_id;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add payment_method column if it doesn't exist
SET @add_payment_method = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE table_schema = 'wisata_db' AND table_name = 'bookings' AND column_name = 'payment_method') = 0,
  'ALTER TABLE bookings ADD COLUMN payment_method VARCHAR(50) NULL AFTER guide_id',
  'SELECT ''payment_method column already exists'' as message'
));

PREPARE stmt FROM @add_payment_method;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add payment_status column if it doesn't exist
SET @add_payment_status = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE table_schema = 'wisata_db' AND table_name = 'bookings' AND column_name = 'payment_status') = 0,
  'ALTER TABLE bookings ADD COLUMN payment_status ENUM(''pending'', ''completed'', ''failed'') DEFAULT ''pending'' AFTER payment_method',
  'SELECT ''payment_status column already exists'' as message'
));

PREPARE stmt FROM @add_payment_status;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add payment_proof column if it doesn't exist
SET @add_payment_proof = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE table_schema = 'wisata_db' AND table_name = 'bookings' AND column_name = 'payment_proof') = 0,
  'ALTER TABLE bookings ADD COLUMN payment_proof VARCHAR(500) NULL AFTER payment_status',
  'SELECT ''payment_proof column already exists'' as message'
));

PREPARE stmt FROM @add_payment_proof;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add admin_notes column if it doesn't exist
SET @add_admin_notes = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE table_schema = 'wisata_db' AND table_name = 'bookings' AND column_name = 'admin_notes') = 0,
  'ALTER TABLE bookings ADD COLUMN admin_notes TEXT NULL AFTER payment_proof',
  'SELECT ''admin_notes column already exists'' as message'
));

PREPARE stmt FROM @add_admin_notes;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add trip_date column if it doesn't exist
SET @add_trip_date = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE table_schema = 'wisata_db' AND table_name = 'bookings' AND column_name = 'trip_date') = 0,
  'ALTER TABLE bookings ADD COLUMN trip_date DATE NULL AFTER admin_notes',
  'SELECT ''trip_date column already exists'' as message'
));

PREPARE stmt FROM @add_trip_date;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add nights column if it doesn't exist
SET @add_nights = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE table_schema = 'wisata_db' AND table_name = 'bookings' AND column_name = 'nights') = 0,
  'ALTER TABLE bookings ADD COLUMN nights INT DEFAULT 1 AFTER trip_date',
  'SELECT ''nights column already exists'' as message'
));

PREPARE stmt FROM @add_nights;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add total_rooms column if it doesn't exist
SET @add_total_rooms = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE table_schema = 'wisata_db' AND table_name = 'bookings' AND column_name = 'total_rooms') = 0,
  'ALTER TABLE bookings ADD COLUMN total_rooms INT NULL AFTER nights',
  'SELECT ''total_rooms column already exists'' as message'
));

PREPARE stmt FROM @add_total_rooms;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add people_count column if it doesn't exist
SET @add_people_count = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE table_schema = 'wisata_db' AND table_name = 'bookings' AND column_name = 'people_count') = 0,
  'ALTER TABLE bookings ADD COLUMN people_count INT DEFAULT 1 AFTER total_rooms',
  'SELECT ''people_count column already exists'' as message'
));

PREPARE stmt FROM @add_people_count;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add vehicle_mode column to bookings table if it doesn't exist
SET @add_vehicle_mode = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE table_schema = 'wisata_db' AND table_name = 'bookings' AND column_name = 'vehicle_mode') = 0,
  'ALTER TABLE bookings ADD COLUMN vehicle_mode ENUM(''automatic'', ''custom'') DEFAULT ''automatic'' AFTER people_count',
  'SELECT ''vehicle_mode column already exists'' as message'
));

PREPARE stmt FROM @add_vehicle_mode;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Create booking_vehicle_details table if it doesn't exist
SET @create_vehicle_details = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES
   WHERE table_schema = 'wisata_db' AND table_name = 'booking_vehicle_details') = 0,
  'CREATE TABLE booking_vehicle_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    vehicle_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    price_per_day DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE RESTRICT,
    INDEX idx_booking_id (booking_id),
    INDEX idx_vehicle_id (vehicle_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci',
  'SELECT ''booking_vehicle_details table already exists'' as message'
));

PREPARE stmt FROM @create_vehicle_details;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT '=== BOOKING CUSTOM VEHICLES MIGRATION COMPLETED ===' as message;

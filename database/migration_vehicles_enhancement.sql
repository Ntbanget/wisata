-- Migration for Vehicles Table Enhancement
-- This script ensures the vehicles table has the correct structure for custom vehicle selection

USE wisata_db;

-- Check if vehicles table exists
SET @vehicle_table_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES 
                           WHERE table_schema = 'wisata_db' AND table_name = 'vehicles');

-- If vehicles table doesn't exist, create it
SET @create_vehicles_sql = IF(@vehicle_table_exists = 0,
  'CREATE TABLE vehicles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category ENUM(''normal'', ''hiace'', ''elf'', ''bus'') NOT NULL,
    capacity INT NOT NULL COMMENT ''Maximum passenger capacity'',
    price_per_day DECIMAL(10,2) NOT NULL COMMENT ''Rental price per day in IDR'',
    image_url VARCHAR(500),
    description TEXT,
    available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_capacity (capacity),
    INDEX idx_price (price_per_day),
    INDEX idx_available (available)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci',
  'SELECT ''Vehicles table already exists'' as message'
);

PREPARE stmt FROM @create_vehicles_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add is_active column if it doesn't exist (for future use)
SET @add_is_active = IF(@vehicle_table_exists > 0,
  (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
     WHERE table_schema = 'wisata_db' AND table_name = 'vehicles' AND column_name = 'is_active') = 0,
    'ALTER TABLE vehicles ADD COLUMN is_active BOOLEAN DEFAULT TRUE AFTER available',
    'SELECT ''is_active column already exists'' as message'
  )),
  'SELECT ''Skipped - vehicles table does not exist'' as message'
);

PREPARE stmt FROM @add_is_active;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Insert sample vehicle data if table is empty
SET @vehicle_count = (SELECT COUNT(*) FROM vehicles);

SET @insert_sample_data = IF(@vehicle_count = 0,
  'INSERT INTO vehicles (name, category, capacity, price_per_day, image_url, description, available) VALUES
  (''Standard Car'', ''normal'', 4, 500000, ''/assets/vehicles/normal-car.jpg'', ''Standard car for up to 4 passengers'', TRUE),
  (''Luxury Car'', ''normal'', 4, 1000000, ''/assets/vehicles/luxury-car.jpg'', ''Luxury car for up to 4 passengers'', TRUE),
  (''Hiace Standard'', ''hiace'', 10, 1200000, ''/assets/vehicles/hiace-standard.jpg'', ''Standard Hiace for up to 10 passengers'', TRUE),
  (''Hiace Luxury'', ''hiace'', 10, 1800000, ''/assets/vehicles/hiace-luxury.jpg'', ''Luxury Hiace for up to 10 passengers'', TRUE),
  (''Elf Standard'', ''elf'', 18, 1700000, ''/assets/vehicles/elf-standard.jpg'', ''Standard Elf for up to 18 passengers'', TRUE),
  (''Elf Luxury'', ''elf'', 18, 2500000, ''/assets/vehicles/elf-luxury.jpg'', ''Luxury Elf for up to 18 passengers'', TRUE),
  (''Mini Bus'', ''bus'', 30, 3000000, ''/assets/vehicles/mini-bus.jpg'', ''Mini bus for up to 30 passengers'', TRUE),
  (''Big Bus'', ''bus'', 50, 5000000, ''/assets/vehicles/big-bus.jpg'', ''Big bus for up to 50 passengers'', TRUE)',
  'SELECT ''Sample data already exists'' as message'
);

PREPARE stmt FROM @insert_sample_data;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT '=== VEHICLES TABLE MIGRATION COMPLETED ===' as message;

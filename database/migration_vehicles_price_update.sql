-- Migration for Vehicle Price Update
-- This script updates vehicle data to match the requested prices

USE wisata_db;

-- Check if vehicles table exists
SET @table_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES 
                     WHERE table_schema = 'wisata_db' AND table_name = 'vehicles');

-- If table doesn't exist, create it first
SET @create_table_sql = IF(@table_exists = 0,
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
  'SELECT ''Table already exists'' as message'
);

PREPARE stmt FROM @create_table_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check if available column exists
SET @available_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                         WHERE table_schema = 'wisata_db' 
                         AND table_name = 'vehicles' 
                         AND column_name = 'available');

-- Delete all existing vehicles to avoid duplicates
DELETE FROM vehicles;

-- Insert the requested vehicles (with or without available column)
SET @insert_sql = IF(@available_exists > 0,
  'INSERT INTO vehicles (name, category, capacity, price_per_day, available) VALUES
  (''Mobil'', ''normal'', 4, 350000, TRUE),
  (''Hiace'', ''hiace'', 10, 900000, TRUE),
  (''Elf'', ''elf'', 18, 1200000, TRUE),
  (''Medium Bus'', ''bus'', 30, 2500000, TRUE),
  (''Big Bus'', ''bus'', 50, 3500000, TRUE)',
  'INSERT INTO vehicles (name, category, capacity, price_per_day) VALUES
  (''Mobil'', ''normal'', 4, 350000),
  (''Hiace'', ''hiace'', 10, 900000),
  (''Elf'', ''elf'', 18, 1200000),
  (''Medium Bus'', ''bus'', 30, 2500000),
  (''Big Bus'', ''bus'', 50, 3500000)'
);

PREPARE stmt FROM @insert_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Display updated vehicle data
SELECT * FROM vehicles;

SELECT '=== VEHICLE PRICE UPDATE COMPLETED ===' as message;

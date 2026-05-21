-- =====================================================
-- SAFE MIGRATION SCRIPT v2.0 - FIXED
-- Purpose: Safely upgrade existing database to Smart Trip Planner schema
-- Compatible with existing wisata_db database structure
-- This script handles schema mismatches properly
-- =====================================================

USE wisata_db;

-- =====================================================
-- STEP 1: Safe upgrade of cities table
-- =====================================================

-- Add columns to cities table if they don't exist
-- MySQL doesn't support IF NOT EXISTS for ALTER TABLE ADD COLUMN in all versions,
-- so we use a prepared statement approach or simple alter statements that won't fail if column exists

SET @dbname = DATABASE();
SET @tablename = 'cities';
SET @columnname = 'province';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
    (table_schema = @dbname)
    AND (table_name = @tablename)
    AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' VARCHAR(50) DEFAULT ''Jawa Tengah'' AFTER name')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add latitude column
SET @columnname = 'latitude';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
    (table_schema = @dbname)
    AND (table_name = @tablename)
    AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' DECIMAL(10, 8) AFTER province')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add longitude column
SET @columnname = 'longitude';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
    (table_schema = @dbname)
    AND (table_name = @tablename)
    AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' DECIMAL(11, 8) AFTER latitude')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add description column
SET @columnname = 'description';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
    (table_schema = @dbname)
    AND (table_name = @tablename)
    AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' TEXT AFTER longitude')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add image_url column
SET @columnname = 'image_url';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
    (table_schema = @dbname)
    AND (table_name = @tablename)
    AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' VARCHAR(500) AFTER description')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add is_active column
SET @columnname = 'is_active';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
    (table_schema = @dbname)
    AND (table_name = @tablename)
    AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' TINYINT(1) DEFAULT 1 AFTER image_url')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add updated_at column
SET @columnname = 'updated_at';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
    (table_schema = @dbname)
    AND (table_name = @tablename)
    AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER is_active')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add indexes to cities table (safe to run multiple times)
CREATE INDEX IF NOT EXISTS idx_province ON cities(province);
CREATE INDEX IF NOT EXISTS idx_active ON cities(is_active);

-- =====================================================
-- STEP 2: Update existing cities with coordinates and descriptions
-- =====================================================

-- Only update if latitude is NULL to preserve existing data
UPDATE cities SET 
    latitude = -6.9667,
    longitude = 110.4167,
    description = 'Ibu kota provinsi Jawa Tengah dengan wisata sejarah dan kuliner',
    province = 'Jawa Tengah'
WHERE name = 'Semarang' AND (latitude IS NULL OR latitude = 0);

UPDATE cities SET 
    latitude = -7.4900,
    longitude = 110.2167,
    description = 'Kota pendakian Borobudur dengan wisata alam dan sejarah',
    province = 'Jawa Tengah'
WHERE name = 'Magelang' AND (latitude IS NULL OR latitude = 0);

UPDATE cities SET 
    latitude = -7.3667,
    longitude = 109.9000,
    description = 'Gerbang menuju Dieng Plateau dengan wisata alam pegunungan',
    province = 'Jawa Tengah'
WHERE name = 'Wonosobo' AND (latitude IS NULL OR latitude = 0);

UPDATE cities SET 
    latitude = -6.5833,
    longitude = 110.6667,
    description = 'Kota ukir dan gerbang menuju Karimunjawa',
    province = 'Jawa Tengah'
WHERE name = 'Jepara' AND (latitude IS NULL OR latitude = 0);

UPDATE cities SET 
    latitude = -7.6000,
    longitude = 111.0000,
    description = 'Wisata alam dan sejarah di kaki Gunung Lawu',
    province = 'Jawa Tengah'
WHERE name = 'Karanganyar' AND (latitude IS NULL OR latitude = 0);

UPDATE cities SET 
    latitude = -7.4000,
    longitude = 109.2500,
    description = 'Wisata alam Baturraden dan kuliner khas Sunda',
    province = 'Jawa Tengah'
WHERE name = 'Banyumas' AND (latitude IS NULL OR latitude = 0);

UPDATE cities SET 
    latitude = -7.5617,
    longitude = 110.8319,
    description = 'Kota budaya Solo dengan keraton dan wisata heritage',
    province = 'Jawa Tengah'
WHERE name = 'Surakarta (Solo)' AND (latitude IS NULL OR latitude = 0);

UPDATE cities SET 
    latitude = -7.7167,
    longitude = 109.6500,
    description = 'Wisata alam pantai dan gua',
    province = 'Jawa Tengah'
WHERE name = 'Kebumen' AND (latitude IS NULL OR latitude = 0);

UPDATE cities SET 
    latitude = -7.7500,
    longitude = 110.6000,
    description = 'Wisata budaya dan pertanian',
    province = 'Jawa Tengah'
WHERE name = 'Klaten' AND (latitude IS NULL OR latitude = 0);

UPDATE cities SET 
    latitude = -7.7167,
    longitude = 109.9000,
    description = 'Wisata alam dan sejarah',
    province = 'Jawa Tengah'
WHERE name = 'Purworejo' AND (latitude IS NULL OR latitude = 0);

UPDATE cities SET 
    latitude = -7.7956,
    longitude = 110.3695,
    description = 'Kota budaya dan wisata populer dekat Jawa Tengah',
    province = 'DIY'
WHERE name = 'Yogyakarta' AND (latitude IS NULL OR latitude = 0);

UPDATE cities SET 
    latitude = -6.8889,
    longitude = 109.3750,
    description = 'Kota batik dengan wisata pantai',
    province = 'Jawa Tengah'
WHERE name = 'Pekalongan' AND (latitude IS NULL OR latitude = 0);

UPDATE cities SET 
    latitude = -7.0000,
    longitude = 110.1833,
    description = 'Wisata religi dan pantai utara',
    province = 'Jawa Tengah'
WHERE name = 'Kendal' AND (latitude IS NULL OR latitude = 0);

UPDATE cities SET 
    latitude = -6.8889,
    longitude = 109.3833,
    description = 'Wisata alam dan kuliner',
    province = 'Jawa Tengah'
WHERE name = 'Pemalang' AND (latitude IS NULL OR latitude = 0);

UPDATE cities SET 
    latitude = -7.3333,
    longitude = 110.5000,
    description = 'Wisata alam pegunungan dan edukasi',
    province = 'Jawa Tengah'
WHERE name = 'Salatiga' AND (latitude IS NULL OR latitude = 0);

-- =====================================================
-- STEP 3: Safe insert of new cities (using INSERT IGNORE)
-- =====================================================

-- Check if province column exists before inserting
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                  WHERE table_schema = @dbname AND table_name = 'cities' AND column_name = 'province');

-- Only run inserts if province column exists
SET @insert_sql = IF(@col_exists > 0,
  'INSERT IGNORE INTO cities (name, province, latitude, longitude, description, is_active) VALUES
  (''Semarang'', ''Jawa Tengah'', -6.9667, 110.4167, ''Ibu kota provinsi Jawa Tengah dengan wisata sejarah dan kuliner'', 1),
  (''Magelang'', ''Jawa Tengah'', -7.4900, 110.2167, ''Kota pendakian Borobudur dengan wisata alam dan sejarah'', 1),
  (''Wonosobo'', ''Jawa Tengah'', -7.3667, 109.9000, ''Gerbang menuju Dieng Plateau dengan wisata alam pegunungan'', 1),
  (''Jepara'', ''Jawa Tengah'', -6.5833, 110.6667, ''Kota ukir dan gerbang menuju Karimunjawa'', 1),
  (''Karanganyar'', ''Jawa Tengah'', -7.6000, 111.0000, ''Wisata alam dan sejarah di kaki Gunung Lawu'', 1),
  (''Banyumas'', ''Jawa Tengah'', -7.4000, 109.2500, ''Wisata alam Baturraden dan kuliner khas Sunda'', 1),
  (''Surakarta'', ''Jawa Tengah'', -7.5617, 110.8319, ''Kota budaya Solo dengan keraton dan wisata heritage'', 1),
  (''Kebumen'', ''Jawa Tengah'', -7.7167, 109.6500, ''Wisata alam pantai dan gua'', 1),
  (''Klaten'', ''Jawa Tengah'', -7.7500, 110.6000, ''Wisata budaya dan pertanian'', 1),
  (''Purworejo'', ''Jawa Tengah'', -7.7167, 109.9000, ''Wisata alam dan sejarah'', 1),
  (''Yogyakarta'', ''DIY'', -7.7956, 110.3695, ''Kota budaya dan wisata populer dekat Jawa Tengah'', 1),
  (''Pekalongan'', ''Jawa Tengah'', -6.8889, 109.3750, ''Kota batik dengan wisata pantai'', 1),
  (''Kendal'', ''Jawa Tengah'', -7.0000, 110.1833, ''Wisata religi dan pantai utara'', 1),
  (''Pemalang'', ''Jawa Tengah'', -6.8889, 109.3833, ''Wisata alam dan kuliner'', 1),
  (''Salatiga'', ''Jawa Tengah'', -7.3333, 110.5000, ''Wisata alam pegunungan dan edukasi'', 1)',
  'SELECT ''Skipped city inserts - province column not found'' as message'
);

PREPARE stmt FROM @insert_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- STEP 4: Ensure vehicles table uses correct structure
-- =====================================================

-- First, check if vehicles table exists and its structure
SET @vehicle_table_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES 
                           WHERE table_schema = @dbname AND table_name = 'vehicles');

-- If vehicles table doesn't exist, create it with the correct structure from vehicles_schema.sql
SET @create_vehicles_sql = IF(@vehicle_table_exists = 0,
  'CREATE TABLE vehicles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category ENUM(''regular_car'', ''luxury_car'', ''regular_minibus'', ''luxury_minibus'', ''tour_bus'') NOT NULL,
    capacity INT NOT NULL COMMENT ''Maximum passenger capacity'',
    price_per_day DECIMAL(10,2) NOT NULL COMMENT ''Rental price per day in IDR'',
    transmission ENUM(''manual'', ''automatic'') NOT NULL,
    air_conditioner BOOLEAN DEFAULT TRUE,
    image_url VARCHAR(500),
    description TEXT,
    features JSON COMMENT ''Additional features as JSON array'',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_capacity (capacity),
    INDEX idx_price (price_per_day),
    INDEX idx_active (is_active)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci',
  'SELECT ''Vehicles table already exists'' as message'
);

PREPARE stmt FROM @create_vehicles_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- STEP 5: Add missing columns to vehicles table if it exists
-- =====================================================

-- Only try to add columns if table exists
SET @add_fuel_type = IF(@vehicle_table_exists > 0,
  (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
     WHERE table_schema = @dbname AND table_name = 'vehicles' AND column_name = 'fuel_type') = 0,
    'ALTER TABLE vehicles ADD COLUMN fuel_type ENUM(''bensin'', ''diesel'') DEFAULT ''bensin'' AFTER transmission',
    'SELECT ''fuel_type column already exists'' as message'
  )),
  'SELECT ''Skipped - vehicles table does not exist'' as message'
);

PREPARE stmt FROM @add_fuel_type;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @add_rating = IF(@vehicle_table_exists > 0,
  (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
     WHERE table_schema = @dbname AND table_name = 'vehicles' AND column_name = 'rating') = 0,
    'ALTER TABLE vehicles ADD COLUMN rating DECIMAL(3, 2) DEFAULT 0.00 AFTER features',
    'SELECT ''rating column already exists'' as message'
  )),
  'SELECT ''Skipped - vehicles table does not exist'' as message'
);

PREPARE stmt FROM @add_rating;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @add_total_reviews = IF(@vehicle_table_exists > 0,
  (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
     WHERE table_schema = @dbname AND table_name = 'vehicles' AND column_name = 'total_reviews') = 0,
    'ALTER TABLE vehicles ADD COLUMN total_reviews INT DEFAULT 0 AFTER rating',
    'SELECT ''total_reviews column already exists'' as message'
  )),
  'SELECT ''Skipped - vehicles table does not exist'' as message'
);

PREPARE stmt FROM @add_total_reviews;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Handle air_conditioner vs has_ac column name difference
SET @fix_air_conditioner = IF(@vehicle_table_exists > 0,
  (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
     WHERE table_schema = @dbname AND table_name = 'vehicles' AND column_name = 'air_conditioner') > 0
    AND
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
     WHERE table_schema = @dbname AND table_name = 'vehicles' AND column_name = 'has_ac') = 0,
    'ALTER TABLE vehicles ADD COLUMN has_ac TINYINT(1) GENERATED ALWAYS AS (air_conditioner) VIRTUAL',
    'SELECT ''air_conditioner handling already done or not needed'' as message'
  )),
  'SELECT ''Skipped - vehicles table does not exist'' as message'
);

PREPARE stmt FROM @fix_air_conditioner;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- STEP 6: Create or update views based on actual schema
-- =====================================================

-- Drop existing views if they exist
DROP VIEW IF EXISTS v_active_vehicles;
DROP VIEW IF EXISTS v_active_destinations;
DROP VIEW IF EXISTS v_active_hotels;

-- Create vehicles view that adapts to actual schema
-- Check if the columns exist first, then create appropriate view
SET @has_fuel_type = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                     WHERE table_schema = @dbname AND table_name = 'vehicles' AND column_name = 'fuel_type');
SET @has_has_ac = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                   WHERE table_schema = @dbname AND table_name = 'vehicles' AND column_name = 'has_ac');
SET @has_rating = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                  WHERE table_schema = @dbname AND table_name = 'vehicles' AND column_name = 'rating');

SET @create_vehicle_view = CONCAT(
  'CREATE VIEW v_active_vehicles AS SELECT id, name, category, capacity, price_per_day, transmission',
  IF(@has_fuel_type > 0, ', fuel_type', ''),
  IF(@has_has_ac > 0, ', has_ac', ', air_conditioner as has_ac'),
  ', image_url',
  IF(@has_rating > 0, ', rating', ', NULL as rating'),
  ' FROM vehicles WHERE is_active = 1'
);

PREPARE stmt FROM @create_vehicle_view;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Create destinations view
SET @dest_has_rating = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                       WHERE table_schema = @dbname AND table_name = 'tourist_places' AND column_name = 'rating');
SET @dest_has_is_popular = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                           WHERE table_schema = @dbname AND table_name = 'tourist_places' AND column_name = 'is_popular');

SET @create_dest_view = CONCAT(
  'CREATE VIEW v_active_destinations AS SELECT tp.id, tp.name, tp.category, tp.description, tp.ticket_price, tp.lat as latitude, tp.lng as longitude, tp.image_url',
  IF(@dest_has_rating > 0, ', tp.rating', ', NULL as rating'),
  IF(@dest_has_is_popular > 0, ', tp.is_popular', ', 0 as is_popular'),
  ', c.name as city_name FROM tourist_places tp JOIN cities c ON tp.city_id = c.id WHERE c.is_active = 1'
);

PREPARE stmt FROM @create_dest_view;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Create hotels view  
SET @hotel_has_rating = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                        WHERE table_schema = @dbname AND table_name = 'hotels' AND column_name = 'rating');

SET @create_hotel_view = CONCAT(
  'CREATE VIEW v_active_hotels AS SELECT h.id, h.name, h.star_rating, h.category, h.price_per_night, h.lat as latitude, h.lng as longitude, h.image_url',
  IF(@hotel_has_rating > 0, ', h.rating', ', NULL as rating'),
  ', h.room_capacity, c.name as city_name FROM hotels h JOIN cities c ON h.city_id = c.id WHERE c.is_active = 1'
);

PREPARE stmt FROM @create_hotel_view;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- STEP 7: Create smart trip planner tables (if not exist)
-- =====================================================

-- Packages table
CREATE TABLE IF NOT EXISTS packages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL COMMENT 'NULL for anonymous users',
    city_id INT NOT NULL,
    name VARCHAR(200) NOT NULL,
    budget DECIMAL(12, 2) NOT NULL,
    people_count INT NOT NULL,
    nights INT NOT NULL,
    preferences JSON COMMENT 'User preferences for trip planning',
    generated_itinerary JSON COMMENT 'Complete itinerary with destinations, hotel, vehicle, schedule',
    total_estimated_cost DECIMAL(12, 2) NOT NULL,
    is_saved TINYINT(1) DEFAULT 0 COMMENT 'User saved this plan',
    is_booked TINYINT(1) DEFAULT 0 COMMENT 'This plan was booked',
    booking_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_city_id (city_id),
    INDEX idx_saved (is_saved),
    INDEX idx_booked (is_booked),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Itinerary templates table
CREATE TABLE IF NOT EXISTS itinerary_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    city_id INT NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    duration_hours INT NOT NULL,
    total_distance_km DECIMAL(8, 2),
    waypoints JSON COMMENT 'Ordered destinations with coordinates and timing',
    category_template ENUM('cultural', 'nature', 'adventure', 'family', 'mixed') DEFAULT 'mixed',
    difficulty_level ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
    min_people INT DEFAULT 1,
    max_people INT DEFAULT 10,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE,
    INDEX idx_city_id (city_id),
    INDEX idx_category (category_template),
    INDEX idx_difficulty (difficulty_level),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT '=== SAFE MIGRATION COMPLETED SUCCESSFULLY ===' as message;
SELECT 'Cities table has been safely upgraded' as step1;
SELECT 'Vehicles table structure has been normalized' as step2;
SELECT 'Views have been created to match actual schema' as step3;
SELECT 'Smart trip planner tables have been created' as step4;
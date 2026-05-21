-- =====================================================
-- Migration Script: Upgrade to Smart Trip Planner Schema v2.0
-- Purpose: Migrate existing database to support new smart trip planner features
-- Compatible with existing wisata_db database
-- =====================================================

USE wisata_db;

-- =====================================================
-- STEP 1: Alter existing tables to add new columns
-- =====================================================

-- Upgrade cities table
ALTER TABLE cities
ADD COLUMN IF NOT EXISTS province VARCHAR(50) DEFAULT 'Jawa Tengah' AFTER name,
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8) AFTER province,
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8) AFTER latitude,
ADD COLUMN IF NOT EXISTS description TEXT AFTER longitude,
ADD COLUMN IF NOT EXISTS image_url VARCHAR(500) AFTER description,
ADD COLUMN IF NOT EXISTS is_active TINYINT(1) DEFAULT 1 AFTER image_url,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER is_active;

-- Add indexes to cities table
ALTER TABLE cities ADD INDEX IF NOT EXISTS idx_province (province);
ALTER TABLE cities ADD INDEX IF NOT EXISTS idx_active (is_active);

-- =====================================================
-- STEP 2: Update existing cities with coordinates and descriptions
-- =====================================================

-- Update existing cities with coordinates and descriptions
UPDATE cities SET 
    latitude = -6.9667,
    longitude = 110.4167,
    description = 'Ibu kota provinsi Jawa Tengah dengan wisata sejarah dan kuliner',
    province = 'Jawa Tengah',
    is_active = 1
WHERE name = 'Semarang';

UPDATE cities SET 
    latitude = -7.4900,
    longitude = 110.2167,
    description = 'Kota pendakian Borobudur dengan wisata alam dan sejarah',
    province = 'Jawa Tengah',
    is_active = 1
WHERE name = 'Magelang';

UPDATE cities SET 
    latitude = -7.3667,
    longitude = 109.9000,
    description = 'Gerbang menuju Dieng Plateau dengan wisata alam pegunungan',
    province = 'Jawa Tengah',
    is_active = 1
WHERE name = 'Wonosobo';

UPDATE cities SET 
    latitude = -6.5833,
    longitude = 110.6667,
    description = 'Kota ukir dan gerbang menuju Karimunjawa',
    province = 'Jawa Tengah',
    is_active = 1
WHERE name = 'Jepara';

UPDATE cities SET 
    latitude = -7.6000,
    longitude = 111.0000,
    description = 'Wisata alam dan sejarah di kaki Gunung Lawu',
    province = 'Jawa Tengah',
    is_active = 1
WHERE name = 'Karanganyar';

UPDATE cities SET 
    latitude = -7.4000,
    longitude = 109.2500,
    description = 'Wisata alam Baturraden dan kuliner khas Sunda',
    province = 'Jawa Tengah',
    is_active = 1
WHERE name = 'Banyumas';

UPDATE cities SET 
    latitude = -7.5617,
    longitude = 110.8319,
    description = 'Kota budaya Solo dengan keraton dan wisata heritage',
    province = 'Jawa Tengah',
    is_active = 1
WHERE name = 'Surakarta (Solo)';

UPDATE cities SET 
    latitude = -7.7167,
    longitude = 109.6500,
    description = 'Wisata alam pantai dan gua',
    province = 'Jawa Tengah',
    is_active = 1
WHERE name = 'Kebumen';

UPDATE cities SET 
    latitude = -7.7500,
    longitude = 110.6000,
    description = 'Wisata budaya dan pertanian',
    province = 'Jawa Tengah',
    is_active = 1
WHERE name = 'Klaten';

UPDATE cities SET 
    latitude = -7.7167,
    longitude = 109.9000,
    description = 'Wisata alam dan sejarah',
    province = 'Jawa Tengah',
    is_active = 1
WHERE name = 'Purworejo';

UPDATE cities SET 
    latitude = -7.7956,
    longitude = 110.3695,
    description = 'Kota budaya dan wisata populer dekat Jawa Tengah',
    province = 'DIY',
    is_active = 1
WHERE name = 'Yogyakarta';

UPDATE cities SET 
    latitude = -6.8889,
    longitude = 109.3750,
    description = 'Kota batik dengan wisata pantai',
    province = 'Jawa Tengah',
    is_active = 1
WHERE name = 'Pekalongan';

UPDATE cities SET 
    latitude = -7.0000,
    longitude = 110.1833,
    description = 'Wisata religi dan pantai utara',
    province = 'Jawa Tengah',
    is_active = 1
WHERE name = 'Kendal';

UPDATE cities SET 
    latitude = -6.8889,
    longitude = 109.3833,
    description = 'Wisata alam dan kuliner',
    province = 'Jawa Tengah',
    is_active = 1
WHERE name = 'Pemalang';

UPDATE cities SET 
    latitude = -7.3333,
    longitude = 110.5000,
    description = 'Wisata alam pegunungan dan edukasi',
    province = 'Jawa Tengah',
    is_active = 1
WHERE name = 'Salatiga';

-- =====================================================
-- STEP 3: Insert new cities that don't exist yet
-- =====================================================

-- Insert cities that don't already exist (using IGNORE to skip duplicates)
INSERT IGNORE INTO cities (name, province, latitude, longitude, description, is_active) VALUES
('Semarang', 'Jawa Tengah', -6.9667, 110.4167, 'Ibu kota provinsi Jawa Tengah dengan wisata sejarah dan kuliner', 1),
('Magelang', 'Jawa Tengah', -7.4900, 110.2167, 'Kota pendakian Borobudur dengan wisata alam dan sejarah', 1),
('Wonosobo', 'Jawa Tengah', -7.3667, 109.9000, 'Gerbang menuju Dieng Plateau dengan wisata alam pegunungan', 1),
('Jepara', 'Jawa Tengah', -6.5833, 110.6667, 'Kota ukir dan gerbang menuju Karimunjawa', 1),
('Karanganyar', 'Jawa Tengah', -7.6000, 111.0000, 'Wisata alam dan sejarah di kaki Gunung Lawu', 1),
('Banyumas', 'Jawa Tengah', -7.4000, 109.2500, 'Wisata alam Baturraden dan kuliner khas Sunda', 1),
('Surakarta', 'Jawa Tengah', -7.5617, 110.8319, 'Kota budaya Solo dengan keraton dan wisata heritage', 1),
('Kebumen', 'Jawa Tengah', -7.7167, 109.6500, 'Wisata alam pantai dan gua', 1),
('Klaten', 'Jawa Tengah', -7.7500, 110.6000, 'Wisata budaya dan pertanian', 1),
('Purworejo', 'Jawa Tengah', -7.7167, 109.9000, 'Wisata alam dan sejarah', 1),
('Yogyakarta', 'DIY', -7.7956, 110.3695, 'Kota budaya dan wisata populer dekat Jawa Tengah', 1),
('Pekalongan', 'Jawa Tengah', -6.8889, 109.3750, 'Kota batik dengan wisata pantai', 1),
('Kendal', 'Jawa Tengah', -7.0000, 110.1833, 'Wisata religi dan pantai utara', 1),
('Pemalang', 'Jawa Tengah', -6.8889, 109.3833, 'Wisata alam dan kuliner', 1),
('Salatiga', 'Jawa Tengah', -7.3333, 110.5000, 'Wisata alam pegunungan dan edukasi', 1);

-- =====================================================
-- STEP 4: Upgrade tourist_places table to destinations
-- =====================================================

-- Rename tourist_places to destinations (optional) or add new columns to tourist_places
ALTER TABLE tourist_places
ADD COLUMN IF NOT EXISTS opening_hours TIME,
ADD COLUMN IF NOT EXISTS closing_hours TIME,
ADD COLUMN IF NOT EXISTS visit_duration INT DEFAULT 60 COMMENT 'Duration in minutes',
ADD COLUMN IF NOT EXISTS best_time_to_visit VARCHAR(100),
ADD COLUMN IF NOT EXISTS facilities JSON COMMENT 'Parking, toilet, mushola, restaurant, etc.',
ADD COLUMN IF NOT EXISTS accessibility JSON COMMENT 'Access info for vehicles',
ADD COLUMN IF NOT EXISTS rating DECIMAL(3, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS total_reviews INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_active TINYINT(1) DEFAULT 1,
ADD COLUMN IF NOT EXISTS is_popular TINYINT(1) DEFAULT 0,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;

-- Add indexes to tourist_places
ALTER TABLE tourist_places ADD INDEX IF NOT EXISTS idx_rating (rating);
ALTER TABLE tourist_places ADD INDEX IF NOT EXISTS idx_active (is_active);
ALTER TABLE tourist_places ADD INDEX IF NOT EXISTS idx_popular (is_popular);
ALTER TABLE tourist_places ADD INDEX IF NOT EXISTS idx_location (lat, lng);

-- =====================================================
-- STEP 5: Upgrade hotels table
-- =====================================================

ALTER TABLE hotels
ADD COLUMN IF NOT EXISTS star_rating TINYINT(1) COMMENT '1-5 stars' AFTER name,
ADD COLUMN IF NOT EXISTS amenities JSON COMMENT 'AC, WiFi, breakfast, pool, parking, etc.' AFTER image_url,
ADD COLUMN IF NOT EXISTS room_capacity INT DEFAULT 2 COMMENT 'Max persons per room' AFTER amenities,
ADD COLUMN IF NOT EXISTS total_rooms INT AFTER room_capacity,
ADD COLUMN IF NOT EXISTS check_in_time TIME DEFAULT '14:00:00' AFTER total_rooms,
ADD COLUMN IF NOT EXISTS check_out_time TIME DEFAULT '12:00:00' AFTER check_in_time,
ADD COLUMN IF NOT EXISTS minimum_nights INT DEFAULT 1 AFTER check_out_time,
ADD COLUMN IF NOT EXISTS rating DECIMAL(3, 2) DEFAULT 0.00 AFTER minimum_nights,
ADD COLUMN IF NOT EXISTS total_reviews INT DEFAULT 0 AFTER rating,
ADD COLUMN IF NOT EXISTS is_active TINYINT(1) DEFAULT 1 AFTER total_reviews,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER is_active,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL AFTER updated_at;

-- Add indexes to hotels
ALTER TABLE hotels ADD INDEX IF NOT EXISTS idx_rating (rating);
ALTER TABLE hotels ADD INDEX IF NOT EXISTS idx_active (is_active);

-- =====================================================
-- STEP 6: Create new tables for smart trip planner
-- =====================================================

-- Vehicles table (if not exists from previous schema)
CREATE TABLE IF NOT EXISTS vehicles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category ENUM('regular_car', 'luxury_car', 'minibus', 'luxury_minibus', 'tour_bus') NOT NULL,
    capacity INT NOT NULL COMMENT 'Maximum persons',
    price_per_day DECIMAL(12, 2) NOT NULL,
    transmission ENUM('manual', 'automatic') DEFAULT 'manual',
    fuel_type ENUM('bensin', 'diesel') DEFAULT 'bensin',
    has_ac TINYINT(1) DEFAULT 1,
    image_url VARCHAR(500),
    description TEXT,
    features JSON COMMENT 'Seat count, luggage capacity, etc.',
    rating DECIMAL(3, 2) DEFAULT 0.00,
    total_reviews INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    INDEX idx_category (category),
    INDEX idx_capacity (capacity),
    INDEX idx_price (price_per_day),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Packages table (Generated Trip Plans)
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

-- =====================================================
-- STEP 7: Create views for common queries
-- =====================================================

-- Drop existing views if they exist
DROP VIEW IF EXISTS v_active_destinations;
DROP VIEW IF EXISTS v_active_hotels;
DROP VIEW IF EXISTS v_active_vehicles;

-- Create view for active destinations with city name
CREATE OR REPLACE VIEW v_active_destinations AS
SELECT 
    tp.id,
    tp.name,
    tp.category,
    tp.description,
    tp.ticket_price,
    tp.lat as latitude,
    tp.lng as longitude,
    tp.image_url,
    tp.rating,
    tp.is_popular,
    c.name as city_name,
    c.province
FROM tourist_places tp
JOIN cities c ON tp.city_id = c.id
WHERE tp.is_active = 1 AND c.is_active = 1;

-- Create view for active hotels with city name
CREATE OR REPLACE VIEW v_active_hotels AS
SELECT 
    h.id,
    h.name,
    h.star_rating,
    h.category,
    h.price_per_night,
    h.lat as latitude,
    h.lng as longitude,
    h.image_url,
    h.rating,
    h.room_capacity,
    c.name as city_name,
    c.province
FROM hotels h
JOIN cities c ON h.city_id = c.id
WHERE h.is_active = 1 AND c.is_active = 1;

-- Create view for active vehicles
CREATE OR REPLACE VIEW v_active_vehicles AS
SELECT 
    id,
    name,
    category,
    capacity,
    price_per_day,
    transmission,
    fuel_type,
    has_ac,
    image_url,
    rating
FROM vehicles
WHERE is_active = 1;

-- =====================================================
-- STEP 8: Triggers for automatic updates
-- =====================================================

-- Note: Triggers will be added after reviews table is created in future migration

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

SELECT 'Migration to Smart Trip Planner Schema v2.0 completed successfully!' AS message;
SELECT 'Cities table has been upgraded with coordinates and descriptions' AS step1;
SELECT 'Tourist places and hotels have been enhanced with new columns' AS step2;
SELECT 'New tables for vehicles, packages, and itinerary templates have been created' AS step3;
SELECT 'Views for common queries have been created' AS step4;
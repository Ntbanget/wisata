-- =====================================================
-- Database Schema: Private Trip & Family Vacation Planner Jawa Tengah
-- Version: 2.0 - Smart Trip Planner Focus
-- Created: 2025-01-XX
-- Description: Comprehensive schema for travel planning system
-- =====================================================

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS wisata_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE wisata_db;

-- =====================================================
-- PHASE 1: SMART TRIP PLANNER (Priority Tables)
-- =====================================================

-- 1. CITIES TABLE (Master Data)
CREATE TABLE IF NOT EXISTS cities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    province VARCHAR(50) NOT NULL DEFAULT 'Jawa Tengah',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    description TEXT,
    image_url VARCHAR(500),
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_city_name (name),
    INDEX idx_province (province),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert cities data
INSERT INTO cities (name, province, latitude, longitude, description) VALUES
('Semarang', 'Jawa Tengah', -6.9667, 110.4167, 'Ibu kota provinsi Jawa Tengah dengan wisata sejarah dan kuliner'),
('Magelang', 'Jawa Tengah', -7.4900, 110.2167, 'Kota pendakian Borobudur dengan wisata alam dan sejarah'),
('Wonosobo', 'Jawa Tengah', -7.3667, 109.9000, 'Gerbang menuju Dieng Plateau dengan wisata alam pegunungan'),
('Jepara', 'Jawa Tengah', -6.5833, 110.6667, 'Kota ukir dan gerbang menuju Karimunjawa'),
('Karanganyar', 'Jawa Tengah', -7.6000, 111.0000, 'Wisata alam dan sejarah di kaki Gunung Lawu'),
('Banyumas', 'Jawa Tengah', -7.4000, 109.2500, 'Wisata alam Baturraden dan kuliner khas Sunda'),
('Surakarta', 'Jawa Tengah', -7.5617, 110.8319, 'Kota budaya Solo dengan keraton dan wisata heritage'),
('Kebumen', 'Jawa Tengah', -7.7167, 109.6500, 'Wisata alam pantai dan gua'),
('Klaten', 'Jawa Tengah', -7.7500, 110.6000, 'Wisata budaya dan pertanian'),
('Purworejo', 'Jawa Tengah', -7.7167, 109.9000, 'Wisata alam dan sejarah'),
('Yogyakarta', 'DIY', -7.7956, 110.3695, 'Kota budaya dan wisata populer dekat Jawa Tengah'),
('Pekalongan', 'Jawa Tengah', -6.8889, 109.3750, 'Kota batik dengan wisata pantai'),
('Kendal', 'Jawa Tengah', -7.0000, 110.1833, 'Wisata religi dan pantai utara'),
('Pemalang', 'Jawa Tengah', -6.8889, 109.3833, 'Wisata alam dan kuliner'),
('Salatiga', 'Jawa Tengah', -7.3333, 110.5000, 'Wisata alam pegunungan dan edukasi');

-- 2. DESTINATIONS TABLE
CREATE TABLE IF NOT EXISTS destinations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    city_id INT NOT NULL,
    name VARCHAR(200) NOT NULL,
    category ENUM('cultural', 'historical', 'nature', 'adventure', 'beach', 'religious', 'culinary', 'family', 'entertainment') NOT NULL,
    description TEXT,
    ticket_price DECIMAL(12, 2) DEFAULT 0,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    image_url VARCHAR(500),
    opening_hours TIME,
    closing_hours TIME,
    visit_duration INT DEFAULT 60 COMMENT 'Duration in minutes',
    best_time_to_visit VARCHAR(100),
    facilities JSON COMMENT 'Parking, toilet, mushola, restaurant, etc.',
    accessibility JSON COMMENT 'Access info for vehicles',
    rating DECIMAL(3, 2) DEFAULT 0.00,
    total_reviews INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    is_popular TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE,
    INDEX idx_city_id (city_id),
    INDEX idx_category (category),
    INDEX idx_rating (rating),
    INDEX idx_active (is_active),
    INDEX idx_popular (is_popular),
    INDEX idx_location (latitude, longitude)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. HOTELS TABLE
CREATE TABLE IF NOT EXISTS hotels (
    id INT AUTO_INCREMENT PRIMARY KEY,
    city_id INT NOT NULL,
    name VARCHAR(200) NOT NULL,
    star_rating TINYINT(1) CHECK (star_rating BETWEEN 1 AND 5),
    category ENUM('budget', 'mid_range', 'luxury') DEFAULT 'mid_range',
    price_per_night DECIMAL(12, 2) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    image_url VARCHAR(500),
    description TEXT,
    amenities JSON COMMENT 'AC, WiFi, breakfast, pool, parking, etc.',
    room_capacity INT DEFAULT 2 COMMENT 'Max persons per room',
    total_rooms INT,
    check_in_time TIME DEFAULT '14:00:00',
    check_out_time TIME DEFAULT '12:00:00',
    minimum_nights INT DEFAULT 1,
    rating DECIMAL(3, 2) DEFAULT 0.00,
    total_reviews INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE,
    INDEX idx_city_id (city_id),
    INDEX idx_category (category),
    INDEX idx_price (price_per_night),
    INDEX idx_rating (rating),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. VEHICLES TABLE
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

-- 5. PACKAGES TABLE (Generated Trip Plans)
-- Note: Foreign key to users will be added after users table is created
CREATE TABLE IF NOT EXISTS packages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL COMMENT 'NULL for anonymous users - FK added after users table',
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

-- 6. ITINERARY_TEMPLATES TABLE (For Smart Trip Planner)
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
-- PHASE 2: USER & BASIC FEATURES
-- =====================================================

-- 7. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    role ENUM('customer', 'admin', 'travel_planner') DEFAULT 'customer',
    preferences JSON COMMENT 'User travel preferences',
    is_verified TINYINT(1) DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add foreign key to packages table after users table is created
ALTER TABLE packages ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- 8. USER_PREFERENCES TABLE (For Personalization)
CREATE TABLE IF NOT EXISTS user_preferences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    budget_min DECIMAL(12, 2),
    budget_max DECIMAL(12, 2),
    preferred_categories JSON COMMENT 'Array of preferred destination categories',
    preferred_cities JSON COMMENT 'Array of preferred city IDs',
    preferred_transportation JSON COMMENT 'Transport preferences',
    accommodation_preference ENUM('budget', 'mid_range', 'luxury', 'any') DEFAULT 'any',
    meal_preferences JSON COMMENT 'Dietary restrictions, cuisine preferences',
    accessibility_needs JSON COMMENT 'Special accessibility requirements',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_preferences (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. FAVORITES TABLE
CREATE TABLE IF NOT EXISTS favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    item_type ENUM('destination', 'hotel', 'vehicle', 'guide') NOT NULL,
    item_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_favorite (user_id, item_type, item_id),
    INDEX idx_user_id (user_id),
    INDEX idx_item (item_type, item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- PHASE 3: BOOKING SYSTEM
-- =====================================================

-- 10. TOUR_GUIDES TABLE
CREATE TABLE IF NOT EXISTS tour_guides (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    city_id INT NOT NULL,
    languages JSON COMMENT 'Array of languages spoken',
    specialty JSON COMMENT 'Array of specialties',
    experience_years INT DEFAULT 0,
    price_per_day DECIMAL(12, 2) NOT NULL,
    rating DECIMAL(3, 2) DEFAULT 0.00,
    total_reviews INT DEFAULT 0,
    certifications JSON COMMENT 'Array of certifications',
    phone VARCHAR(20),
    image_url VARCHAR(500),
    description TEXT,
    is_available TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE,
    INDEX idx_city_id (city_id),
    INDEX idx_rating (rating),
    INDEX idx_available (is_available)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    package_id INT NULL COMMENT 'NULL for custom trips without package',
    booking_code VARCHAR(20) UNIQUE NOT NULL,
    status ENUM('pending', 'confirmed', 'cancelled', 'completed', 'refunded') DEFAULT 'pending',
    total_price DECIMAL(12, 2) NOT NULL,
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    travel_date DATE,
    completion_date DATE NULL,
    people_count INT NOT NULL,
    nights INT NOT NULL,
    special_requests TEXT,
    cancellation_reason TEXT,
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_booking_code (booking_code),
    INDEX idx_status (status),
    INDEX idx_travel_date (travel_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add foreign keys to bookings table after users and packages tables are created
ALTER TABLE bookings ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE bookings ADD FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE SET NULL;

-- 12. BOOKING_ITEMS TABLE
CREATE TABLE IF NOT EXISTS booking_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    item_type ENUM('destination', 'hotel', 'vehicle', 'guide') NOT NULL,
    item_id INT NOT NULL,
    quantity INT DEFAULT 1,
    price_per_unit DECIMAL(12, 2) NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    INDEX idx_booking_id (booking_id),
    INDEX idx_item (item_type, item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    payment_method ENUM('transfer', 'e_wallet', 'credit_card', 'cash') DEFAULT 'transfer',
    payment_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    payment_date TIMESTAMP NULL,
    due_date TIMESTAMP NULL,
    proof_image_url VARCHAR(500),
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    INDEX idx_booking_id (booking_id),
    INDEX idx_status (payment_status),
    INDEX idx_payment_date (payment_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- PHASE 4: ENHANCEMENT
-- =====================================================

-- 14. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    item_type ENUM('destination', 'hotel', 'vehicle', 'guide') NOT NULL,
    item_id INT NOT NULL,
    rating TINYINT(1) NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    is_verified TINYINT(1) DEFAULT 0 COMMENT 'Verified if user actually used the service',
    admin_response TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_item (item_type, item_id),
    INDEX idx_rating (rating),
    INDEX idx_verified (is_verified)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for active destinations with city name
CREATE OR REPLACE VIEW v_active_destinations AS
SELECT 
    d.id,
    d.name,
    d.category,
    d.description,
    d.ticket_price,
    d.latitude,
    d.longitude,
    d.image_url,
    d.rating,
    d.is_popular,
    c.name as city_name,
    c.province
FROM destinations d
JOIN cities c ON d.city_id = c.id
WHERE d.is_active = 1 AND c.is_active = 1;

-- View for active hotels with city name
CREATE OR REPLACE VIEW v_active_hotels AS
SELECT 
    h.id,
    h.name,
    h.star_rating,
    h.category,
    h.price_per_night,
    h.latitude,
    h.longitude,
    h.image_url,
    h.rating,
    h.room_capacity,
    c.name as city_name,
    c.province
FROM hotels h
JOIN cities c ON h.city_id = c.id
WHERE h.is_active = 1 AND c.is_active = 1;

-- View for active vehicles
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
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Trigger to update hotel rating when review is added
DELIMITER //
CREATE TRIGGER trg_update_hotel_rating_after_review
AFTER INSERT ON reviews
FOR EACH ROW
BEGIN
    IF NEW.item_type = 'hotel' THEN
        UPDATE hotels h
        SET 
            h.rating = (SELECT AVG(rating) FROM reviews WHERE item_type = 'hotel' AND item_id = h.id AND is_verified = 1),
            h.total_reviews = (SELECT COUNT(*) FROM reviews WHERE item_type = 'hotel' AND item_id = h.id AND is_verified = 1)
        WHERE h.id = NEW.item_id;
    END IF;
END//
DELIMITER ;

-- Trigger to update destination rating when review is added
DELIMITER //
CREATE TRIGGER trg_update_destination_rating_after_review
AFTER INSERT ON reviews
FOR EACH ROW
BEGIN
    IF NEW.item_type = 'destination' THEN
        UPDATE destinations d
        SET 
            d.rating = (SELECT AVG(rating) FROM reviews WHERE item_type = 'destination' AND item_id = d.id AND is_verified = 1),
            d.total_reviews = (SELECT COUNT(*) FROM reviews WHERE item_type = 'destination' AND item_id = d.id AND is_verified = 1)
        WHERE d.id = NEW.item_id;
    END IF;
END//
DELIMITER ;

-- Trigger to update vehicle rating when review is added
DELIMITER //
CREATE TRIGGER trg_update_vehicle_rating_after_review
AFTER INSERT ON reviews
FOR EACH ROW
BEGIN
    IF NEW.item_type = 'vehicle' THEN
        UPDATE vehicles v
        SET 
            v.rating = (SELECT AVG(rating) FROM reviews WHERE item_type = 'vehicle' AND item_id = v.id AND is_verified = 1),
            v.total_reviews = (SELECT COUNT(*) FROM reviews WHERE item_type = 'vehicle' AND item_id = v.id AND is_verified = 1)
        WHERE v.id = NEW.item_id;
    END IF;
END//
DELIMITER ;

-- Trigger to update tour guide rating when review is added
DELIMITER //
CREATE TRIGGER trg_update_guide_rating_after_review
AFTER INSERT ON reviews
FOR EACH ROW
BEGIN
    IF NEW.item_type = 'guide' THEN
        UPDATE tour_guides g
        SET 
            g.rating = (SELECT AVG(rating) FROM reviews WHERE item_type = 'guide' AND item_id = g.id AND is_verified = 1),
            g.total_reviews = (SELECT COUNT(*) FROM reviews WHERE item_type = 'guide' AND item_id = g.id AND is_verified = 1)
        WHERE g.id = NEW.item_id;
    END IF;
END//
DELIMITER ;

-- =====================================================
-- END OF SCHEMA
-- =====================================================

-- Notes:
-- 1. All tables use InnoDB for transactions and foreign key support
-- 2. UTF8MB4 charset for full Unicode support (including emojis)
-- 3. Soft delete implemented with deleted_at timestamp
-- 4. JSON fields used for flexible data storage
-- 5. Comprehensive indexing for performance
-- 6. Triggers for automatic rating updates
-- 7. Views for common query patterns
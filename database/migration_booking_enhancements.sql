-- Migration for Booking Enhancements
-- This migration adds new fields to the bookings table and creates vehicles, tour_guides, and payments tables

-- Add role column to users table
ALTER TABLE users
ADD COLUMN role VARCHAR(50) DEFAULT 'customer' COMMENT 'customer, admin, staff',
ADD INDEX idx_role (role);

-- Add new columns to bookings table
ALTER TABLE bookings
ADD COLUMN user_id INT NULL,
ADD COLUMN vehicle_id INT NULL,
ADD COLUMN guide_id INT NULL,
ADD COLUMN payment_method VARCHAR(50) DEFAULT 'transfer',
ADD COLUMN payment_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN payment_proof VARCHAR(255) NULL,
ADD COLUMN admin_notes TEXT NULL,
ADD COLUMN booking_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN trip_date DATE NULL,
ADD COLUMN nights INT DEFAULT 1,
ADD COLUMN total_rooms INT DEFAULT 1,
ADD COLUMN people_count INT DEFAULT 1;

-- Add foreign keys
ALTER TABLE bookings
ADD CONSTRAINT fk_booking_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
ADD CONSTRAINT fk_booking_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL,
ADD CONSTRAINT fk_booking_guide FOREIGN KEY (guide_id) REFERENCES tour_guides(id) ON DELETE SET NULL;

-- Create vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL COMMENT 'normal, luxury, hiace, elf, bus',
  capacity INT NOT NULL,
  price_per_day DECIMAL(10, 2) NOT NULL,
  image_url VARCHAR(255) NULL,
  description TEXT NULL,
  available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_capacity (capacity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create tour_guides table
CREATE TABLE IF NOT EXISTS tour_guides (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  specialization VARCHAR(100) NOT NULL,
  experience_years INT DEFAULT 0,
  languages VARCHAR(255) NULL,
  price_per_day DECIMAL(10, 2) NOT NULL,
  image_url VARCHAR(255) NULL,
  bio TEXT NULL,
  rating DECIMAL(3, 2) DEFAULT 0.00,
  available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_specialization (specialization),
  INDEX idx_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  user_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL COMMENT 'transfer, cash, ewallet, credit_card',
  proof_image VARCHAR(255) NULL,
  status VARCHAR(50) DEFAULT 'pending' COMMENT 'pending, waiting_verification, paid, rejected, refunded',
  verified_by INT NULL,
  verified_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_booking (booking_id),
  INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed vehicles data
INSERT INTO vehicles (name, category, capacity, price_per_day, image_url, description, available) VALUES
('Toyota Avanza', 'normal', 4, 500000, NULL, 'Comfortable MPV for small groups', TRUE),
('Toyota Innova', 'luxury', 6, 800000, NULL, 'Premium MPV with extra comfort', TRUE),
('Toyota Hiace', 'hiace', 10, 1200000, NULL, 'Spacious van for medium groups', TRUE),
('Isuzu Elf', 'elf', 18, 1800000, NULL, 'Large van for big groups', TRUE),
('Big Bus', 'bus', 40, 3000000, NULL, 'Full-size bus for large groups', TRUE);

-- Seed tour guides data
INSERT INTO tour_guides (name, specialization, experience_years, languages, price_per_day, image_url, bio, rating, available) VALUES
('Budi Santoso', 'Culture & History', 5, 'Indonesian, English', 500000, NULL, 'Expert in Javanese culture and history', 4.5, TRUE),
('Siti Aminah', 'Nature & Adventure', 3, 'Indonesian, English, Japanese', 600000, NULL, 'Nature guide with hiking expertise', 4.7, TRUE),
('Agus Pratama', 'Food & Culinary', 4, 'Indonesian, English', 450000, NULL, 'Local food expert and culinary guide', 4.3, TRUE);

-- Create uploads directory for payment proofs
-- Note: This needs to be done manually or through application code
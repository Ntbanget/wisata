-- Central Java Tourism Travel Planner Database Schema

-- Create database
CREATE DATABASE IF NOT EXISTS wisata_db;
USE wisata_db;

-- Cities table
CREATE TABLE cities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Hotels table
CREATE TABLE hotels (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    city_id INT NOT NULL,
    price_per_night DECIMAL(10,2) NOT NULL,
    rating DECIMAL(2,1) NOT NULL CHECK (rating >= 0 AND rating <= 5),
    category ENUM('low', 'medium', 'high') NOT NULL,
    lat DECIMAL(10,8) NOT NULL,
    lng DECIMAL(11,8) NOT NULL,
    image_url VARCHAR(500),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE,
    INDEX idx_city_id (city_id),
    INDEX idx_category (category),
    INDEX idx_price (price_per_night)
);

-- Tourist places table
CREATE TABLE tourist_places (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    city_id INT NOT NULL,
    ticket_price DECIMAL(10,2) NOT NULL,
    category VARCHAR(50) NOT NULL,
    lat DECIMAL(10,8) NOT NULL,
    lng DECIMAL(11,8) NOT NULL,
    image_url VARCHAR(500),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE,
    INDEX idx_city_id (city_id),
    INDEX idx_category (category),
    INDEX idx_ticket_price (ticket_price)
);

-- Bookings table
CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_name VARCHAR(200) NOT NULL,
    email VARCHAR(200) NOT NULL,
    city_id INT NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    budget DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE RESTRICT,
    INDEX idx_user_email (email),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Booking details table
CREATE TABLE booking_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    hotel_id INT NOT NULL,
    tourist_place_id INT,
    quantity INT DEFAULT 1,
    price_per_item DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE RESTRICT,
    FOREIGN KEY (tourist_place_id) REFERENCES tourist_places(id) ON DELETE RESTRICT,
    INDEX idx_booking_id (booking_id),
    INDEX idx_hotel_id (hotel_id),
    INDEX idx_tourist_place_id (tourist_place_id)
);

-- Users table (for future authentication)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(200) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
);

-- Reviews table
CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    hotel_rating DECIMAL(2,1) CHECK (hotel_rating >= 0 AND hotel_rating <= 5),
    place_rating DECIMAL(2,1) CHECK (place_rating >= 0 AND place_rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    INDEX idx_booking_id (booking_id)
);

-- Add indexes for better performance
CREATE INDEX idx_hotels_city_rating ON hotels(city_id, rating DESC);
CREATE INDEX idx_tourist_places_city_price ON tourist_places(city_id, ticket_price);

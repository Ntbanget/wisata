-- Seed Data for Wisata Application
-- This file populates the database with initial data for testing

-- Seed Cities
INSERT INTO cities (id, name, description, image_url, created_at, updated_at)
VALUES
(1, 'Jakarta', 'Capital city of Indonesia', 'https://example.com/jakarta.jpg', NOW(), NOW())
ON DUPLICATE KEY UPDATE name = name;

-- Seed Hotels
INSERT INTO hotels (id, name, city_id, price_per_night, rating, category, description, image_url, lat, lng, created_at, updated_at)
VALUES
(1, 'Grand Hotel Jakarta', 1, 500000, 4.5, 'Luxury', 'Luxury hotel in the heart of Jakarta', 'https://example.com/hotel1.jpg', -6.2088, 106.8456, NOW(), NOW())
ON DUPLICATE KEY UPDATE name = name;

-- Seed Tourist Places
INSERT INTO tourist_places (id, name, city_id, category, ticket_price, description, image_url, lat, lng, created_at, updated_at)
VALUES
(1, 'Monas', 1, 'Historical', 15000, 'National Monument of Indonesia', 'https://example.com/monas.jpg', -6.1754, 106.8272, NOW(), NOW()),
(2, 'Taman Mini Indonesia Indah', 1, 'Theme Park', 50000, 'Miniature park of Indonesia', 'https://example.com/tmii.jpg', -6.2988, 106.8895, NOW(), NOW())
ON DUPLICATE KEY UPDATE name = name;

-- Display summary
SELECT 'Seed data completed successfully' AS message;
SELECT COUNT(*) AS cities_count FROM cities;
SELECT COUNT(*) AS hotels_count FROM hotels;
SELECT COUNT(*) AS tourist_places_count FROM tourist_places;

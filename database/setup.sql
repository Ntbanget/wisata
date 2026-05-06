-- Quick Setup Script for Central Java Tourism Database
-- Run this script to set up the complete database

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS wisata_db;
USE wisata_db;

-- Drop existing tables to start fresh (optional)
-- DROP TABLE IF EXISTS booking_details;
-- DROP TABLE IF EXISTS bookings;
-- DROP TABLE IF EXISTS reviews;
-- DROP TABLE IF EXISTS users;
-- DROP TABLE IF EXISTS tourist_places;
-- DROP TABLE IF EXISTS hotels;
-- DROP TABLE IF EXISTS cities;

-- Run the schema and seed data
SOURCE schema.sql;
SOURCE seed.sql;

-- Verify setup
SELECT 'Database setup completed!' as message;
SELECT COUNT(*) as cities_count FROM cities;
SELECT COUNT(*) as hotels_count FROM hotels;
SELECT COUNT(*) as tourist_places_count FROM tourist_places;

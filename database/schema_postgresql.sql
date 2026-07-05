-- PostgreSQL schema draft converted from the current MySQL dump.
-- This is a review draft only; it has not been executed to Neon.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  email VARCHAR(200) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user','staff','admin','customer')),
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP DEFAULT NULL
);

CREATE TABLE cities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  province VARCHAR(50) DEFAULT 'Jawa Tengah',
  latitude NUMERIC(10,8) DEFAULT NULL,
  longitude NUMERIC(11,8) DEFAULT NULL,
  description TEXT DEFAULT NULL,
  image_url VARCHAR(500) DEFAULT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE hotels (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  star_rating SMALLINT DEFAULT NULL,
  city_id INT NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  price_per_night NUMERIC(10,2) NOT NULL,
  rating NUMERIC(2,1) NOT NULL CHECK (rating >= 0 AND rating <= 5),
  total_reviews INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP DEFAULT NULL,
  category VARCHAR(20) NOT NULL CHECK (category IN ('low','medium','high')),
  lat NUMERIC(10,8) NOT NULL,
  lng NUMERIC(11,8) NOT NULL,
  image_url VARCHAR(500) DEFAULT NULL,
  amenities JSONB DEFAULT NULL,
  room_capacity INT DEFAULT 2,
  total_rooms INT DEFAULT NULL,
  check_in_time TIME DEFAULT '14:00:00',
  check_out_time TIME DEFAULT '12:00:00',
  minimum_nights INT DEFAULT 1,
  description TEXT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE image_galleries (
  id SERIAL PRIMARY KEY,
  resource_type VARCHAR(50) NOT NULL CHECK (resource_type IN ('hotel','tourist_place','city')),
  resource_id INT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  alt_text VARCHAR(200) DEFAULT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE itinerary_templates (
  id SERIAL PRIMARY KEY,
  city_id INT NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT DEFAULT NULL,
  duration_hours INT NOT NULL,
  total_distance_km NUMERIC(8,2) DEFAULT NULL,
  waypoints JSONB DEFAULT NULL,
  category_template VARCHAR(20) DEFAULT 'mixed' CHECK (category_template IN ('cultural','nature','adventure','family','mixed')),
  difficulty_level VARCHAR(20) DEFAULT 'medium' CHECK (difficulty_level IN ('easy','medium','hard')),
  min_people INT DEFAULT 1,
  max_people INT DEFAULT 10,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'info' CHECK (type IN ('info','success','warning','error','payment_approved','payment_rejected','payment_failed')),
  is_read BOOLEAN DEFAULT FALSE,
  action_url VARCHAR(500) DEFAULT NULL,
  metadata JSONB DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP DEFAULT NULL,
  booking_id INT DEFAULT NULL,
  admin_id INT DEFAULT NULL,
  admin_name VARCHAR(100) DEFAULT NULL
);

CREATE TABLE vehicles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  category VARCHAR(50) NOT NULL,
  capacity INT DEFAULT NULL,
  price_per_day NUMERIC(10,2) NOT NULL,
  image_url VARCHAR(500) DEFAULT NULL,
  description TEXT DEFAULT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tour_guides (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  languages JSONB DEFAULT NULL,
  experience_years INT DEFAULT 0,
  rating NUMERIC(2,1) DEFAULT 0.0,
  price_per_day NUMERIC(10,2) NOT NULL,
  photo_url VARCHAR(500) DEFAULT NULL,
  description TEXT DEFAULT NULL,
  specializations JSONB DEFAULT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tourist_places (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  city_id INT NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  ticket_price NUMERIC(10,2) NOT NULL,
  category VARCHAR(50) NOT NULL,
  lat NUMERIC(10,8) NOT NULL,
  lng NUMERIC(11,8) NOT NULL,
  image_url VARCHAR(500) DEFAULT NULL,
  description TEXT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  opening_hours TIME DEFAULT NULL,
  closing_hours TIME DEFAULT NULL,
  visit_duration INT DEFAULT 60,
  best_time_to_visit VARCHAR(100) DEFAULT NULL,
  facilities JSONB DEFAULT NULL,
  accessibility JSONB DEFAULT NULL,
  rating NUMERIC(3,2) DEFAULT 0.00,
  total_reviews INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  is_popular BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP DEFAULT NULL
);

CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  user_name VARCHAR(200) NOT NULL,
  email VARCHAR(200) NOT NULL,
  user_id INT DEFAULT NULL REFERENCES users(id) ON DELETE SET NULL,
  vehicle_id INT DEFAULT NULL REFERENCES vehicles(id),
  guide_id INT DEFAULT NULL REFERENCES tour_guides(id),
  city_id INT NOT NULL REFERENCES cities(id),
  total_price NUMERIC(10,2) NOT NULL,
  budget NUMERIC(10,2) NOT NULL,
  status VARCHAR(30) DEFAULT 'PENDING_PAYMENT' CHECK (status IN ('PENDING_PAYMENT','CONFIRMED','CANCELLED')),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  payment_method VARCHAR(30) DEFAULT 'transfer' CHECK (payment_method IN ('transfer','cash','credit_card','e_wallet','qris')),
  payment_status VARCHAR(30) DEFAULT 'pending' CHECK (payment_status IN ('pending','PENDING','paid','failed','refunded')),
  payment_proof VARCHAR(500) DEFAULT NULL,
  admin_notes TEXT DEFAULT NULL,
  trip_date DATE DEFAULT NULL,
  nights INT DEFAULT 1,
  total_rooms INT DEFAULT NULL,
  people_count INT DEFAULT 1,
  vehicle_mode VARCHAR(30) DEFAULT 'automatic' CHECK (vehicle_mode IN ('automatic','custom')),
  payment_proof_url VARCHAR(500) DEFAULT NULL,
  payment_verified_at TIMESTAMP DEFAULT NULL,
  payment_notes TEXT DEFAULT NULL
);

CREATE TABLE booking_details (
  id SERIAL PRIMARY KEY,
  booking_id INT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  hotel_id INT NOT NULL REFERENCES hotels(id),
  tourist_place_id INT DEFAULT NULL REFERENCES tourist_places(id),
  quantity INT DEFAULT 1,
  price_per_item NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE booking_vehicle_details (
  id SERIAL PRIMARY KEY,
  booking_id INT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  vehicle_id INT NOT NULL REFERENCES vehicles(id),
  quantity INT NOT NULL DEFAULT 1,
  price_per_day NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE activity_logs (
  id SERIAL PRIMARY KEY,
  admin_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  admin_name VARCHAR(200) NOT NULL,
  action_type VARCHAR(100) NOT NULL,
  target_type VARCHAR(100) DEFAULT NULL,
  target_id INT DEFAULT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE admin_logs (
  id SERIAL PRIMARY KEY,
  admin_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) DEFAULT NULL,
  resource_id INT DEFAULT NULL,
  old_values JSONB DEFAULT NULL,
  new_values JSONB DEFAULT NULL,
  ip_address VARCHAR(45) DEFAULT NULL,
  user_agent TEXT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE packages (
  id SERIAL PRIMARY KEY,
  user_id INT DEFAULT NULL REFERENCES users(id) ON DELETE SET NULL,
  city_id INT NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  hotel_id INT DEFAULT NULL REFERENCES hotels(id) ON DELETE SET NULL,
  tourist_place_ids JSONB DEFAULT NULL,
  name VARCHAR(200) NOT NULL,
  budget NUMERIC(12,2) NOT NULL,
  people_count INT NOT NULL,
  nights INT NOT NULL,
  preferences JSONB DEFAULT NULL,
  generated_itinerary JSONB DEFAULT NULL,
  total_estimated_cost NUMERIC(12,2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  created_by INT DEFAULT NULL REFERENCES users(id) ON DELETE SET NULL,
  is_saved BOOLEAN DEFAULT FALSE,
  is_booked BOOLEAN DEFAULT FALSE,
  booking_id INT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  booking_id INT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  proof_image VARCHAR(255) DEFAULT NULL,
  status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending','waiting_verification','paid','rejected','refunded')),
  verified_by INT DEFAULT NULL REFERENCES users(id) ON DELETE SET NULL,
  verified_at TIMESTAMP DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  booking_id INT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  hotel_rating NUMERIC(2,1) DEFAULT NULL CHECK (hotel_rating >= 0 AND hotel_rating <= 5),
  place_rating NUMERIC(2,1) DEFAULT NULL CHECK (place_rating >= 0 AND place_rating <= 5),
  comment TEXT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE saved_trips (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  city_id INT NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  budget NUMERIC(10,2) NOT NULL,
  days INT DEFAULT 1,
  people_count INT DEFAULT 1,
  tourism_types JSONB DEFAULT NULL,
  hotel_id INT DEFAULT NULL REFERENCES hotels(id) ON DELETE SET NULL,
  tourist_places JSONB DEFAULT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE smart_trip_requests (
  id SERIAL PRIMARY KEY,
  user_id INT DEFAULT NULL REFERENCES users(id) ON DELETE SET NULL,
  user_name VARCHAR(200) NOT NULL,
  email VARCHAR(200) NOT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  city_id INT NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  budget NUMERIC(10,2) NOT NULL,
  people_count INT NOT NULL,
  nights INT NOT NULL,
  preferences JSONB DEFAULT NULL,
  status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed','cancelled')),
  admin_notes TEXT DEFAULT NULL,
  assigned_package_id INT DEFAULT NULL REFERENCES packages(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tour_packages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  city_id INT NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  duration_days INT NOT NULL DEFAULT 1,
  duration_nights INT NOT NULL DEFAULT 1,
  hotel_id INT DEFAULT NULL REFERENCES hotels(id) ON DELETE SET NULL,
  vehicle_id INT DEFAULT NULL REFERENCES vehicles(id) ON DELETE SET NULL,
  tourist_place_ids JSONB DEFAULT NULL,
  price NUMERIC(10,2) NOT NULL,
  thumbnail_url VARCHAR(500) DEFAULT NULL,
  description TEXT DEFAULT NULL,
  inclusions JSONB DEFAULT NULL,
  exclusions JSONB DEFAULT NULL,
  itinerary JSONB DEFAULT NULL,
  max_people INT DEFAULT 10,
  min_people INT DEFAULT 2,
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_by INT DEFAULT NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE trip_reviews (
  id SERIAL PRIMARY KEY,
  booking_id INT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  overall_rating NUMERIC(2,1) DEFAULT NULL CHECK (overall_rating >= 0 AND overall_rating <= 5),
  hotel_rating NUMERIC(2,1) DEFAULT NULL CHECK (hotel_rating >= 0 AND hotel_rating <= 5),
  itinerary_rating NUMERIC(2,1) DEFAULT NULL CHECK (itinerary_rating >= 0 AND itinerary_rating <= 5),
  value_rating NUMERIC(2,1) DEFAULT NULL CHECK (value_rating >= 0 AND value_rating <= 5),
  review_text TEXT DEFAULT NULL,
  pros JSONB DEFAULT NULL,
  cons JSONB DEFAULT NULL,
  would_recommend BOOLEAN DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_analytics (
  id SERIAL PRIMARY KEY,
  user_id INT DEFAULT NULL REFERENCES users(id) ON DELETE SET NULL,
  session_id VARCHAR(255) DEFAULT NULL,
  action_type VARCHAR(20) DEFAULT NULL CHECK (action_type IN ('search','view','booking','save','share')),
  resource_type VARCHAR(20) DEFAULT NULL CHECK (resource_type IN ('city','hotel','tourist_place','package')),
  resource_id INT DEFAULT NULL,
  metadata JSONB DEFAULT NULL,
  ip_address VARCHAR(45) DEFAULT NULL,
  user_agent TEXT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_preferences (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  preferred_tourism_types JSONB DEFAULT NULL,
  budget_range_min NUMERIC(10,2) DEFAULT NULL,
  budget_range_max NUMERIC(10,2) DEFAULT NULL,
  preferred_accommodation VARCHAR(20) DEFAULT NULL CHECK (preferred_accommodation IN ('low','medium','high')),
  travel_style VARCHAR(20) DEFAULT NULL CHECK (travel_style IN ('budget','comfort','luxury')),
  group_size_preference INT DEFAULT 2,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

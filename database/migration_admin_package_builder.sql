-- Migration: add admin package builder fields to packages table
-- Purpose: support package builder workflows that need to associate a package
-- with a hotel, selected tourist places, a workflow status, and the admin/user
-- who created it. These columns are used by the package management and admin
-- package builder flows in the application.

ALTER TABLE packages
  ADD COLUMN IF NOT EXISTS hotel_id INT NULL AFTER city_id,
  ADD COLUMN IF NOT EXISTS tourist_place_ids JSON NULL AFTER hotel_id,
  ADD COLUMN IF NOT EXISTS status VARCHAR(50) NOT NULL DEFAULT 'draft' AFTER total_estimated_cost,
  ADD COLUMN IF NOT EXISTS created_by INT NULL AFTER status,
  ADD INDEX idx_packages_hotel_id (hotel_id),
  ADD INDEX idx_packages_status (status),
  ADD INDEX idx_packages_created_by (created_by);

-- Optional foreign key for hotel association if the hotels table is present.
-- This is intentionally left as a comment to avoid breaking existing databases
-- that may not have the referenced table or data yet.
-- ALTER TABLE packages ADD CONSTRAINT fk_packages_hotel
--   FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE SET NULL;

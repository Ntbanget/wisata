-- Migration to add admin_id and admin_name columns to notifications table
-- This is needed for the admin send notification feature and activity log tracking

-- Check if admin_id column exists, if not add it
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns
                   WHERE table_schema = DATABASE()
                   AND table_name = 'notifications'
                   AND column_name = 'admin_id');

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE notifications ADD COLUMN admin_id INT NULL AFTER created_by',
  'SELECT "Column admin_id already exists" AS message');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check if admin_name column exists, if not add it
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns
                   WHERE table_schema = DATABASE()
                   AND table_name = 'notifications'
                   AND column_name = 'admin_name');

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE notifications ADD COLUMN admin_name VARCHAR(100) NULL AFTER admin_id',
  'SELECT "Column admin_name already exists" AS message');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Display summary
SELECT 'Notifications table admin fields migration completed' AS message;

-- Migration to add admin_id and admin_name columns to notifications table (PostgreSQL/NeonDB)
-- This is needed for the admin send notification feature and activity log tracking

-- Add admin_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'notifications'
        AND column_name = 'admin_id'
    ) THEN
        ALTER TABLE notifications ADD COLUMN admin_id INTEGER NULL;
    END IF;
END $$;

-- Add admin_name column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'notifications'
        AND column_name = 'admin_name'
    ) THEN
        ALTER TABLE notifications ADD COLUMN admin_name VARCHAR(100) NULL;
    END IF;
END $$;

-- Display summary
SELECT 'Notifications table admin fields migration completed' AS message;

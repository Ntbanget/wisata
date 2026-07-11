-- Migration to add created_by column to notifications table (PostgreSQL/NeonDB)
-- This is needed for the notification system

-- Add created_by column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'notifications'
        AND column_name = 'created_by'
    ) THEN
        ALTER TABLE notifications ADD COLUMN created_by VARCHAR(20) DEFAULT 'SYSTEM';
    END IF;
END $$;

-- Display summary
SELECT 'Notifications table created_by column migration completed' AS message;

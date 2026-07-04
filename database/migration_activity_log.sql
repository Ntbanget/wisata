-- Migration for Activity Log
-- This migration creates the activity_logs table for admin audit trail

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id INT NOT NULL,
  admin_name VARCHAR(200) NOT NULL,
  action_type VARCHAR(100) NOT NULL COMMENT 'DELETE_CUSTOMER, SUSPEND_CUSTOMER, ACTIVATE_CUSTOMER, APPROVE_PAYMENT, REJECT_PAYMENT, UPDATE_BOOKING_STATUS, SEND_MESSAGE, CREATE_DESTINATION, UPDATE_DESTINATION, DELETE_DESTINATION, CREATE_PACKAGE, UPDATE_PACKAGE, DELETE_PACKAGE, CREATE_HOTEL, UPDATE_HOTEL, DELETE_HOTEL, CREATE_VEHICLE, UPDATE_VEHICLE, DELETE_VEHICLE, CREATE_TOUR_GUIDE, UPDATE_TOUR_GUIDE, DELETE_TOUR_GUIDE, UPDATE_SETTINGS',
  target_type VARCHAR(100) NULL COMMENT 'CUSTOMER, PAYMENT, BOOKING, DESTINATION, PACKAGE, HOTEL, VEHICLE, TOUR_GUIDE, SETTINGS',
  target_id INT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_admin_id (admin_id),
  INDEX idx_action_type (action_type),
  INDEX idx_target_type (target_type),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Add foreign key constraint to users table
 Alter TABLE activity_logs
ADD CONSTRAINT fk_activity_log_admin FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE;

-- Display summary
SELECT 'Activity log table created successfully' AS message;

const { query } = require('../models/database');

/**
 * Log admin activity for audit trail
 * This function is designed to not fail the main process if logging fails
 * 
 * @param {number} adminId - ID of the admin performing the action
 * @param {string} adminName - Name of the admin
 * @param {string} actionType - Type of action (e.g., DELETE_CUSTOMER, APPROVE_PAYMENT)
 * @param {string} targetType - Type of target (e.g., CUSTOMER, PAYMENT, BOOKING)
 * @param {number|null} targetId - ID of the target entity
 * @param {string} description - Human-readable description of the action
 */
async function logActivity(adminId, adminName, actionType, targetType, targetId, description) {
  try {
    const safeAdminName = String(adminName || 'Unknown Admin');
    const safeActionType = String(actionType || 'UNKNOWN_ACTION');
    const safeTargetType = targetType ? String(targetType) : null;
    const safeDescription = String(description || 'No description provided');

    const sql = `
      INSERT INTO activity_logs (admin_id, admin_name, action_type, target_type, target_id, description)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    await query(sql, [adminId, safeAdminName, safeActionType, safeTargetType, targetId, safeDescription]);
  } catch (error) {
    // Log error but don't throw - logging failure should not break the main process
    console.error('Activity Log Error:', error);
  }
}

module.exports = { logActivity };

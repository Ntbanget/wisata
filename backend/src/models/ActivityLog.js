const { query } = require('./database');

class ActivityLog {
  // Get all activity logs with pagination and filters
  static async getAll(page = 1, limit = 20, actionType = null, adminId = null, startDate = null, endDate = null) {
    const offset = (page - 1) * limit;
    let sql = `
      SELECT
        al.id,
        al.admin_id,
        al.admin_name,
        al.action_type,
        al.target_type,
        al.target_id,
        al.description,
        al.created_at
      FROM activity_logs al
      WHERE 1=1
    `;
    const params = [];

    if (actionType) {
      sql += ' AND al.action_type = ?';
      params.push(actionType);
    }

    if (adminId) {
      sql += ' AND al.admin_id = ?';
      params.push(adminId);
    }

    if (startDate) {
      sql += ' AND al.created_at >= ?';
      params.push(startDate);
    }

    if (endDate) {
      sql += ' AND al.created_at <= ?';
      params.push(endDate);
    }

    sql += ' ORDER BY al.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const logs = await query(sql, params);

    // Get total count
    let countSql = 'SELECT COUNT(*) as total FROM activity_logs al WHERE 1=1';
    const countParams = [];

    if (actionType) {
      countSql += ' AND al.action_type = ?';
      countParams.push(actionType);
    }

    if (adminId) {
      countSql += ' AND al.admin_id = ?';
      countParams.push(adminId);
    }

    if (startDate) {
      countSql += ' AND al.created_at >= ?';
      countParams.push(startDate);
    }

    if (endDate) {
      countSql += ' AND al.created_at <= ?';
      countParams.push(endDate);
    }

    const countResult = await query(countSql, countParams);
    const total = countResult[0].total;

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  // Get distinct action types for filter dropdown
  static async getActionTypes() {
    const sql = 'SELECT DISTINCT action_type FROM activity_logs ORDER BY action_type';
    const result = await query(sql);
    return result.map(row => row.action_type);
  }

  // Get distinct admins for filter dropdown
  static async getAdmins() {
    const sql = `
      SELECT DISTINCT admin_id, admin_name
      FROM activity_logs
      ORDER BY admin_name
    `;
    const result = await query(sql);
    return result;
  }
}

module.exports = ActivityLog;

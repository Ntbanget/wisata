const { query } = require('./database');

class Notification {
  static async create(notificationData) {
    const supportedColumns = await this.getSupportedColumns();
    const allowed = [
      'user_id',
      'booking_id',
      'title',
      'message',
      'type',
      'created_by',
      'admin_id',
      'admin_name'
    ];

    const cols = [];
    const placeholders = [];
    const values = [];

    for (const key of allowed) {
      if (supportedColumns.has(key) && notificationData[key] !== undefined && notificationData[key] !== null) {
        let value = notificationData[key];

        if (key === 'type') {
          value = this.normalizeType(value);
        }

        cols.push(key);
        placeholders.push('?');
        values.push(value);
      }
    }

    if (!cols.includes('user_id') || !cols.includes('title') || !cols.includes('message')) {
      throw new Error('Missing required notification fields: user_id, title, message');
    }

    const sql = `INSERT INTO notifications (${cols.join(',')}) VALUES (${placeholders.join(',')})`;
    const result = await query(sql, values);
    return await this.getById(result.insertId);
  }

  static async getSupportedColumns() {
    try {
      const mysqlColumns = await query('SHOW COLUMNS FROM notifications');
      if (Array.isArray(mysqlColumns) && mysqlColumns.length > 0) {
        return new Set(mysqlColumns.map((column) => column.Field || column.column_name).filter(Boolean));
      }

      const columns = await query("SELECT column_name FROM information_schema.columns WHERE table_name = 'notifications'");
      return new Set(columns.map((column) => column.column_name || column.Field).filter(Boolean));
    } catch (error) {
      return new Set(['user_id', 'booking_id', 'title', 'message', 'type', 'created_by', 'admin_id', 'admin_name']);
    }
  }

  static normalizeType(type) {
    const mapping = {
      admin_message: 'info',
      trip_reminder: 'warning',
      general: 'info',
      payment_approved: 'success',
      payment_rejected: 'error',
      info: 'info',
      success: 'success',
      warning: 'warning',
      error: 'error'
    };

    return mapping[type] || 'info';
  }

  static async getById(id) {
    const sql = 'SELECT * FROM notifications WHERE id = ?';
    const rows = await query(sql, [id]);
    return rows[0];
  }

  static async getByUserId(userId, page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    const sql = `
      SELECT *
      FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    const notifications = await query(sql, [userId, limit, offset]);

    const countResult = await query(
      'SELECT COUNT(*) as total FROM notifications WHERE user_id = ?',
      [userId]
    );
    const total = countResult[0]?.total || 0;

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async getUnreadCount(userId) {
    const sql = 'SELECT COUNT(*) as unread_count FROM notifications WHERE user_id = ? AND is_read = FALSE';
    const rows = await query(sql, [userId]);
    return rows[0]?.unread_count || 0;
  }

  static async markAsRead(id, userId) {
    const sql = `
      UPDATE notifications
      SET is_read = TRUE
      WHERE id = ? AND user_id = ?
    `;
    await query(sql, [id, userId]);
    return await this.getById(id);
  }
}

module.exports = Notification;

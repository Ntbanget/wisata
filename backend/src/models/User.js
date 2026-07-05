const { pool, query } = require('./database');

class User {
  static async getPasswordColumnName() {
    try {
      const rows = await query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'password_hash'");
      return rows.length > 0 ? 'password_hash' : 'password';
    } catch (error) {
      return 'password_hash';
    }
  }

  // Create new user
  static async create(userData) {
    const { name, email, password_hash, phone, role = 'user' } = userData;
    const passwordColumn = await this.getPasswordColumnName();
    const sql = `
      INSERT INTO users (name, email, ${passwordColumn}, phone, role)
      VALUES (?, ?, ?, ?, ?)
    `;
    try {
      const [result] = await pool.execute(sql, [name, email, password_hash, phone, role]);
      return result.insertId;
    } catch (error) {
      console.error('User.create error:', error);
      throw error;
    }
  }

  // Get user by ID
  static async getById(id) {
    const sql = 'SELECT * FROM users WHERE id = ?';
    const users = await query(sql, [id]);
    return users[0];
  }

  // Get user by email
  static async getByEmail(email) {
    const sql = 'SELECT * FROM users WHERE email = ?';
    const users = await query(sql, [email]);
    return users[0];
  }

  // Get all users with pagination
  static async getAll(page = 1, limit = 20, role = null) {
    const offset = (page - 1) * limit;
    let sql = 'SELECT * FROM users';
    const params = [];

    if (role) {
      sql += ' WHERE role = ?';
      params.push(role);
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const users = await query(sql, params);

    // Get total count
    let countSql = 'SELECT COUNT(*) as total FROM users';
    const countParams = [];

    if (role) {
      countSql += ' WHERE role = ?';
      countParams.push(role);
    }

    const countResult = await query(countSql, countParams);
    const total = countResult[0].total;
    
    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  // Update user
  static async update(id, updateData) {
    const fields = [];
    const values = [];

    if (updateData.name !== undefined) {
      fields.push('name = ?');
      values.push(updateData.name);
    }
    if (updateData.email !== undefined) {
      fields.push('email = ?');
      values.push(updateData.email);
    }
    if (updateData.password_hash !== undefined) {
      const passwordColumn = await this.getPasswordColumnName();
      fields.push(`${passwordColumn} = ?`);
      values.push(updateData.password_hash);
    }
    if (updateData.phone !== undefined) {
      fields.push('phone = ?');
      values.push(updateData.phone);
    }
    if (updateData.role !== undefined) {
      fields.push('role = ?');
      values.push(updateData.role);
    }

    if (fields.length === 0) {
      return await this.getById(id);
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const sql = 'UPDATE users SET ' + fields.join(', ') + ' WHERE id = ?';
    await query(sql, values);
    return await this.getById(id);
  }

  // Delete user
  static async delete(id) {
    const sql = 'DELETE FROM users WHERE id = ?';
    await query(sql, [id]);
  }

  // Get user statistics
  static async getStats() {
    const sql = `
      SELECT
        COUNT(*) as total_users,
        SUM(CASE WHEN role = 'user' THEN 1 ELSE 0 END) as users,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admins,
        SUM(CASE WHEN role = 'customer' THEN 1 ELSE 0 END) as customers
      FROM users
    `;

    console.log("=== DASHBOARD CUSTOMER SQL ===", sql);

    const result = await query(sql);

    console.log("=== DASHBOARD CUSTOMER RESULT ===", result[0]);

    return result[0];
  }
}

module.exports = User;
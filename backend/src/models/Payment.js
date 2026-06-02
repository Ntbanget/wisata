const { query } = require('./database');

class Payment {
  // Create new payment
  static async create(paymentData) {
    const { booking_id, user_id, amount, payment_method, proof_image, status = 'pending' } = paymentData;
    const sql = `
      INSERT INTO payments (booking_id, user_id, amount, payment_method, proof_image, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await query(sql, [booking_id, user_id, amount, payment_method, proof_image, status]);
    return result.insertId;
  }

  // Get payment by ID
  static async getById(id) {
    const sql = 'SELECT * FROM payments WHERE id = ?';
    const [payments] = await query(sql, [id]);
    return payments[0];
  }

  // Get payments by booking ID
  static async getByBookingId(bookingId) {
    const sql = 'SELECT * FROM payments WHERE booking_id = ? ORDER BY created_at DESC';
    const [payments] = await query(sql, [bookingId]);
    return payments;
  }

  // Get payments by user ID
  static async getByUserId(userId, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const sql = `
      SELECT * FROM payments 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `;
    const [payments] = await query(sql, [userId, limit, offset]);
    
    // Get total count
    const [countResult] = await query('SELECT COUNT(*) as total FROM payments WHERE user_id = ?', [userId]);
    const total = countResult.total;
    
    return {
      payments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  // Get payments by status
  static async getByStatus(status, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const sql = `
      SELECT * FROM payments 
      WHERE status = ? 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `;
    const [payments] = await query(sql, [status, limit, offset]);
    
    // Get total count
    const [countResult] = await query('SELECT COUNT(*) as total FROM payments WHERE status = ?', [status]);
    const total = countResult.total;
    
    return {
      payments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  // Update payment status
  static async updateStatus(id, status, verifiedBy = null) {
    const sql = `
      UPDATE payments 
      SET status = ?, verified_by = ?, verified_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    await query(sql, [status, verifiedBy, id]);
    return await this.getById(id);
  }

  // Update payment
  static async update(id, updateData) {
    const fields = [];
    const values = [];

    if (updateData.booking_id !== undefined) {
      fields.push('booking_id = ?');
      values.push(updateData.booking_id);
    }
    if (updateData.user_id !== undefined) {
      fields.push('user_id = ?');
      values.push(updateData.user_id);
    }
    if (updateData.amount !== undefined) {
      fields.push('amount = ?');
      values.push(updateData.amount);
    }
    if (updateData.payment_method !== undefined) {
      fields.push('payment_method = ?');
      values.push(updateData.payment_method);
    }
    if (updateData.proof_image !== undefined) {
      fields.push('proof_image = ?');
      values.push(updateData.proof_image);
    }
    if (updateData.status !== undefined) {
      fields.push('status = ?');
      values.push(updateData.status);
    }

    if (fields.length === 0) {
      return await this.getById(id);
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const sql = 'UPDATE payments SET ' + fields.join(', ') + ' WHERE id = ?';
    await query(sql, values);
    return await this.getById(id);
  }

  // Delete payment
  static async delete(id) {
    const sql = 'DELETE FROM payments WHERE id = ?';
    await query(sql, [id]);
  }

  // Get payment statistics
  static async getStats(startDate = null, endDate = null) {
    let sql = `
      SELECT 
        COUNT(*) as total_payments,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'waiting_verification' THEN 1 ELSE 0 END) as waiting_verification,
        SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paid,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
        SUM(CASE WHEN status = 'refunded' THEN 1 ELSE 0 END) as refunded,
        SUM(amount) as total_amount,
        SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as total_paid
      FROM payments
    `;
    const params = [];

    if (startDate && endDate) {
      sql += ' WHERE created_at BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    const [result] = await query(sql, params);
    return result;
  }
}

module.exports = Payment;
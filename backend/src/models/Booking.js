const { query, transaction } = require('./database');

class Booking {
  // Create new booking with details
  static async create(bookingData) {
    return await transaction(async (connection) => {
      // Insert booking with new fields
      const bookingSql = `
        INSERT INTO bookings (user_name, email, city_id, total_price, budget, status, user_id, vehicle_id, guide_id, payment_method, payment_status, trip_date, nights, total_rooms, people_count)
        VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, 'pending', ?, ?, ?, ?)
      `;
      const [bookingResult] = await connection.execute(bookingSql, [
        bookingData.user_name,
        bookingData.email,
        bookingData.city_id,
        bookingData.total_price,
        bookingData.budget,
        bookingData.user_id || null,
        bookingData.vehicle_id || null,
        bookingData.guide_id || null,
        bookingData.payment_method || 'transfer',
        bookingData.trip_date || null,
        bookingData.nights || 1,
        bookingData.total_rooms || 1,
        bookingData.people_count || 1
      ]);
      
      const bookingId = bookingResult.insertId;
      
      // Insert booking details
      const detailSql = `
        INSERT INTO booking_details (booking_id, hotel_id, tourist_place_id, quantity, price_per_item)
        VALUES (?, ?, ?, ?, ?)
      `;
      
      // Insert hotel detail
      if (bookingData.hotel_id) {
        await connection.execute(detailSql, [
          bookingId,
          bookingData.hotel_id,
          null,
          1,
          bookingData.hotel_price
        ]);
      }
      
      // Insert tourist place details
      if (bookingData.tourist_places && bookingData.tourist_places.length > 0) {
        for (const place of bookingData.tourist_places) {
          await connection.execute(detailSql, [
            bookingId,
            null,
            place.id,
            1,
            place.ticket_price
          ]);
        }
      }
      
      return await this.getById(bookingId);
    });
  }

  // Get booking by ID with full details
  static async getById(id) {
    const sql = `
      SELECT 
        b.id,
        b.user_name,
        b.email,
        b.city_id,
        c.name as city_name,
        b.total_price,
        b.budget,
        b.status as booking_status,
        b.user_id,
        b.vehicle_id,
        b.guide_id,
        b.payment_method,
        b.payment_status,
        b.payment_proof,
        b.admin_notes,
        b.trip_date,
        b.nights,
        b.total_rooms,
        b.people_count,
        b.created_at,
        b.updated_at
      FROM bookings b
      JOIN cities c ON b.city_id = c.id
      WHERE b.id = ?
    `;
    const bookings = await query(sql, [id]);
    
    if (bookings.length === 0) return null;
    
    const booking = bookings[0];
    
    // Get booking details
    const detailsSql = `
      SELECT 
        bd.id as detail_id,
        bd.hotel_id,
        h.name as hotel_name,
        h.price_per_night,
        h.rating as hotel_rating,
        h.category as hotel_category,
        h.lat as hotel_lat,
        h.lng as hotel_lng,
        h.image_url as hotel_image_url,
        h.description as hotel_description,
        bd.tourist_place_id,
        tp.name as place_name,
        tp.ticket_price,
        tp.category as place_category,
        tp.lat as place_lat,
        tp.lng as place_lng,
        tp.image_url as place_image_url,
        tp.description as place_description,
        bd.quantity,
        bd.price_per_item
      FROM booking_details bd
      LEFT JOIN hotels h ON bd.hotel_id = h.id
      LEFT JOIN tourist_places tp ON bd.tourist_place_id = tp.id
      WHERE bd.booking_id = ?
      ORDER BY bd.id
    `;
    booking.details = await query(detailsSql, [id]);
    
    return booking;
  }

  // Get all bookings (with pagination)
  static async getAll(page = 1, limit = 20, status = null) {
    const offset = (page - 1) * limit;
    
    let sql = `
      SELECT 
        b.id,
        b.user_name,
        b.email,
        b.city_id,
        c.name as city_name,
        b.total_price,
        b.budget,
        b.status as booking_status,
        b.user_id,
        b.vehicle_id,
        b.guide_id,
        b.payment_method,
        b.payment_status,
        b.payment_proof,
        b.admin_notes,
        b.trip_date,
        b.nights,
        b.total_rooms,
        b.people_count,
        b.created_at,
        b.updated_at
      FROM bookings b
      JOIN cities c ON b.city_id = c.id
    `;
    const params = [];
    
    if (status) {
      sql += ` WHERE b.status = ?`;
      params.push(status);
    }
    
    sql += ` ORDER BY b.created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);
    
    const bookings = await query(sql, params);
    
    // Get total count
    let countSql = `SELECT COUNT(*) as total FROM bookings b`;
    const countParams = [];
    
    if (status) {
      countSql += ` WHERE b.status = ?`;
      countParams.push(status);
    }
    
    const countResult = await query(countSql, countParams);
    const total = countResult[0].total;
    
    return {
      bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  // Get bookings by user email
  static async getByEmail(email, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const sql = `
      SELECT 
        b.id,
        b.user_name,
        b.email,
        b.city_id,
        c.name as city_name,
        b.total_price,
        b.budget,
        b.status as booking_status,
        b.user_id,
        b.vehicle_id,
        b.guide_id,
        b.payment_method,
        b.payment_status,
        b.payment_proof,
        b.admin_notes,
        b.trip_date,
        b.nights,
        b.total_rooms,
        b.people_count,
        b.created_at,
        b.updated_at
      FROM bookings b
      JOIN cities c ON b.city_id = c.id
      WHERE b.email = ?
      ORDER BY b.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const bookings = await query(sql, [email, limit, offset]);
    
    // Get total count
    const countSql = `SELECT COUNT(*) as total FROM bookings WHERE email = ?`;
    const countResult = await query(countSql, [email]);
    const total = countResult[0].total;
    
    return {
      bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  // Update booking status
  static async updateStatus(id, status) {
    const sql = `
      UPDATE bookings 
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    await query(sql, [status, id]);
    return await this.getById(id);
  }

  // Update booking payment status
  static async updatePaymentStatus(id, paymentStatus, adminNotes = null) {
    const sql = `
      UPDATE bookings 
      SET payment_status = ?, admin_notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    await query(sql, [paymentStatus, adminNotes, id]);
    return await this.getById(id);
  }

  // Update booking with new fields
  static async update(id, updateData) {
    const fields = [];
    const values = [];

    if (updateData.user_id !== undefined) {
      fields.push('user_id = ?');
      values.push(updateData.user_id);
    }
    if (updateData.vehicle_id !== undefined) {
      fields.push('vehicle_id = ?');
      values.push(updateData.vehicle_id);
    }
    if (updateData.guide_id !== undefined) {
      fields.push('guide_id = ?');
      values.push(updateData.guide_id);
    }
    if (updateData.payment_method !== undefined) {
      fields.push('payment_method = ?');
      values.push(updateData.payment_method);
    }
    if (updateData.payment_status !== undefined) {
      fields.push('payment_status = ?');
      values.push(updateData.payment_status);
    }
    if (updateData.payment_proof !== undefined) {
      fields.push('payment_proof = ?');
      values.push(updateData.payment_proof);
    }
    if (updateData.admin_notes !== undefined) {
      fields.push('admin_notes = ?');
      values.push(updateData.admin_notes);
    }
    if (updateData.trip_date !== undefined) {
      fields.push('trip_date = ?');
      values.push(updateData.trip_date);
    }
    if (updateData.nights !== undefined) {
      fields.push('nights = ?');
      values.push(updateData.nights);
    }
    if (updateData.total_rooms !== undefined) {
      fields.push('total_rooms = ?');
      values.push(updateData.total_rooms);
    }
    if (updateData.people_count !== undefined) {
      fields.push('people_count = ?');
      values.push(updateData.people_count);
    }

    if (fields.length === 0) {
      return await this.getById(id);
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const sql = 'UPDATE bookings SET ' + fields.join(', ') + ' WHERE id = ?';
    await query(sql, values);
    return await this.getById(id);
  }

  // Get bookings by user ID (new method for authenticated users)
  static async getByUserId(userId, page = 1, limit = 20, status = null) {
    const offset = (page - 1) * limit;
    
    let sql = `
      SELECT 
        b.id,
        b.user_name,
        b.email,
        b.city_id,
        c.name as city_name,
        b.total_price,
        b.budget,
        b.status as booking_status,
        b.user_id,
        b.vehicle_id,
        b.guide_id,
        b.payment_method,
        b.payment_status,
        b.payment_proof,
        b.admin_notes,
        b.trip_date,
        b.nights,
        b.total_rooms,
        b.people_count,
        b.created_at,
        b.updated_at
      FROM bookings b
      JOIN cities c ON b.city_id = c.id
      WHERE b.user_id = ?
    `;
    const params = [userId];
    
    if (status) {
      sql += ' AND b.status = ?';
      params.push(status);
    }
    
    sql += ' ORDER BY b.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    const bookings = await query(sql, params);
    
    // Get total count
    let countSql = 'SELECT COUNT(*) as total FROM bookings b WHERE b.user_id = ?';
    const countParams = [userId];
    
    if (status) {
      countSql += ' AND b.status = ?';
      countParams.push(status);
    }
    
    const countResult = await query(countSql, countParams);
    const total = countResult[0].total;
    
    return {
      bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  // Cancel booking
  static async cancel(id) {
    return await this.updateStatus(id, 'cancelled');
  }

  // Confirm booking
  static async confirm(id) {
    return await this.updateStatus(id, 'confirmed');
  }

  // Get booking statistics
  static async getStats(cityId = null, startDate = null, endDate = null) {
    let sql = `
      SELECT 
        COUNT(*) as total_bookings,
        SUM(total_price) as total_revenue,
        AVG(total_price) as avg_booking_value,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_bookings,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_bookings,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_bookings
      FROM bookings
    `;
    const params = [];
    
    const conditions = [];
    
    if (cityId) {
      conditions.push('city_id = ?');
      params.push(cityId);
    }
    
    if (startDate) {
      conditions.push('created_at >= ?');
      params.push(startDate);
    }
    
    if (endDate) {
      conditions.push('created_at <= ?');
      params.push(endDate);
    }
    
    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }
    
    const result = await query(sql, params);
    return result[0];
  }

  // Get popular destinations (with graceful fallback when there are no bookings yet —
  // e.g. right after a fresh data rebuild — so the home-page cards still appear).
  static async getPopularDestinations(limit = 10) {
    const sql = `
      SELECT
        tp.id,
        tp.name,
        tp.category,
        tp.city_id,
        c.name AS city_name,
        COUNT(bd.id) AS booking_count,
        COALESCE(SUM(bd.quantity), 0) AS total_visits
      FROM tourist_places tp
      JOIN cities c ON tp.city_id = c.id
      LEFT JOIN booking_details bd
        ON bd.tourist_place_id = tp.id
      GROUP BY tp.id, tp.name, tp.category, tp.city_id, c.name
      ORDER BY booking_count DESC, total_visits DESC, tp.ticket_price DESC, tp.id ASC
      LIMIT ?
    `;
    return await query(sql, [limit]);
  }

  // Get popular hotels (with graceful fallback when there are no bookings yet).
  static async getPopularHotels(limit = 10) {
    const sql = `
      SELECT
        h.id,
        h.name,
        h.category,
        h.rating,
        h.city_id,
        c.name AS city_name,
        COUNT(bd.id) AS booking_count,
        AVG(COALESCE(bd.price_per_item, h.price_per_night)) AS avg_price_paid
      FROM hotels h
      JOIN cities c ON h.city_id = c.id
      LEFT JOIN booking_details bd
        ON bd.hotel_id = h.id
      GROUP BY h.id, h.name, h.category, h.rating, h.city_id, c.name, h.price_per_night
      ORDER BY booking_count DESC, h.rating DESC, h.id ASC
      LIMIT ?
    `;
    return await query(sql, [limit]);
  }

  // Delete booking (admin function)
  static async delete(id) {
    return await transaction(async (connection) => {
      // Delete booking details first
      await connection.execute('DELETE FROM booking_details WHERE booking_id = ?', [id]);
      
      // Delete booking
      const [result] = await connection.execute('DELETE FROM bookings WHERE id = ?', [id]);
      
      return result.affectedRows > 0;
    });
  }
}

module.exports = Booking;

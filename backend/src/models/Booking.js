const { query, transaction } = require('./database');

class Booking {
  // Create new booking with details
  static async create(bookingData) {
    return await transaction(async (connection) => {
      // Insert booking
      const bookingSql = `
        INSERT INTO bookings (user_name, email, city_id, total_price, budget, status)
        VALUES (?, ?, ?, ?, ?, 'pending')
      `;
      const [bookingResult] = await connection.execute(bookingSql, [
        bookingData.user_name,
        bookingData.email,
        bookingData.city_id,
        bookingData.total_price,
        bookingData.budget
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
        b.status,
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
        b.status,
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
        b.status,
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

  // Get popular destinations
  static async getPopularDestinations(limit = 10) {
    const sql = `
      SELECT 
        tp.id,
        tp.name,
        tp.category,
        tp.city_id,
        c.name as city_name,
        COUNT(bd.id) as booking_count,
        SUM(bd.quantity) as total_visits
      FROM booking_details bd
      JOIN tourist_places tp ON bd.tourist_place_id = tp.id
      JOIN cities c ON tp.city_id = c.id
      WHERE bd.tourist_place_id IS NOT NULL
      GROUP BY tp.id, tp.name, tp.category, tp.city_id, c.name
      ORDER BY booking_count DESC, total_visits DESC
      LIMIT ?
    `;
    return await query(sql, [limit]);
  }

  // Get popular hotels
  static async getPopularHotels(limit = 10) {
    const sql = `
      SELECT 
        h.id,
        h.name,
        h.category,
        h.rating,
        h.city_id,
        c.name as city_name,
        COUNT(bd.id) as booking_count,
        AVG(bd.price_per_item) as avg_price_paid
      FROM booking_details bd
      JOIN hotels h ON bd.hotel_id = h.id
      JOIN cities c ON h.city_id = c.id
      WHERE bd.hotel_id IS NOT NULL
      GROUP BY h.id, h.name, h.category, h.rating, h.city_id, c.name
      ORDER BY booking_count DESC
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

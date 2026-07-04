const { query, transaction } = require('./database');

class Booking {
  // Create new booking with details
  static async create(bookingData) {
    try {
      console.log("=== BOOKING.CREATE() START ===");
      console.log("bookingData:", JSON.stringify(bookingData, null, 2));

      return await transaction(async (connection) => {
        // Destructure hotel_id, tourist_places, payment data, and user info
        const { hotel_id, tourist_places, payment_proof, payment_method, total_price, user_id, user_name, email } = bookingData;

      // Create or get customer
      let customerId = user_id;
      if (!customerId && email) {
        console.log("=== EXECUTING STEP: customer_creation ===");
        try {
          const [existingCustomer] = await connection.execute(
            'SELECT id FROM users WHERE email = ?',
            [email.toLowerCase()]
          );
          if (existingCustomer.length > 0) {
            customerId = existingCustomer[0].id;
            console.log("=== CUSTOMER FOUND === customerId:", customerId);
          } else {
            const customerSql = `
              INSERT INTO users (name, email, role, created_at)
              VALUES (?, ?, 'customer', CURRENT_TIMESTAMP)
            `;
            const [customerResult] = await connection.execute(customerSql, [user_name, email.toLowerCase()]);
            customerId = customerResult.insertId;
            console.log("=== CUSTOMER CREATED === customerId:", customerId);
          }
        } catch (error) {
          console.error("=== CUSTOMER CREATION FAILED ===", error.message);
          throw error;
        }
      }

      // Insert booking with PENDING_PAYMENT status
      const bookingSql = `
        INSERT INTO bookings (user_name, email, city_id, total_price, budget, status, user_id, vehicle_id, guide_id, payment_method, payment_status, payment_proof, trip_date, nights, total_rooms, people_count, vehicle_mode)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, ?, ?, ?, ?, ?)
      `;
      const [bookingResult] = await connection.execute(bookingSql, [
        bookingData.user_name,
        bookingData.email,
        bookingData.city_id,
        bookingData.total_price,
        bookingData.budget,
        'PENDING_PAYMENT', // Always set to PENDING_PAYMENT initially
        customerId || null, // Use customerId instead of user_id
        bookingData.vehicle_id || null,
        bookingData.guide_id || null,
        bookingData.payment_method || 'transfer',
        bookingData.payment_proof || null,
        bookingData.trip_date || null,
        bookingData.nights || 1,
        bookingData.total_rooms || 1,
        bookingData.people_count || 1,
        bookingData.vehicle_mode || 'automatic'
      ]);

      const bookingId = bookingResult.insertId;
      console.log("=== BOOKING ID GENERATED ===");
      console.log("bookingId:", bookingId);

      // Validate city_id exists
      if (bookingData.city_id) {
        const [cityCheck] = await connection.execute(
          'SELECT id FROM cities WHERE id = ?',
          [bookingData.city_id]
        );
        if (cityCheck.length === 0) {
          throw new Error(`City with id ${bookingData.city_id} not found`);
        }
      }

      // Validate hotel_id exists
      if (hotel_id) {
        const [hotelCheck] = await connection.execute(
          'SELECT id FROM hotels WHERE id = ?',
          [hotel_id]
        );
        if (hotelCheck.length === 0) {
          throw new Error(`Hotel with id ${hotel_id} not found`);
        }
      }

      // Validate tourist_place_ids exist
      if (tourist_places && tourist_places.length > 0) {
        for (const place of tourist_places) {
          if (place.id) {
            const [placeCheck] = await connection.execute(
              'SELECT id FROM tourist_places WHERE id = ?',
              [place.id]
            );
            if (placeCheck.length === 0) {
              throw new Error(`Tourist place with id ${place.id} not found`);
            }
          }
        }
      }

      // Insert booking details
      const detailSql = `
        INSERT INTO booking_details (booking_id, hotel_id, tourist_place_id, quantity, price_per_item)
        VALUES (?, ?, ?, ?, ?)
      `;

      // Insert hotel detail
      if (hotel_id) {
        try {
          console.log("=== EXECUTING QUERY ===");
          console.log("STEP:", "booking_details_hotel");
          console.log("SQL:", detailSql);
          const values = [
            bookingId,
            hotel_id,
            null,
            1,
            bookingData.hotel_price
          ];
          console.log("VALUES:", values);
          await connection.execute(detailSql, values);
          console.log("=== QUERY SUCCESS ===");
          console.log("STEP:", "booking_details_hotel");
        } catch (error) {
          console.error("=== QUERY FAILED ===");
          console.error("STEP:", "booking_details_hotel");
          console.error("MESSAGE:", error.message);
          console.error("CODE:", error.code);
          console.error("SQL MESSAGE:", error.sqlMessage);
          console.error("SQL:", error.sql);
          console.error("VALUES:", values);
          throw error;
        }
      }

      // Insert tourist place details
      if (tourist_places && tourist_places.length > 0) {
        try {
          console.log("=== EXECUTING QUERY ===");
          console.log("STEP:", "booking_details_tourist_places");
          console.log("SQL:", detailSql);
          for (const place of tourist_places) {
            console.log("bookingId:", bookingId);
            console.log("hotel_id:", hotel_id);
            console.log("place:", place);
            console.log("place.id:", place?.id);
            console.log("place.ticket_price:", place?.ticket_price);

            if (!place || !place.id) {
              console.error("=== ERROR: place is null or place.id is null ===");
              throw new Error('Invalid tourist place: missing id');
            }

            const values = [
              bookingId,
              hotel_id,
              place.id,
              1,
              place.ticket_price
            ];
            console.log("VALUES:", values);
            await connection.execute(detailSql, values);
          }
          console.log("=== QUERY SUCCESS ===");
          console.log("STEP:", "booking_details_tourist_places");
        } catch (error) {
          console.error("=== QUERY FAILED ===");
          console.error("STEP:", "booking_details_tourist_places");
          console.error("MESSAGE:", error.message);
          console.error("CODE:", error.code);
          console.error("SQL MESSAGE:", error.sqlMessage);
          console.error("SQL:", error.sql);
          throw error;
        }
      }

      // Insert custom vehicle details if provided
      if (bookingData.custom_vehicles && bookingData.custom_vehicles.length > 0) {
        try {
          const vehicleDetailSql = `
            INSERT INTO booking_vehicle_details (booking_id, vehicle_id, quantity, price_per_day)
            VALUES (?, ?, ?, ?)
          `;
          console.log("=== EXECUTING QUERY ===");
          console.log("STEP:", "booking_vehicle_details");
          console.log("SQL:", vehicleDetailSql);

          for (const customVehicle of bookingData.custom_vehicles) {
            const values = [
              bookingId,
              customVehicle.vehicle_id,
              customVehicle.quantity,
              0 // price_per_day will be calculated from vehicle data
            ];
            console.log("VALUES:", values);
            await connection.execute(vehicleDetailSql, values);
          }
          console.log("=== QUERY SUCCESS ===");
          console.log("STEP:", "booking_vehicle_details");
        } catch (error) {
          console.error("=== QUERY FAILED ===");
          console.error("STEP:", "booking_vehicle_details");
          console.error("MESSAGE:", error.message);
          console.error("CODE:", error.code);
          console.error("SQL MESSAGE:", error.sqlMessage);
          console.error("SQL:", error.sql);
          throw error;
        }
      }

      // Payment should be created separately via PaymentController
      // to maintain single responsibility and avoid duplicate payments
      console.log("=== PAYMENT CREATION SKIPPED - Use PaymentController.createPayment() ===");

      console.log("=== READY TO COMMIT TRANSACTION ===");
      console.log("bookingId:", bookingId);

      // Return booking object directly from bookingData with the generated ID
      // This avoids potential issues with getById() not finding the newly created booking
      const result = {
        id: bookingId,
        ...bookingData,
        status: 'PENDING_PAYMENT',
        payment_status: 'PENDING',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log("=== TRANSACTION COMMITTED SUCCESSFULLY ===");
      console.log("Returning booking with ID:", result.id);
      return result;
    });
    } catch (err) {
      console.error("===== BOOKING MODEL CRASH =====");
      console.error(err);
      console.error(err.stack);
      throw err;
    }
  }

  // Get booking by ID with full details
  static async getById(id) {
    console.log("=== GETBYID START ===");
    console.log("id:", id);

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
        b.user_id,
        b.vehicle_id,
        v.name as vehicle_name,
        v.category as vehicle_type,
        v.capacity as vehicle_capacity,
        v.price_per_day as vehicle_price_per_day,
        v.image_url as vehicle_image_url,
        b.guide_id,
        tg.name as guide_name,
        tg.rating as guide_rating,
        tg.price_per_day as guide_price_per_day,
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
      LEFT JOIN vehicles v ON b.vehicle_id = v.id
      LEFT JOIN tour_guides tg ON b.guide_id = tg.id
      WHERE b.id = ?
    `;
    const bookings = await query(sql, [id]);

    console.log("bookings.length:", bookings.length);
    console.log("bookings:", JSON.stringify(bookings, null, 2));

    if (bookings.length === 0) {
      console.log("=== GETBYID RETURNING NULL ===");
      return null;
    }

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
        b.user_id,
        b.payment_method,
        b.payment_status,
        b.payment_proof_url as payment_proof,
        b.payment_notes as admin_notes,
        b.created_at,
        b.updated_at
      FROM bookings b
      JOIN cities c ON b.city_id = c.id
      WHERE b.status != 'PENDING_PAYMENT'
    `;
    const params = [];

    if (status) {
      sql += ` AND b.status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY b.created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const bookings = await query(sql, params);
    
    // Get total count
    let countSql = `SELECT COUNT(*) as total FROM bookings b WHERE b.status != 'PENDING_PAYMENT'`;
    const countParams = [];

    if (status) {
      countSql += ` AND b.status = ?`;
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
        b.status,
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
    return await this.updateStatus(id, 'CANCELLED');
  }

  // Confirm booking
  static async confirm(id) {
    return await this.updateStatus(id, 'CONFIRMED');
  }

  // Get booking statistics
  static async getStats(cityId = null, startDate = null, endDate = null) {
    let sql = `
      SELECT
        COUNT(CASE WHEN status = 'CONFIRMED' THEN 1 END) as total_bookings,
        SUM(CASE WHEN status = 'CONFIRMED' THEN total_price ELSE 0 END) as total_revenue,
        AVG(CASE WHEN status = 'CONFIRMED' THEN total_price ELSE NULL END) as avg_booking_value,
        COUNT(CASE WHEN status = 'CONFIRMED' THEN 1 END) as confirmed_bookings,
        COUNT(CASE WHEN status = 'PENDING_PAYMENT' THEN 1 END) as pending_payment_bookings,
        COUNT(CASE WHEN status = 'CANCELLED' THEN 1 END) as cancelled_bookings
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

const { query } = require('./database');

class Hotel {
  // Get hotels by city ID
  static async getByCity(cityId) {
    const sql = `
      SELECT h.id, h.name, h.city_id, h.price_per_night, h.rating, h.category,
             h.lat, h.lng, h.image_url, h.description, h.created_at,
             c.name AS city_name
      FROM hotels h
      LEFT JOIN cities c ON c.id = h.city_id
      WHERE h.city_id = ?
      ORDER BY h.rating DESC, h.price_per_night ASC
    `;
    return await query(sql, [cityId]);
  }

  // Get hotels by city and budget
  static async getByCityAndBudget(cityId, budget) {
    const sql = `
      SELECT h.id, h.name, h.city_id, h.price_per_night, h.rating, h.category,
             h.lat, h.lng, h.image_url, h.description, h.created_at,
             c.name AS city_name
      FROM hotels h
      LEFT JOIN cities c ON c.id = h.city_id
      WHERE h.city_id = ? AND h.price_per_night <= ?
      ORDER BY h.rating DESC, h.price_per_night ASC
    `;
    return await query(sql, [cityId, budget]);
  }

  // Get hotels by category
  static async getByCategory(cityId, category) {
    const sql = `
      SELECT h.id, h.name, h.city_id, h.price_per_night, h.rating, h.category,
             h.lat, h.lng, h.image_url, h.description, h.created_at,
             c.name AS city_name
      FROM hotels h
      LEFT JOIN cities c ON c.id = h.city_id
      WHERE h.city_id = ? AND h.category = ?
      ORDER BY h.rating DESC, h.price_per_night ASC
    `;
    return await query(sql, [cityId, category]);
  }

  // Get best hotel within budget
  static async getBestInBudget(cityId, budget) {
    const sql = `
      SELECT h.id, h.name, h.city_id, h.price_per_night, h.rating, h.category,
             h.lat, h.lng, h.image_url, h.description, h.created_at,
             c.name AS city_name
      FROM hotels h
      LEFT JOIN cities c ON c.id = h.city_id
      WHERE h.city_id = ? AND h.price_per_night <= ?
      ORDER BY h.rating DESC, h.price_per_night ASC
      LIMIT 1
    `;
    const hotels = await query(sql, [cityId, budget]);
    return hotels[0] || null;
  }

  // Get hotel by ID
  static async getById(id) {
    const sql = `
      SELECT h.id, h.name, h.city_id, h.price_per_night, h.rating, h.category,
             h.lat, h.lng, h.image_url, h.description, h.created_at,
             c.name AS city_name
      FROM hotels h
      LEFT JOIN cities c ON c.id = h.city_id
      WHERE h.id = ?
    `;
    const hotels = await query(sql, [id]);
    return hotels[0] || null;
  }

  // Get hotels with price range analysis
  static async getPriceRange(cityId) {
    const sql = `
      SELECT 
        category,
        MIN(price_per_night) as min_price,
        MAX(price_per_night) as max_price,
        AVG(price_per_night) as avg_price,
        COUNT(*) as count
      FROM hotels 
      WHERE city_id = ?
      GROUP BY category
      ORDER BY category
    `;
    return await query(sql, [cityId]);
  }

  // Search hotels
  static async search(cityId, searchTerm, category = null, minPrice = null, maxPrice = null) {
    let sql = `
      SELECT h.id, h.name, h.city_id, h.price_per_night, h.rating, h.category,
             h.lat, h.lng, h.image_url, h.description, h.created_at,
             c.name AS city_name
      FROM hotels h
      LEFT JOIN cities c ON c.id = h.city_id
      WHERE h.city_id = ?
    `;
    const params = [cityId];

    if (searchTerm) {
      sql += ` AND (h.name LIKE ? OR h.description LIKE ?)`;
      params.push(`%${searchTerm}%`, `%${searchTerm}%`);
    }

    if (category) {
      sql += ` AND h.category = ?`;
      params.push(category);
    }

    if (minPrice) {
      sql += ` AND h.price_per_night >= ?`;
      params.push(minPrice);
    }

    if (maxPrice) {
      sql += ` AND h.price_per_night <= ?`;
      params.push(maxPrice);
    }

    sql += ` ORDER BY h.rating DESC, h.price_per_night ASC`;

    return await query(sql, params);
  }

  // Create new hotel (admin function)
  static async create(hotelData) {
    const sql = `
      INSERT INTO hotels (name, city_id, price_per_night, rating, category, 
                         lat, lng, image_url, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await query(sql, [
      hotelData.name,
      hotelData.city_id,
      hotelData.price_per_night,
      hotelData.rating,
      hotelData.category,
      (hotelData.lat !== undefined && hotelData.lat !== null) ? hotelData.lat : 0.0,
      (hotelData.lng !== undefined && hotelData.lng !== null) ? hotelData.lng : 0.0,
      hotelData.image_url,
      hotelData.description
    ]);
    return await this.getById(result.insertId);
  }

  // Update hotel (admin function)
  static async update(id, hotelData) {
    const sql = `
      UPDATE hotels 
      SET name = ?, city_id = ?, price_per_night = ?, rating = ?, 
          category = ?, lat = ?, lng = ?, image_url = ?, description = ?
      WHERE id = ?
    `;
    await query(sql, [
      hotelData.name,
      hotelData.city_id,
      hotelData.price_per_night,
      hotelData.rating,
      hotelData.category,
      (hotelData.lat !== undefined && hotelData.lat !== null) ? hotelData.lat : 0.0,
      (hotelData.lng !== undefined && hotelData.lng !== null) ? hotelData.lng : 0.0,
      hotelData.image_url,
      hotelData.description,
      id
    ]);
    return await this.getById(id);
  }

  // Get all cities that have hotels
  static async getAllCities() {
    const sql = `
      SELECT DISTINCT city_id 
      FROM hotels 
      ORDER BY city_id
    `;
    return await query(sql);
  }

  // Delete hotel (admin function)
  static async delete(id) {
    const sql = `DELETE FROM hotels WHERE id = ?`;
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  }
}

module.exports = Hotel;

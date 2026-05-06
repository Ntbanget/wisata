const { query } = require('./database');

class Hotel {
  // Get hotels by city ID
  static async getByCity(cityId) {
    const sql = `
      SELECT id, name, city_id, price_per_night, rating, category, 
             lat, lng, image_url, description, created_at
      FROM hotels 
      WHERE city_id = ?
      ORDER BY rating DESC, price_per_night ASC
    `;
    return await query(sql, [cityId]);
  }

  // Get hotels by city and budget
  static async getByCityAndBudget(cityId, budget) {
    const sql = `
      SELECT id, name, city_id, price_per_night, rating, category, 
             lat, lng, image_url, description, created_at
      FROM hotels 
      WHERE city_id = ? AND price_per_night <= ?
      ORDER BY rating DESC, price_per_night ASC
    `;
    return await query(sql, [cityId, budget]);
  }

  // Get hotels by category
  static async getByCategory(cityId, category) {
    const sql = `
      SELECT id, name, city_id, price_per_night, rating, category, 
             lat, lng, image_url, description, created_at
      FROM hotels 
      WHERE city_id = ? AND category = ?
      ORDER BY rating DESC, price_per_night ASC
    `;
    return await query(sql, [cityId, category]);
  }

  // Get best hotel within budget
  static async getBestInBudget(cityId, budget) {
    const sql = `
      SELECT id, name, city_id, price_per_night, rating, category, 
             lat, lng, image_url, description, created_at
      FROM hotels 
      WHERE city_id = ? AND price_per_night <= ?
      ORDER BY rating DESC, price_per_night ASC
      LIMIT 1
    `;
    const hotels = await query(sql, [cityId, budget]);
    return hotels[0] || null;
  }

  // Get hotel by ID
  static async getById(id) {
    const sql = `
      SELECT id, name, city_id, price_per_night, rating, category, 
             lat, lng, image_url, description, created_at
      FROM hotels 
      WHERE id = ?
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
      SELECT id, name, city_id, price_per_night, rating, category, 
             lat, lng, image_url, description, created_at
      FROM hotels 
      WHERE city_id = ?
    `;
    const params = [cityId];

    if (searchTerm) {
      sql += ` AND (name LIKE ? OR description LIKE ?)`;
      params.push(`%${searchTerm}%`, `%${searchTerm}%`);
    }

    if (category) {
      sql += ` AND category = ?`;
      params.push(category);
    }

    if (minPrice) {
      sql += ` AND price_per_night >= ?`;
      params.push(minPrice);
    }

    if (maxPrice) {
      sql += ` AND price_per_night <= ?`;
      params.push(maxPrice);
    }

    sql += ` ORDER BY rating DESC, price_per_night ASC`;

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
      hotelData.lat,
      hotelData.lng,
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
      hotelData.lat,
      hotelData.lng,
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

const { query } = require('./database');

class City {
  // Get all cities
  static async getAll() {
    const sql = `
      SELECT id, name, created_at 
      FROM cities 
      ORDER BY name ASC
    `;
    return await query(sql);
  }

  // Get city by ID
  static async getById(id) {
    const sql = `
      SELECT id, name, created_at 
      FROM cities 
      WHERE id = ?
    `;
    const cities = await query(sql, [id]);
    return cities[0] || null;
  }

  // Get city with related data (hotels and tourist places count)
  static async getWithStats(id) {
    const sql = `
      SELECT 
        c.id,
        c.name,
        COUNT(DISTINCT h.id) as hotels_count,
        COUNT(DISTINCT tp.id) as tourist_places_count,
        MIN(h.price_per_night) as min_hotel_price,
        MAX(h.price_per_night) as max_hotel_price,
        MIN(tp.ticket_price) as min_ticket_price,
        MAX(tp.ticket_price) as max_ticket_price
      FROM cities c
      LEFT JOIN hotels h ON c.id = h.city_id
      LEFT JOIN tourist_places tp ON c.id = tp.city_id
      WHERE c.id = ?
      GROUP BY c.id, c.name
    `;
    const cities = await query(sql, [id]);
    return cities[0] || null;
  }

  // Create new city (admin function)
  static async create(cityData) {
    const sql = `
      INSERT INTO cities (name) 
      VALUES (?)
    `;
    const result = await query(sql, [cityData.name]);
    return await this.getById(result.insertId);
  }

  // Update city (admin function)
  static async update(id, cityData) {
    const sql = `
      UPDATE cities 
      SET name = ? 
      WHERE id = ?
    `;
    await query(sql, [cityData.name, id]);
    return await this.getById(id);
  }

  // Delete city (admin function)
  static async delete(id) {
    const sql = `DELETE FROM cities WHERE id = ?`;
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  }
}

module.exports = City;

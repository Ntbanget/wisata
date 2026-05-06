const { query } = require('./database');

class TouristPlace {
  // Get tourist places by city ID
  static async getByCity(cityId) {
    const sql = `
      SELECT id, name, city_id, ticket_price, category, 
             lat, lng, image_url, description, created_at
      FROM tourist_places 
      WHERE city_id = ?
      ORDER BY category, ticket_price ASC
    `;
    return await query(sql, [cityId]);
  }

  // Get tourist places by city and budget
  static async getByCityAndBudget(cityId, budget) {
    const sql = `
      SELECT id, name, city_id, ticket_price, category, 
             lat, lng, image_url, description, created_at
      FROM tourist_places 
      WHERE city_id = ? AND ticket_price <= ?
      ORDER BY category, ticket_price ASC
    `;
    return await query(sql, [cityId, budget]);
  }

  // Get tourist places by category
  static async getByCategory(cityId, category) {
    const sql = `
      SELECT id, name, city_id, ticket_price, category, 
             lat, lng, image_url, description, created_at
      FROM tourist_places 
      WHERE city_id = ? AND category = ?
      ORDER BY ticket_price ASC
    `;
    return await query(sql, [cityId, category]);
  }

  // Get best combination within budget
  static async getBestCombination(cityId, budget, maxPlaces = 4) {
    const sql = `
      SELECT id, name, city_id, ticket_price, category, 
             lat, lng, image_url, description, created_at
      FROM tourist_places 
      WHERE city_id = ? AND ticket_price <= ?
      ORDER BY 
        CASE 
          WHEN category = 'Historical' THEN 1
          WHEN category = 'Nature' THEN 2
          WHEN category = 'Cultural' THEN 3
          WHEN category = 'Beach' THEN 4
          ELSE 5
        END,
        ticket_price ASC
      LIMIT ?
    `;
    return await query(sql, [cityId, budget, maxPlaces]);
  }

  // Get tourist place by ID
  static async getById(id) {
    const sql = `
      SELECT id, name, city_id, ticket_price, category, 
             lat, lng, image_url, description, created_at
      FROM tourist_places 
      WHERE id = ?
    `;
    const places = await query(sql, [id]);
    return places[0] || null;
  }

  // Get multiple places by IDs
  static async getByIds(ids) {
    if (!ids || ids.length === 0) return [];
    
    const placeholders = ids.map(() => '?').join(',');
    const sql = `
      SELECT id, name, city_id, ticket_price, category, 
             lat, lng, image_url, description, created_at
      FROM tourist_places 
      WHERE id IN (${placeholders})
      ORDER BY category, ticket_price ASC
    `;
    return await query(sql, ids);
  }

  // Get categories in city
  static async getCategories(cityId) {
    const sql = `
      SELECT DISTINCT category, COUNT(*) as count
      FROM tourist_places 
      WHERE city_id = ?
      GROUP BY category
      ORDER BY category
    `;
    return await query(sql, [cityId]);
  }

  // Get price range analysis
  static async getPriceRange(cityId) {
    const sql = `
      SELECT 
        category,
        MIN(ticket_price) as min_price,
        MAX(ticket_price) as max_price,
        AVG(ticket_price) as avg_price,
        COUNT(*) as count
      FROM tourist_places 
      WHERE city_id = ?
      GROUP BY category
      ORDER BY category
    `;
    return await query(sql, [cityId]);
  }

  // Search tourist places
  static async search(cityId, searchTerm, category = null, minPrice = null, maxPrice = null) {
    let sql = `
      SELECT id, name, city_id, ticket_price, category, 
             lat, lng, image_url, description, created_at
      FROM tourist_places 
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
      sql += ` AND ticket_price >= ?`;
      params.push(minPrice);
    }

    if (maxPrice) {
      sql += ` AND ticket_price <= ?`;
      params.push(maxPrice);
    }

    sql += ` ORDER BY category, ticket_price ASC`;

    return await query(sql, params);
  }

  // Get popular places (by category priority)
  static async getPopular(cityId, limit = 10) {
    const sql = `
      SELECT id, name, city_id, ticket_price, category, 
             lat, lng, image_url, description, created_at
      FROM tourist_places 
      WHERE city_id = ?
      ORDER BY 
        CASE 
          WHEN category = 'Historical' THEN 1
          WHEN category = 'Nature' THEN 2
          WHEN category = 'Cultural' THEN 3
          ELSE 4
        END,
        ticket_price ASC
      LIMIT ?
    `;
    return await query(sql, [cityId, limit]);
  }

  // Create new tourist place (admin function)
  static async create(placeData) {
    const sql = `
      INSERT INTO tourist_places (name, city_id, ticket_price, category, 
                                lat, lng, image_url, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await query(sql, [
      placeData.name,
      placeData.city_id,
      placeData.ticket_price,
      placeData.category,
      placeData.lat,
      placeData.lng,
      placeData.image_url,
      placeData.description
    ]);
    return await this.getById(result.insertId);
  }

  // Update tourist place (admin function)
  static async update(id, placeData) {
    const sql = `
      UPDATE tourist_places 
      SET name = ?, city_id = ?, ticket_price = ?, category = ?, 
          lat = ?, lng = ?, image_url = ?, description = ?
      WHERE id = ?
    `;
    await query(sql, [
      placeData.name,
      placeData.city_id,
      placeData.ticket_price,
      placeData.category,
      placeData.lat,
      placeData.lng,
      placeData.image_url,
      placeData.description,
      id
    ]);
    return await this.getById(id);
  }

  // Get all cities that have tourist places
  static async getAllCities() {
    const sql = `
      SELECT DISTINCT city_id 
      FROM tourist_places 
      ORDER BY city_id
    `;
    return await query(sql);
  }

  // Delete tourist place (admin function)
  static async delete(id) {
    const sql = `DELETE FROM tourist_places WHERE id = ?`;
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  }
}

module.exports = TouristPlace;

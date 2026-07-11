const { query } = require('./database');

function parseJson(value) {
  if (value === null || value === undefined) return null;
  if (Array.isArray(value)) return value;
  if (typeof value === 'object') return value;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch (error) {
      return value;
    }
  }
  return value;
}

class Package {
  static async create(packageData) {
    const sql = `
      INSERT INTO packages (
        user_id,
        city_id,
        hotel_id,
        tourist_place_ids,
        name,
        budget,
        people_count,
        nights,
        preferences,
        generated_itinerary,
        total_estimated_cost,
        status,
        created_by,
        is_saved,
        is_booked,
        booking_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      packageData.user_id || null,
      packageData.city_id,
      packageData.hotel_id || null,
      packageData.tourist_place_ids ? JSON.stringify(packageData.tourist_place_ids) : null,
      packageData.name,
      packageData.budget,
      packageData.people_count,
      packageData.nights,
      packageData.preferences ? JSON.stringify(packageData.preferences) : null,
      packageData.generated_itinerary ? JSON.stringify(packageData.generated_itinerary) : null,
      packageData.total_estimated_cost,
      packageData.status || 'draft',
      packageData.created_by || null,
      packageData.is_saved !== undefined ? (packageData.is_saved ? 1 : 0) : 0,
      packageData.is_booked !== undefined ? (packageData.is_booked ? 1 : 0) : 0,
      packageData.booking_id || null
    ];

    const result = await query(sql, params);
    return this.getById(result.insertId);
  }

  static async update(id, packageData) {
    const allowedFields = [
      'user_id',
      'city_id',
      'hotel_id',
      'tourist_place_ids',
      'name',
      'budget',
      'people_count',
      'nights',
      'preferences',
      'generated_itinerary',
      'total_estimated_cost',
      'status',
      'created_by',
      'is_saved',
      'is_booked',
      'booking_id'
    ];

    const setClauses = [];
    const params = [];

    for (const field of allowedFields) {
      if (packageData[field] !== undefined) {
        let value = packageData[field];
        if (field === 'tourist_place_ids' || field === 'preferences' || field === 'generated_itinerary') {
          value = value !== null ? JSON.stringify(value) : null;
        }
        if (field === 'is_saved' || field === 'is_booked') {
          value = value ? 1 : 0;
        }
        setClauses.push(`${field} = ?`);
        params.push(value);
      }
    }

    if (setClauses.length === 0) {
      return this.getById(id);
    }

    const sql = `UPDATE packages SET ${setClauses.join(', ')} WHERE id = ?`;
    params.push(id);

    await query(sql, params);
    return this.getById(id);
  }

  static async delete(id) {
    const sql = 'DELETE FROM packages WHERE id = ?';
    return await query(sql, [id]);
  }

  static async getById(id) {
    const sql = 'SELECT * FROM packages WHERE id = ?';
    const rows = await query(sql, [id]);
    return rows.length > 0 ? this.parseRow(rows[0]) : null;
  }

  static async getAllByAdmin(status = null) {
    let sql = 'SELECT * FROM packages';
    const params = [];

    if (status) {
      sql += ' WHERE status = ?';
      params.push(status);
    }

    sql += ' ORDER BY created_at DESC';

    const rows = await query(sql, params);
    return rows.map(this.parseRow);
  }

  static async getPublishedByCity(cityId) {
    const sql = `
      SELECT *
      FROM packages
      WHERE city_id = ? AND status = 'published'
      ORDER BY created_at DESC
    `;
    const rows = await query(sql, [cityId]);
    return rows.map(this.parseRow);
  }

  static parseRow(row) {
    return {
      ...row,
      tourist_place_ids: parseJson(row.tourist_place_ids),
      preferences: parseJson(row.preferences),
      generated_itinerary: parseJson(row.generated_itinerary)
    };
  }
}

module.exports = Package;

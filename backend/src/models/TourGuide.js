const { query } = require('./database');

class TourGuide {
  // Create new tour guide
  static async create(guideData) {
    const { name, specialization, experience_years, languages, price_per_day, image_url, bio, rating = 0, is_available = true } = guideData;
    const sql = `
      INSERT INTO tour_guides (name, specialization, experience_years, languages, price_per_day, image_url, bio, rating, is_available)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await query(sql, [name, specialization, experience_years, languages, price_per_day, image_url, bio, rating, is_available]);
    return result.insertId;
  }

  // Get tour guide by ID
  static async getById(id) {
    const sql = 'SELECT * FROM tour_guides WHERE id = ?';
    const [guides] = await query(sql, [id]);
    return guides[0];
  }

  // Get all tour guides
  static async getAll() {
    const sql = 'SELECT * FROM tour_guides WHERE is_available = true ORDER BY rating DESC';
    const guides = await query(sql);
    return guides;
  }

  // Get tour guides by specialization
  static async getBySpecialization(specialization) {
    const sql = 'SELECT * FROM tour_guides WHERE specialization = ? AND is_available = true ORDER BY rating DESC';
    const guides = await query(sql, [specialization]);
    return guides;
  }

  // Get top-rated tour guides
  static async getTopRated(limit = 5) {
    const sql = 'SELECT * FROM tour_guides WHERE is_available = true ORDER BY rating DESC LIMIT ?';
    const guides = await query(sql, [limit]);
    return guides;
  }

  // Update tour guide
  static async update(id, updateData) {
    const fields = [];
    const values = [];

    if (updateData.name !== undefined) {
      fields.push('name = ?');
      values.push(updateData.name);
    }
    if (updateData.specialization !== undefined) {
      fields.push('specialization = ?');
      values.push(updateData.specialization);
    }
    if (updateData.experience_years !== undefined) {
      fields.push('experience_years = ?');
      values.push(updateData.experience_years);
    }
    if (updateData.languages !== undefined) {
      fields.push('languages = ?');
      values.push(updateData.languages);
    }
    if (updateData.price_per_day !== undefined) {
      fields.push('price_per_day = ?');
      values.push(updateData.price_per_day);
    }
    if (updateData.image_url !== undefined) {
      fields.push('image_url = ?');
      values.push(updateData.image_url);
    }
    if (updateData.bio !== undefined) {
      fields.push('bio = ?');
      values.push(updateData.bio);
    }
    if (updateData.rating !== undefined) {
      fields.push('rating = ?');
      values.push(updateData.rating);
    }
    if (updateData.is_available !== undefined) {
      fields.push('is_available = ?');
      values.push(updateData.is_available);
    }

    if (fields.length === 0) {
      return await this.getById(id);
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const sql = 'UPDATE tour_guides SET ' + fields.join(', ') + ' WHERE id = ?';
    await query(sql, values);
    return await this.getById(id);
  }

  // Update tour guide rating
  static async updateRating(id, rating) {
    const sql = 'UPDATE tour_guides SET rating = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    await query(sql, [rating, id]);
    return await this.getById(id);
  }

  // Delete tour guide
  static async delete(id) {
    const sql = 'DELETE FROM tour_guides WHERE id = ?';
    await query(sql, [id]);
  }
}

module.exports = TourGuide;
const { query } = require('./database');

class Vehicle {
  // Create new vehicle
  static async create(vehicleData) {
    const { name, category, capacity, price_per_day, image_url, description, available = true } = vehicleData;
    const sql = `
      INSERT INTO vehicles (name, category, capacity, price_per_day, image_url, description, available)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await query(sql, [name, category, capacity, price_per_day, image_url, description, available]);
    return result.insertId;
  }

  // Get vehicle by ID
  static async getById(id) {
    const sql = 'SELECT * FROM vehicles WHERE id = ?';
    const [vehicles] = await query(sql, [id]);
    return vehicles[0];
  }

  // Get all vehicles
  static async getAll() {
    const sql = 'SELECT * FROM vehicles WHERE available = true ORDER BY category, capacity';
    const [vehicles] = await query(sql);
    return vehicles;
  }

  // Get vehicles by capacity range
  static async getByCapacity(minCapacity, maxCapacity) {
    const sql = 'SELECT * FROM vehicles WHERE capacity >= ? AND capacity <= ? AND available = true ORDER BY capacity';
    const [vehicles] = await query(sql, [minCapacity, maxCapacity]);
    return vehicles;
  }

  // Get recommended vehicle based on people count
  static async getRecommendedVehicle(peopleCount) {
    let category;
    
    if (peopleCount <= 4) {
      category = 'normal';
    } else if (peopleCount <= 10) {
      category = 'hiace';
    } else if (peopleCount <= 18) {
      category = 'elf';
    } else {
      category = 'bus';
    }

    const sql = 'SELECT * FROM vehicles WHERE category = ? AND capacity >= ? AND available = true ORDER BY capacity ASC LIMIT 1';
    const [vehicles] = await query(sql, [category, peopleCount]);
    return vehicles[0];
  }

  // Update vehicle
  static async update(id, updateData) {
    const fields = [];
    const values = [];

    if (updateData.name !== undefined) {
      fields.push('name = ?');
      values.push(updateData.name);
    }
    if (updateData.category !== undefined) {
      fields.push('category = ?');
      values.push(updateData.category);
    }
    if (updateData.capacity !== undefined) {
      fields.push('capacity = ?');
      values.push(updateData.capacity);
    }
    if (updateData.price_per_day !== undefined) {
      fields.push('price_per_day = ?');
      values.push(updateData.price_per_day);
    }
    if (updateData.image_url !== undefined) {
      fields.push('image_url = ?');
      values.push(updateData.image_url);
    }
    if (updateData.description !== undefined) {
      fields.push('description = ?');
      values.push(updateData.description);
    }
    if (updateData.available !== undefined) {
      fields.push('available = ?');
      values.push(updateData.available);
    }

    if (fields.length === 0) {
      return await this.getById(id);
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const sql = 'UPDATE vehicles SET ' + fields.join(', ') + ' WHERE id = ?';
    await query(sql, values);
    return await this.getById(id);
  }

  // Delete vehicle
  static async delete(id) {
    const sql = 'DELETE FROM vehicles WHERE id = ?';
    await query(sql, [id]);
  }
}

module.exports = Vehicle;
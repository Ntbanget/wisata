const Vehicle = require('../models/Vehicle');

class VehicleController {
  // Get all vehicles (public)
  static async getAllVehicles(req, res) {
    try {
      console.log('=== GET /api/vehicles ===');
      console.log('SQL: SELECT * FROM vehicles WHERE is_active = 1 ORDER BY category, capacity');
      const vehicles = await Vehicle.getAll();
      console.log('RESULT: Found', vehicles.length, 'vehicles');
      res.json({
        success: true,
        data: vehicles,
        count: vehicles.length
      });
    } catch (error) {
      console.error('Get all vehicles error:', error);
      res.status(500).json({
        error: 'Failed to fetch vehicles',
        message: error.message
      });
    }
  }

  // Get vehicle by ID (public)
  static async getVehicleById(req, res) {
    try {
      const { id } = req.params;
      const vehicle = await Vehicle.getById(id);

      if (!vehicle) {
        return res.status(404).json({
          error: 'Vehicle not found'
        });
      }

      res.json({
        success: true,
        data: vehicle
      });
    } catch (error) {
      console.error('Get vehicle error:', error);
      res.status(500).json({
        error: 'Failed to fetch vehicle',
        message: error.message
      });
    }
  }

  // Get vehicles by capacity (public)
  static async getVehiclesByCapacity(req, res) {
    try {
      const { minCapacity, maxCapacity } = req.params;
      const vehicles = await Vehicle.getByCapacity(minCapacity, maxCapacity);

      res.json({
        success: true,
        data: vehicles,
        count: vehicles.length
      });
    } catch (error) {
      console.error('Get vehicles by capacity error:', error);
      res.status(500).json({
        error: 'Failed to fetch vehicles',
        message: error.message
      });
    }
  }

  // Get recommended vehicle (public)
  static async getRecommendedVehicle(req, res) {
    try {
      const { people_count } = req.query;
      const vehicle = await Vehicle.getRecommendedVehicle(people_count);

      if (!vehicle) {
        return res.status(404).json({
          error: 'No suitable vehicle found'
        });
      }

      res.json({
        success: true,
        data: vehicle
      });
    } catch (error) {
      console.error('Get recommended vehicle error:', error);
      res.status(500).json({
        error: 'Failed to fetch recommended vehicle',
        message: error.message
      });
    }
  }

  // Create vehicle (admin only)
  static async createVehicle(req, res) {
    try {
      const { name, category, capacity, price_per_day, image_url, description, is_active } = req.body;

      // Handle uploaded image
      let finalImageUrl = image_url;
      if (req.file) {
        finalImageUrl = `/assets/vehicles/${req.file.filename}`;
      }

      // Validate input
      if (!name || !category || !capacity || !price_per_day) {
        return res.status(400).json({
          error: 'Missing required fields',
          message: 'Name, category, capacity, and price per day are required'
        });
      }

      const vehicleId = await Vehicle.create({
        name,
        category,
        capacity,
        price_per_day,
        image_url: finalImageUrl,
        description,
        is_active: is_active !== undefined ? is_active : 1
      });

      const vehicle = await Vehicle.getById(vehicleId);

      res.status(201).json({
        success: true,
        message: 'Vehicle created successfully',
        data: vehicle
      });
    } catch (error) {
      console.error('Create vehicle error:', error);
      res.status(500).json({
        error: 'Failed to create vehicle',
        message: error.message
      });
    }
  }

  // Update vehicle (admin only)
  static async updateVehicle(req, res) {
    try {
      const { id } = req.params;
      const { name, category, capacity, price_per_day, image_url, description, is_active } = req.body;

      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (category !== undefined) updateData.category = category;
      if (capacity !== undefined) updateData.capacity = capacity;
      if (price_per_day !== undefined) updateData.price_per_day = price_per_day;

      // Handle uploaded image
      if (req.file) {
        updateData.image_url = `/assets/vehicles/${req.file.filename}`;
      } else if (image_url !== undefined) {
        updateData.image_url = image_url;
      }

      if (description !== undefined) updateData.description = description;
      if (is_active !== undefined) updateData.is_active = is_active;

      await Vehicle.update(id, updateData);
      const vehicle = await Vehicle.getById(id);

      res.json({
        success: true,
        message: 'Vehicle updated successfully',
        data: vehicle
      });
    } catch (error) {
      console.error('Update vehicle error:', error);
      res.status(500).json({
        error: 'Failed to update vehicle',
        message: error.message
      });
    }
  }

  // Delete vehicle (admin only)
  static async deleteVehicle(req, res) {
    try {
      const { id } = req.params;
      await Vehicle.delete(id);

      res.json({
        success: true,
        message: 'Vehicle deleted successfully'
      });
    } catch (error) {
      console.error('Delete vehicle error:', error);
      res.status(500).json({
        error: 'Failed to delete vehicle',
        message: error.message
      });
    }
  }
}

module.exports = VehicleController;
const City = require('../models/City');
const validator = require('validator');

class CityController {
  // Get all cities
  static async getAllCities(req, res) {
    try {
      const cities = await City.getAll();
      
      res.json({
        success: true,
        data: cities,
        count: cities.length
      });
    } catch (error) {
      console.error('Error fetching cities:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch cities',
        message: error.message
      });
    }
  }

  // Get city by ID
  static async getCityById(req, res) {
    try {
      const { id } = req.params;
      
      if (!validator.isInt(id, { min: 1 })) {
        return res.status(400).json({
          success: false,
          error: 'Invalid city ID'
        });
      }

      const city = await City.getById(id);
      
      if (!city) {
        return res.status(404).json({
          success: false,
          error: 'City not found'
        });
      }

      res.json({
        success: true,
        data: city
      });
    } catch (error) {
      console.error('Error fetching city:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch city',
        message: error.message
      });
    }
  }

  // Get city with statistics
  static async getCityWithStats(req, res) {
    try {
      const { id } = req.params;
      
      if (!validator.isInt(id, { min: 1 })) {
        return res.status(400).json({
          success: false,
          error: 'Invalid city ID'
        });
      }

      const city = await City.getWithStats(id);
      
      if (!city) {
        return res.status(404).json({
          success: false,
          error: 'City not found'
        });
      }

      res.json({
        success: true,
        data: city
      });
    } catch (error) {
      console.error('Error fetching city stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch city statistics',
        message: error.message
      });
    }
  }

  // Create new city (admin only)
  static async createCity(req, res) {
    try {
      const { name } = req.body;
      
      if (!name || name.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'City name is required'
        });
      }

      if (name.length > 100) {
        return res.status(400).json({
          success: false,
          error: 'City name too long (max 100 characters)'
        });
      }

      const cityData = {
        name: name.trim()
      };

      const newCity = await City.create(cityData);
      
      res.status(201).json({
        success: true,
        data: newCity,
        message: 'City created successfully'
      });
    } catch (error) {
      console.error('Error creating city:', error);
      
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
          success: false,
          error: 'City already exists'
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Failed to create city',
        message: error.message
      });
    }
  }

  // Update city (admin only)
  static async updateCity(req, res) {
    try {
      const { id } = req.params;
      const { name } = req.body;
      
      if (!validator.isInt(id, { min: 1 })) {
        return res.status(400).json({
          success: false,
          error: 'Invalid city ID'
        });
      }

      if (!name || name.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'City name is required'
        });
      }

      if (name.length > 100) {
        return res.status(400).json({
          success: false,
          error: 'City name too long (max 100 characters)'
        });
      }

      const cityData = {
        name: name.trim()
      };

      const updatedCity = await City.update(id, cityData);
      
      if (!updatedCity) {
        return res.status(404).json({
          success: false,
          error: 'City not found'
        });
      }

      res.json({
        success: true,
        data: updatedCity,
        message: 'City updated successfully'
      });
    } catch (error) {
      console.error('Error updating city:', error);
      
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
          success: false,
          error: 'City name already exists'
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Failed to update city',
        message: error.message
      });
    }
  }

  // Delete city (admin only)
  static async deleteCity(req, res) {
    try {
      const { id } = req.params;
      
      if (!validator.isInt(id, { min: 1 })) {
        return res.status(400).json({
          success: false,
          error: 'Invalid city ID'
        });
      }

      const deleted = await City.delete(id);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: 'City not found'
        });
      }

      res.json({
        success: true,
        message: 'City deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting city:', error);
      
      if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete city: referenced by hotels or tourist places'
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Failed to delete city',
        message: error.message
      });
    }
  }
}

module.exports = CityController;

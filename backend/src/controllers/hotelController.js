const Hotel = require('../models/Hotel');
const validator = require('validator');

class HotelController {
  // Get all hotels
  static async getAllHotels(req, res) {
    try {
      const { city_id, category, min_price, max_price, limit = 100 } = req.query;
      
      let hotels;
      
      if (city_id) {
        // Filter by city
        if (category) {
          hotels = await Hotel.getByCategory(city_id, category);
        } else {
          hotels = await Hotel.getByCity(city_id);
        }
      } else {
        // Get all hotels from all cities
        const cities = await Hotel.getAllCities();
        hotels = [];
        for (const city of cities) {
          const cityHotels = await Hotel.getByCity(city.city_id);
          hotels = hotels.concat(cityHotels);
        }
      }
      
      // Apply price filters if provided
      if (min_price || max_price) {
        hotels = hotels.filter(hotel => {
          if (min_price && hotel.price_per_night < parseFloat(min_price)) return false;
          if (max_price && hotel.price_per_night > parseFloat(max_price)) return false;
          return true;
        });
      }
      
      // Apply limit
      if (limit) {
        hotels = hotels.slice(0, parseInt(limit));
      }
      
      res.json({
        success: true,
        data: hotels,
        count: hotels.length
      });
    } catch (error) {
      console.error('Error fetching hotels:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch hotels',
        message: error.message
      });
    }
  }

  // Get hotels by city
  static async getHotelsByCity(req, res) {
    try {
      const { cityId } = req.params;
      
      if (!validator.isInt(cityId, { min: 1 })) {
        return res.status(400).json({
          success: false,
          error: 'Invalid city ID'
        });
      }

      const hotels = await Hotel.getByCity(cityId);
      
      res.json({
        success: true,
        data: hotels,
        count: hotels.length
      });
    } catch (error) {
      console.error('Error fetching hotels by city:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch hotels',
        message: error.message
      });
    }
  }

  // Get hotel by ID
  static async getHotelById(req, res) {
    try {
      const { id } = req.params;

      if (!validator.isInt(id, { min: 1 })) {
        return res.status(400).json({
          success: false,
          error: 'Invalid hotel ID'
        });
      }

      const hotel = await Hotel.getById(id);

      if (!hotel) {
        return res.status(404).json({
          success: false,
          error: 'Hotel not found'
        });
      }

      res.json({
        success: true,
        data: hotel
      });
    } catch (error) {
      console.error('Error fetching hotel:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch hotel',
        message: error.message
      });
    }
  }

  // Create new hotel (admin only)
  static async createHotel(req, res) {
    try {
      const { city_id, name, category, description, price_per_night, image_url, address, rating } = req.body;

      // Validation
      if (!city_id || !validator.isInt(String(city_id), { min: 1 })) {
        return res.status(400).json({
          success: false,
          error: 'Invalid or missing city ID'
        });
      }

      if (!name || !validator.isLength(name, { min: 2, max: 100 })) {
        return res.status(400).json({
          success: false,
          error: 'Hotel name must be between 2 and 100 characters'
        });
      }

      if (!category || !['low', 'medium', 'high'].includes(category)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid category. Must be low, medium, or high'
        });
      }

      if (price_per_night === undefined || price_per_night === null || !validator.isFloat(String(price_per_night), { min: 0 })) {
        return res.status(400).json({
          success: false,
          error: 'Invalid price per night'
        });
      }

      const hotel = await Hotel.create({
        city_id,
        name,
        category,
        description: description || null,
        price_per_night,
        image_url: image_url || null,
        address: address || null,
        rating: rating || 0.0
      });

      res.status(201).json({
        success: true,
        data: hotel,
        message: 'Hotel created successfully'
      });
    } catch (error) {
      console.error('Error creating hotel:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create hotel',
        message: error.message
      });
    }
  }

  // Update hotel (admin only)
  static async updateHotel(req, res) {
    try {
      const { id } = req.params;
      const { city_id, name, category, description, price_per_night, image_url, address, rating } = req.body;

      if (!validator.isInt(id, { min: 1 })) {
        return res.status(400).json({
          success: false,
          error: 'Invalid hotel ID'
        });
      }

      // Check if hotel exists
      const existingHotel = await Hotel.getById(id);
      if (!existingHotel) {
        return res.status(404).json({
          success: false,
          error: 'Hotel not found'
        });
      }

      // Validation
      if (city_id !== undefined && !validator.isInt(String(city_id), { min: 1 })) {
        return res.status(400).json({
          success: false,
          error: 'Invalid city ID'
        });
      }

      if (name !== undefined && !validator.isLength(name, { min: 2, max: 100 })) {
        return res.status(400).json({
          success: false,
          error: 'Hotel name must be between 2 and 100 characters'
        });
      }

      if (category !== undefined && !['low', 'medium', 'high'].includes(category)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid category. Must be low, medium, or high'
        });
      }

      if (price_per_night !== undefined && price_per_night !== null && !validator.isFloat(String(price_per_night), { min: 0 })) {
        return res.status(400).json({
          success: false,
          error: 'Invalid price per night'
        });
      }

      const updatedHotel = await Hotel.update(id, {
        city_id: city_id || existingHotel.city_id,
        name: name || existingHotel.name,
        category: category || existingHotel.category,
        description: description !== undefined ? description : existingHotel.description,
        price_per_night: price_per_night || existingHotel.price_per_night,
        image_url: image_url !== undefined ? image_url : existingHotel.image_url,
        address: address !== undefined ? address : existingHotel.address,
        rating: rating !== undefined ? rating : existingHotel.rating
      });

      res.json({
        success: true,
        data: updatedHotel,
        message: 'Hotel updated successfully'
      });
    } catch (error) {
      console.error('Error updating hotel:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update hotel',
        message: error.message
      });
    }
  }

  // Delete hotel (admin only)
  static async deleteHotel(req, res) {
    try {
      const { id } = req.params;

      if (!validator.isInt(id, { min: 1 })) {
        return res.status(400).json({
          success: false,
          error: 'Invalid hotel ID'
        });
      }

      // Check if hotel exists
      const existingHotel = await Hotel.getById(id);
      if (!existingHotel) {
        return res.status(404).json({
          success: false,
          error: 'Hotel not found'
        });
      }

      await Hotel.delete(id);

      res.json({
        success: true,
        message: 'Hotel deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting hotel:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete hotel',
        message: error.message
      });
    }
  }
}

module.exports = HotelController;

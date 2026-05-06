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
}

module.exports = HotelController;

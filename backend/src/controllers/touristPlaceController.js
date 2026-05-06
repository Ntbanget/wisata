const TouristPlace = require('../models/TouristPlace');
const validator = require('validator');

class TouristPlaceController {
  // Get all tourist places
  static async getAllTouristPlaces(req, res) {
    try {
      const { city_id, category, min_price, max_price, limit = 100 } = req.query;
      
      let places;
      
      if (city_id) {
        // Filter by city
        if (category) {
          places = await TouristPlace.getByCategory(city_id, category);
        } else {
          places = await TouristPlace.getByCity(city_id);
        }
      } else {
        // Get all places from all cities
        const cities = await TouristPlace.getAllCities();
        places = [];
        for (const city of cities) {
          const cityPlaces = await TouristPlace.getByCity(city.city_id);
          places = places.concat(cityPlaces);
        }
      }
      
      // Apply price filters if provided
      if (min_price || max_price) {
        places = places.filter(place => {
          if (min_price && place.ticket_price < parseFloat(min_price)) return false;
          if (max_price && place.ticket_price > parseFloat(max_price)) return false;
          return true;
        });
      }
      
      // Apply limit
      if (limit) {
        places = places.slice(0, parseInt(limit));
      }
      
      res.json({
        success: true,
        data: places,
        count: places.length
      });
    } catch (error) {
      console.error('Error fetching tourist places:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch tourist places',
        message: error.message
      });
    }
  }

  // Get tourist places by city
  static async getTouristPlacesByCity(req, res) {
    try {
      const { cityId } = req.params;
      
      if (!validator.isInt(cityId, { min: 1 })) {
        return res.status(400).json({
          success: false,
          error: 'Invalid city ID'
        });
      }

      const places = await TouristPlace.getByCity(cityId);
      
      res.json({
        success: true,
        data: places,
        count: places.length
      });
    } catch (error) {
      console.error('Error fetching tourist places by city:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch tourist places',
        message: error.message
      });
    }
  }

  // Get tourist place by ID
  static async getTouristPlaceById(req, res) {
    try {
      const { id } = req.params;
      
      if (!validator.isInt(id, { min: 1 })) {
        return res.status(400).json({
          success: false,
          error: 'Invalid tourist place ID'
        });
      }

      const place = await TouristPlace.getById(id);
      
      if (!place) {
        return res.status(404).json({
          success: false,
          error: 'Tourist place not found'
        });
      }

      res.json({
        success: true,
        data: place
      });
    } catch (error) {
      console.error('Error fetching tourist place:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch tourist place',
        message: error.message
      });
    }
  }
}

module.exports = TouristPlaceController;

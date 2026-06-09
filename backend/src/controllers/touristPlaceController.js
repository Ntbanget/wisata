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

  // Create new tourist place (admin only)
  static async createTouristPlace(req, res) {
    try {
      const { city_id, name, category, description, ticket_price, image_url, latitude, longitude, opening_hours, rating } = req.body;

      // Validation
      if (!city_id || !validator.isInt(city_id, { min: 1 })) {
        return res.status(400).json({
          success: false,
          error: 'Invalid or missing city ID'
        });
      }

      if (!name || !validator.isLength(name, { min: 2, max: 100 })) {
        return res.status(400).json({
          success: false,
          error: 'Place name must be between 2 and 100 characters'
        });
      }

      const validCategories = ['Historical', 'Nature', 'Cultural', 'Beach', 'Religious', 'Adventure'];
      if (!category || !validCategories.includes(category)) {
        return res.status(400).json({
          success: false,
          error: `Invalid category. Must be one of: ${validCategories.join(', ')}`
        });
      }

      if (ticket_price !== undefined && !validator.isFloat(ticket_price, { min: 0 })) {
        return res.status(400).json({
          success: false,
          error: 'Invalid ticket price'
        });
      }

      if (latitude !== undefined && !validator.isFloat(latitude, { min: -90, max: 90 })) {
        return res.status(400).json({
          success: false,
          error: 'Invalid latitude'
        });
      }

      if (longitude !== undefined && !validator.isFloat(longitude, { min: -180, max: 180 })) {
        return res.status(400).json({
          success: false,
          error: 'Invalid longitude'
        });
      }

      const place = await TouristPlace.create({
        city_id,
        name,
        category,
        description: description || null,
        ticket_price: ticket_price || 0.00,
        image_url: image_url || null,
        latitude: latitude || null,
        longitude: longitude || null,
        opening_hours: opening_hours || null,
        rating: rating || 0.0
      });

      res.status(201).json({
        success: true,
        data: place,
        message: 'Tourist place created successfully'
      });
    } catch (error) {
      console.error('Error creating tourist place:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create tourist place',
        message: error.message
      });
    }
  }

  // Update tourist place (admin only)
  static async updateTouristPlace(req, res) {
    try {
      const { id } = req.params;
      const { city_id, name, category, description, ticket_price, image_url, latitude, longitude, opening_hours, rating } = req.body;

      if (!validator.isInt(id, { min: 1 })) {
        return res.status(400).json({
          success: false,
          error: 'Invalid tourist place ID'
        });
      }

      // Check if place exists
      const existingPlace = await TouristPlace.getById(id);
      if (!existingPlace) {
        return res.status(404).json({
          success: false,
          error: 'Tourist place not found'
        });
      }

      // Validation
      if (city_id !== undefined && !validator.isInt(city_id, { min: 1 })) {
        return res.status(400).json({
          success: false,
          error: 'Invalid city ID'
        });
      }

      if (name !== undefined && !validator.isLength(name, { min: 2, max: 100 })) {
        return res.status(400).json({
          success: false,
          error: 'Place name must be between 2 and 100 characters'
        });
      }

      const validCategories = ['Historical', 'Nature', 'Cultural', 'Beach', 'Religious', 'Adventure'];
      if (category !== undefined && !validCategories.includes(category)) {
        return res.status(400).json({
          success: false,
          error: `Invalid category. Must be one of: ${validCategories.join(', ')}`
        });
      }

      if (ticket_price !== undefined && !validator.isFloat(ticket_price, { min: 0 })) {
        return res.status(400).json({
          success: false,
          error: 'Invalid ticket price'
        });
      }

      if (latitude !== undefined && !validator.isFloat(latitude, { min: -90, max: 90 })) {
        return res.status(400).json({
          success: false,
          error: 'Invalid latitude'
        });
      }

      if (longitude !== undefined && !validator.isFloat(longitude, { min: -180, max: 180 })) {
        return res.status(400).json({
          success: false,
          error: 'Invalid longitude'
        });
      }

      const updatedPlace = await TouristPlace.update(id, {
        city_id: city_id || existingPlace.city_id,
        name: name || existingPlace.name,
        category: category || existingPlace.category,
        description: description !== undefined ? description : existingPlace.description,
        ticket_price: ticket_price !== undefined ? ticket_price : existingPlace.ticket_price,
        image_url: image_url !== undefined ? image_url : existingPlace.image_url,
        latitude: latitude !== undefined ? latitude : existingPlace.latitude,
        longitude: longitude !== undefined ? longitude : existingPlace.longitude,
        opening_hours: opening_hours !== undefined ? opening_hours : existingPlace.opening_hours,
        rating: rating !== undefined ? rating : existingPlace.rating
      });

      res.json({
        success: true,
        data: updatedPlace,
        message: 'Tourist place updated successfully'
      });
    } catch (error) {
      console.error('Error updating tourist place:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update tourist place',
        message: error.message
      });
    }
  }

  // Delete tourist place (admin only)
  static async deleteTouristPlace(req, res) {
    try {
      const { id } = req.params;

      if (!validator.isInt(id, { min: 1 })) {
        return res.status(400).json({
          success: false,
          error: 'Invalid tourist place ID'
        });
      }

      // Check if place exists
      const existingPlace = await TouristPlace.getById(id);
      if (!existingPlace) {
        return res.status(404).json({
          success: false,
          error: 'Tourist place not found'
        });
      }

      await TouristPlace.delete(id);

      res.json({
        success: true,
        message: 'Tourist place deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting tourist place:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete tourist place',
        message: error.message
      });
    }
  }
}

module.exports = TouristPlaceController;

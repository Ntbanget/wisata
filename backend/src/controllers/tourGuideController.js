const TourGuide = require('../models/TourGuide');

class TourGuideController {
  // Get all tour guides (public)
  static async getAllTourGuides(req, res) {
    try {
      const guides = await TourGuide.getAll();
      res.json({
        success: true,
        data: guides,
        count: guides.length
      });
    } catch (error) {
      console.error('Get all tour guides error:', error);
      res.status(500).json({
        error: 'Failed to fetch tour guides',
        message: error.message
      });
    }
  }

  // Get tour guide by ID (public)
  static async getTourGuideById(req, res) {
    try {
      const { id } = req.params;
      const guide = await TourGuide.getById(id);

      if (!guide) {
        return res.status(404).json({
          error: 'Tour guide not found'
        });
      }

      res.json({
        success: true,
        data: guide
      });
    } catch (error) {
      console.error('Get tour guide error:', error);
      res.status(500).json({
        error: 'Failed to fetch tour guide',
        message: error.message
      });
    }
  }

  // Get tour guides by specialization (public)
  static async getTourGuidesBySpecialization(req, res) {
    try {
      const { specialization } = req.params;
      const guides = await TourGuide.getBySpecialization(specialization);

      res.json({
        success: true,
        data: guides,
        count: guides.length
      });
    } catch (error) {
      console.error('Get tour guides by specialization error:', error);
      res.status(500).json({
        error: 'Failed to fetch tour guides',
        message: error.message
      });
    }
  }

  // Get top-rated tour guides (public)
  static async getTopRatedTourGuides(req, res) {
    try {
      const { limit = 5 } = req.query;
      const guides = await TourGuide.getTopRated(parseInt(limit));

      res.json({
        success: true,
        data: guides,
        count: guides.length
      });
    } catch (error) {
      console.error('Get top-rated tour guides error:', error);
      res.status(500).json({
        error: 'Failed to fetch tour guides',
        message: error.message
      });
    }
  }

  // Create tour guide (admin only)
  static async createTourGuide(req, res) {
    try {
      const { name, specialization, experience_years, languages, price_per_day, image_url, bio, rating } = req.body;

      // Validate input
      if (!name || !specialization || !price_per_day) {
        return res.status(400).json({
          error: 'Missing required fields',
          message: 'Name, specialization, and price per day are required'
        });
      }

      const guideId = await TourGuide.create({
        name,
        specialization,
        experience_years,
        languages,
        price_per_day,
        image_url,
        bio,
        rating: rating || 0
      });

      const guide = await TourGuide.getById(guideId);

      res.status(201).json({
        success: true,
        message: 'Tour guide created successfully',
        data: guide
      });
    } catch (error) {
      console.error('Create tour guide error:', error);
      res.status(500).json({
        error: 'Failed to create tour guide',
        message: error.message
      });
    }
  }

  // Update tour guide (admin only)
  static async updateTourGuide(req, res) {
    try {
      const { id } = req.params;
      const { name, specialization, experience_years, languages, price_per_day, image_url, bio, rating, available } = req.body;

      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (specialization !== undefined) updateData.specialization = specialization;
      if (experience_years !== undefined) updateData.experience_years = experience_years;
      if (languages !== undefined) updateData.languages = languages;
      if (price_per_day !== undefined) updateData.price_per_day = price_per_day;
      if (image_url !== undefined) updateData.image_url = image_url;
      if (bio !== undefined) updateData.bio = bio;
      if (rating !== undefined) updateData.rating = rating;
      if (available !== undefined) updateData.available = available;

      await TourGuide.update(id, updateData);
      const guide = await TourGuide.getById(id);

      res.json({
        success: true,
        message: 'Tour guide updated successfully',
        data: guide
      });
    } catch (error) {
      console.error('Update tour guide error:', error);
      res.status(500).json({
        error: 'Failed to update tour guide',
        message: error.message
      });
    }
  }

  // Delete tour guide (admin only)
  static async deleteTourGuide(req, res) {
    try {
      const { id } = req.params;
      await TourGuide.delete(id);

      res.json({
        success: true,
        message: 'Tour guide deleted successfully'
      });
    } catch (error) {
      console.error('Delete tour guide error:', error);
      res.status(500).json({
        error: 'Failed to delete tour guide',
        message: error.message
      });
    }
  }

  // Update tour guide rating
  static async updateTourGuideRating(req, res) {
    try {
      const { id } = req.params;
      const { rating } = req.body;

      if (rating < 0 || rating > 5) {
        return res.status(400).json({
          error: 'Invalid rating',
          message: 'Rating must be between 0 and 5'
        });
      }

      await TourGuide.updateRating(id, rating);
      const guide = await TourGuide.getById(id);

      res.json({
        success: true,
        message: 'Tour guide rating updated successfully',
        data: guide
      });
    } catch (error) {
      console.error('Update tour guide rating error:', error);
      res.status(500).json({
        error: 'Failed to update tour guide rating',
        message: error.message
      });
    }
  }
}

module.exports = TourGuideController;
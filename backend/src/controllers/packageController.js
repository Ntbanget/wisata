const Package = require('../models/Package');
const Hotel = require('../models/Hotel');
const TouristPlace = require('../models/TouristPlace');
const PackageGenerator = require('../utils/packageGenerator');
const validator = require('validator');

class PackageController {
  // Generate travel packages
  static async generatePackages(req, res) {
    try {
      const { city_id, budget, packages_count = 3, max_places = 4, nights = 1 } = req.query;
      
      // Validate required parameters
      if (!city_id || !budget) {
        return res.status(400).json({
          success: false,
          error: 'city_id and budget are required'
        });
      }

      // Convert to string for validator
      const cityIdStr = String(city_id);
      const budgetStr = String(budget);
      const packagesCountStr = String(packages_count);
      const maxPlacesStr = String(max_places);
      const nightsStr = String(nights);

      // Validate city_id
      if (!validator.isInt(cityIdStr, { min: 1 })) {
        return res.status(400).json({
          success: false,
          error: 'Invalid city_id'
        });
      }

      // Validate budget
      if (!validator.isFloat(budgetStr, { min: 10000, max: 999999999 })) {
        return res.status(400).json({
          success: false,
          error: 'Budget minimal Rp 10.000'
        });
      }

      // Convert to number for logic
      const budgetNum = parseFloat(budget);
      const cityIdNum = parseInt(city_id);

      // Validate optional parameters
      const packagesCount = validator.isInt(packagesCountStr, { min: 1, max: 10 }) 
        ? parseInt(packages_count) 
        : 3;
      
      const maxPlaces = validator.isInt(maxPlacesStr, { min: 2, max: 6 }) 
        ? parseInt(max_places) 
        : 4;

      const nightsNum = validator.isInt(nightsStr, { min: 1, max: 14 })
        ? parseInt(nights)
        : 1;

      const publishedAdminPackages = await Package.getPublishedByCity(cityIdNum);
      const adminPackages = [];

      for (const pkg of publishedAdminPackages) {
        if (pkg.budget !== null && pkg.budget !== undefined && Number(pkg.budget) > budgetNum) {
          continue;
        }

        const savedNights = Math.max(1, parseInt(pkg.nights || nightsNum, 10) || 1);
        const hotel = pkg.hotel_id ? await Hotel.getById(pkg.hotel_id) : null;
        if (!hotel) {
          continue;
        }

        const touristPlaces = Array.isArray(pkg.tourist_place_ids) && pkg.tourist_place_ids.length > 0
          ? await TouristPlace.getByIds(pkg.tourist_place_ids)
          : [];

        const peopleCount = Math.max(1, parseInt(pkg.people_count || 1, 10) || 1);
        const hotelTotal = Number(hotel.price_per_night || 0) * savedNights;
        const placesTotal = touristPlaces.reduce((sum, place) => sum + Number(place.ticket_price || 0), 0);
        const totalPrice = hotelTotal + placesTotal;

        adminPackages.push({
          id: pkg.id,
          name: pkg.name,
          hotel,
          hotel_tier: hotel.category,
          tourist_places: touristPlaces,
          nights: savedNights,
          people_count: peopleCount,
          hotel_total: hotelTotal,
          places_total: placesTotal,
          total_price: totalPrice,
          budget: Number(pkg.budget || budgetNum),
          remaining_budget: Number(pkg.budget || budgetNum) - totalPrice,
          score: 10,
          itinerary: pkg.generated_itinerary || null,
          source: 'admin',
          status: pkg.status
        });
      }

      const generatedPackages = adminPackages.length >= packagesCount
        ? []
        : await PackageGenerator.generatePackages(
            cityIdNum,
            budgetNum,
            {
              packagesCount: Math.max(1, packagesCount - adminPackages.length),
              maxPlaces,
              nights: nightsNum
            }
          );

      const normalizedGeneratedPackages = (generatedPackages || []).map((pkg) => ({
        ...pkg,
        source: 'generated',
      }));

      const seenKeys = new Set();
      const packages = [...adminPackages, ...normalizedGeneratedPackages]
        .filter((pkg) => {
          const key = pkg.hotel?.id ? `hotel:${pkg.hotel.id}` : `name:${pkg.name || pkg.id}`;
          if (seenKeys.has(key)) {
            return false;
          }
          seenKeys.add(key);
          return true;
        })
        .slice(0, packagesCount);

      // Get budget breakdown
      const budgetBreakdown = PackageGenerator.getBudgetBreakdown(budgetNum);

      res.json({
        success: true,
        data: {
          packages,
          budget_breakdown: budgetBreakdown,
          search_criteria: {
            city_id: parseInt(city_id),
            budget: budgetNum,
            packages_count: packagesCount,
            max_places: maxPlaces,
            nights: nightsNum
          }
        }
      });
    } catch (error) {
      console.error('Error generating packages:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate packages',
        message: error.message
      });
    }
  }

  // Calculate custom package price
  static async calculateCustomPackage(req, res) {
    try {
      const { hotel_id, tourist_place_ids, nights = 1 } = req.body;
      
      // Validate required parameters
      if (!hotel_id || !tourist_place_ids) {
        return res.status(400).json({
          success: false,
          error: 'hotel_id and tourist_place_ids are required'
        });
      }

      // Validate hotel_id
      if (!validator.isInt(String(hotel_id), { min: 1 })) {
        return res.status(400).json({
          success: false,
          error: 'Invalid hotel_id'
        });
      }

      // Validate tourist_place_ids
      if (!Array.isArray(tourist_place_ids) || tourist_place_ids.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'tourist_place_ids must be a non-empty array'
        });
      }

      // Validate each place ID
      for (const placeId of tourist_place_ids) {
        if (!validator.isInt(String(placeId), { min: 1 })) {
          return res.status(400).json({
            success: false,
            error: `Invalid tourist_place_id: ${placeId}`
          });
        }
      }

      // Validate nights
      const nightsNum = parseInt(nights);
      if (!validator.isInt(String(nights), { min: 1, max: 30 })) {
        return res.status(400).json({
          success: false,
          error: 'Nights must be between 1 and 30'
        });
      }

      // Calculate custom package
      const customPackage = await PackageGenerator.calculateCustomPackage(
        parseInt(hotel_id),
        tourist_place_ids.map(id => parseInt(id)),
        nightsNum
      );

      res.json({
        success: true,
        data: customPackage
      });
    } catch (error) {
      console.error('Error calculating custom package:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to calculate custom package',
        message: error.message
      });
    }
  }

  // Validate package against budget
  static async validatePackage(req, res) {
    try {
      const { hotel_id, tourist_place_ids, budget } = req.body;
      
      // Validate required parameters
      if (!hotel_id || !tourist_place_ids || !budget) {
        return res.status(400).json({
          success: false,
          error: 'hotel_id, tourist_place_ids, and budget are required'
        });
      }

      // Validate hotel_id
      if (!validator.isInt(String(hotel_id), { min: 1 })) {
        return res.status(400).json({
          success: false,
          error: 'Invalid hotel_id'
        });
      }

      // Validate tourist_place_ids
      if (!Array.isArray(tourist_place_ids) || tourist_place_ids.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'tourist_place_ids must be a non-empty array'
        });
      }

      // Validate each place ID
      for (const placeId of tourist_place_ids) {
        if (!validator.isInt(String(placeId), { min: 1 })) {
          return res.status(400).json({
            success: false,
            error: `Invalid tourist_place_id: ${placeId}`
          });
        }
      }

      // Validate budget
      const budgetNum = parseFloat(budget);
      if (!validator.isFloat(String(budget), { min: 10000, max: 999999999 })) {
        return res.status(400).json({
          success: false,
          error: 'Budget minimal Rp 10.000'
        });
      }

      // Validate package
      const validation = await PackageGenerator.validatePackage(
        parseInt(hotel_id),
        tourist_place_ids.map(id => parseInt(id)),
        budgetNum
      );

      res.json({
        success: true,
        data: validation
      });
    } catch (error) {
      console.error('Error validating package:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to validate package',
        message: error.message
      });
    }
  }

  // Get budget breakdown
  static async getBudgetBreakdown(req, res) {
    try {
      const { budget } = req.query;
      
      if (!budget) {
        return res.status(400).json({
          success: false,
          error: 'Budget is required'
        });
      }

      // Validate budget
      const budgetNum = parseFloat(budget);
      if (!validator.isFloat(budget, { min: 10000, max: 999999999 })) {
        return res.status(400).json({
          success: false,
          error: 'Budget minimal Rp 10.000'
        });
      }

      const breakdown = PackageGenerator.getBudgetBreakdown(budgetNum);

      res.json({
        success: true,
        data: breakdown
      });
    } catch (error) {
      console.error('Error getting budget breakdown:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get budget breakdown',
        message: error.message
      });
    }
  }
}

module.exports = PackageController;

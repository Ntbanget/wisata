const Hotel = require('../models/Hotel');
const TouristPlace = require('../models/TouristPlace');

class PackageGenerator {
  // Generate travel packages based on city and budget
  static async generatePackages(cityId, budget, options = {}) {
    const {
      packagesCount = 3,
      maxPlaces = 4,
      hotelBudgetRatio = 0.5,
      placesBudgetRatio = 0.3
    } = options;

    const hotelBudget = budget * hotelBudgetRatio;
    const placesBudget = budget * placesBudgetRatio;

    // Get available hotels and places
    const hotels = await Hotel.getByCityAndBudget(cityId, hotelBudget);
    const places = await TouristPlace.getByCityAndBudget(cityId, placesBudget);

    if (hotels.length === 0 || places.length === 0) {
      return [];
    }

    const packages = [];

    // Generate multiple package combinations
    for (let i = 0; i < packagesCount && i < hotels.length; i++) {
      const hotel = hotels[i];
      const remainingBudget = budget - hotel.price_per_night;
      
      // Get places that fit in remaining budget
      const affordablePlaces = places.filter(place => place.ticket_price <= remainingBudget);
      
      if (affordablePlaces.length === 0) continue;

      // Generate different combinations
      const combinations = this.generatePlaceCombinations(affordablePlaces, remainingBudget, maxPlaces);
      
      // Take the best combination
      if (combinations.length > 0) {
        const bestCombination = combinations[0]; // Already sorted by value
        
        const packageData = {
          id: i + 1,
          hotel,
          tourist_places: bestCombination.places,
          total_price: hotel.price_per_night + bestCombination.totalPrice,
          budget,
          remaining_budget: budget - (hotel.price_per_night + bestCombination.totalPrice),
          score: this.calculatePackageScore(hotel, bestCombination.places, budget)
        };
        
        packages.push(packageData);
      }
    }

    // Sort packages by score (best first)
    packages.sort((a, b) => b.score - a.score);

    return packages.slice(0, packagesCount);
  }

  // Generate different combinations of tourist places
  static generatePlaceCombinations(places, budget, maxPlaces) {
    const combinations = [];
    
    // Try different numbers of places (2 to maxPlaces)
    for (let count = 2; count <= maxPlaces && count <= places.length; count++) {
      const combination = this.selectBestPlaces(places, budget, count);
      if (combination.places.length > 0) {
        combinations.push(combination);
      }
    }
    
    // Sort by total places value (prioritize more places within budget)
    combinations.sort((a, b) => {
      if (a.places.length !== b.places.length) {
        return b.places.length - a.places.length;
      }
      return a.totalPrice - b.totalPrice;
    });
    
    return combinations;
  }

  // Select best places for given count and budget
  static selectBestPlaces(places, budget, count) {
    // Sort by category priority and price
    const sortedPlaces = [...places].sort((a, b) => {
      const categoryPriority = {
        'Historical': 1,
        'Nature': 2,
        'Cultural': 3,
        'Beach': 4,
        'Religious': 5,
        'Adventure': 6,
        'Museum': 7,
        'Park': 8,
        'Monument': 9
      };
      
      const aPriority = categoryPriority[a.category] || 10;
      const bPriority = categoryPriority[b.category] || 10;
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
      
      return a.ticket_price - b.ticket_price;
    });

    const selectedPlaces = [];
    let totalPrice = 0;

    // Greedy selection with category diversity
    const usedCategories = new Set();
    
    for (const place of sortedPlaces) {
      if (selectedPlaces.length >= count) break;
      if (totalPrice + place.ticket_price > budget) break;
      
      // Prefer diverse categories
      if (!usedCategories.has(place.category) || selectedPlaces.length === 0) {
        selectedPlaces.push(place);
        totalPrice += place.ticket_price;
        usedCategories.add(place.category);
      }
    }

    // If we didn't get enough places, try filling with any affordable places
    if (selectedPlaces.length < count) {
      for (const place of sortedPlaces) {
        if (selectedPlaces.length >= count) break;
        if (totalPrice + place.ticket_price > budget) break;
        if (!selectedPlaces.includes(place)) {
          selectedPlaces.push(place);
          totalPrice += place.ticket_price;
        }
      }
    }

    return {
      places: selectedPlaces,
      totalPrice
    };
  }

  // Calculate package score for ranking
  static calculatePackageScore(hotel, places, budget) {
    let score = 0;
    
    // Hotel rating contributes 40% to score
    score += (hotel.rating / 5) * 40;
    
    // Number of places contributes 30%
    const placesScore = Math.min(places.length / 4, 1) * 30;
    score += placesScore;
    
    // Category diversity contributes 20%
    const categories = new Set(places.map(p => p.category));
    const diversityScore = Math.min(categories.size / 3, 1) * 20;
    score += diversityScore;
    
    // Budget efficiency contributes 10%
    const totalPrice = hotel.price_per_night + places.reduce((sum, p) => sum + p.ticket_price, 0);
    const efficiencyScore = Math.max(0, 1 - (totalPrice - budget * 0.7) / (budget * 0.3)) * 10;
    score += Math.max(0, efficiencyScore);
    
    return Math.round(score * 10) / 10;
  }

  // Calculate custom package price
  static async calculateCustomPackage(hotelId, placeIds, nights = 1) {
    try {
      // Get hotel details
      const hotel = await Hotel.getById(hotelId);
      if (!hotel) {
        throw new Error('Hotel not found');
      }

      // Get tourist places
      const places = await TouristPlace.getByIds(placeIds);
      if (places.length !== placeIds.length) {
        throw new Error('Some tourist places not found');
      }

      // Calculate total price
      const hotelPrice = hotel.price_per_night * nights;
      const placesPrice = places.reduce((sum, place) => sum + place.ticket_price, 0);
      const totalPrice = hotelPrice + placesPrice;

      return {
        hotel,
        tourist_places: places,
        nights,
        hotel_price: hotelPrice,
        places_price: placesPrice,
        total_price: totalPrice,
        breakdown: {
          hotel: {
            name: hotel.name,
            price_per_night: hotel.price_per_night,
            nights,
            total: hotelPrice
          },
          places: places.map(place => ({
            name: place.name,
            category: place.category,
            ticket_price: place.ticket_price,
            total: place.ticket_price
          })),
          summary: {
            subtotal: totalPrice,
            tax: 0,
            total: totalPrice
          }
        }
      };
    } catch (error) {
      throw new Error(`Failed to calculate custom package: ${error.message}`);
    }
  }

  // Get budget breakdown suggestions
  static getBudgetBreakdown(budget) {
    return {
      hotel: {
        amount: budget * 0.5,
        percentage: 50,
        description: 'Accommodation (50% of budget)'
      },
      tourist_places: {
        amount: budget * 0.3,
        percentage: 30,
        description: 'Tourist destinations (30% of budget)'
      },
      buffer: {
        amount: budget * 0.2,
        percentage: 20,
        description: 'Buffer for meals, transport, and other expenses (20% of budget)'
      },
      total: budget
    };
  }

  // Validate package availability
  static async validatePackage(hotelId, placeIds, budget) {
    try {
      const customPackage = await this.calculateCustomPackage(hotelId, placeIds);
      
      if (customPackage.total_price > budget) {
        return {
          valid: false,
          error: 'Package exceeds budget',
          excess: customPackage.total_price - budget
        };
      }

      return {
        valid: true,
        package: customPackage,
        remaining_budget: budget - customPackage.total_price
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  }
}

module.exports = PackageGenerator;

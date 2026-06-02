const Vehicle = require('../models/Vehicle');

class ValidationHelper {
  // Vehicle validation rules
  static validateVehicle(peopleCount) {
    if (peopleCount <= 4) {
      return {
        valid: true,
        recommended_category: ['normal', 'luxury'],
        message: 'For 1-4 people, normal or luxury car is recommended'
      };
    } else if (peopleCount <= 10) {
      return {
        valid: true,
        recommended_category: 'hiace',
        message: 'For 5-10 people, Hiace is recommended'
      };
    } else if (peopleCount <= 18) {
      return {
        valid: true,
        recommended_category: 'elf',
        message: 'For 11-18 people, Elf is recommended'
      };
    } else {
      return {
        valid: true,
        recommended_category: 'bus',
        message: 'For 20+ people, Bus is recommended'
      };
    }
  }

  // Check if a vehicle is suitable for the number of people
  static isVehicleSuitable(vehicle, peopleCount) {
    if (!vehicle) {
      return { valid: false, message: 'No vehicle selected' };
    }

    if (vehicle.capacity < peopleCount) {
      return {
        valid: false,
        message: \Vehicle capacity (\) is less than number of people (\)\
      };
    }

    const validation = this.validateVehicle(peopleCount);
    
    if (Array.isArray(validation.recommended_category)) {
      if (!validation.recommended_category.includes(vehicle.category)) {
        return {
          valid: false,
          message: \Vehicle category (\) is not recommended for \ people. Recommended: \\
        };
      }
    } else {
      if (vehicle.category !== validation.recommended_category) {
        return {
          valid: false,
          message: \Vehicle category (\) is not recommended for \ people. Recommended: \\
        };
      }
    }

    return { valid: true, message: 'Vehicle is suitable' };
  }

  // Room validation rules
  static validateRooms(peopleCount) {
    const maxPeoplePerRoom = 2;
    const minRooms = Math.ceil(peopleCount / maxPeoplePerRoom);
    
    return {
      valid: true,
      min_rooms: minRooms,
      max_people_per_room: maxPeoplePerRoom,
      message: \For \ people, minimum \ room(s) required (1 room = max 2 people)\
    };
  }

  // Check if the number of rooms is sufficient
  static isRoomSufficient(totalRooms, peopleCount) {
    const validation = this.validateRooms(peopleCount);
    
    if (totalRooms < validation.min_rooms) {
      return {
        valid: false,
        message: \Insufficient rooms. Minimum \ room(s) required for \ people\
      };
    }

    return { valid: true, message: 'Rooms are sufficient' };
  }

  // Complete booking validation
  static validateBooking(bookingData) {
    const errors = [];
    const warnings = [];

    // Validate people count
    if (!bookingData.people_count || bookingData.people_count < 1) {
      errors.push('At least 1 person is required');
    }

    // Validate nights
    if (!bookingData.nights || bookingData.nights < 1) {
      errors.push('At least 1 night is required');
    }

    // Validate trip date
    if (!bookingData.trip_date) {
      errors.push('Trip date is required');
    } else {
      const tripDate = new Date(bookingData.trip_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (tripDate < today) {
        errors.push('Trip date cannot be in the past');
      }
    }

    // Validate rooms
    if (bookingData.people_count && bookingData.total_rooms) {
      const roomValidation = this.isRoomSufficient(bookingData.total_rooms, bookingData.people_count);
      if (!roomValidation.valid) {
        errors.push(roomValidation.message);
      }
    }

    // Validate vehicle if selected
    if (bookingData.vehicle_id && bookingData.people_count) {
      // This would need to fetch the vehicle from the database
      // For now, we'll just validate based on the vehicle data if provided
      if (bookingData.vehicle) {
        const vehicleValidation = this.isVehicleSuitable(bookingData.vehicle, bookingData.people_count);
        if (!vehicleValidation.valid) {
          warnings.push(vehicleValidation.message);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  // Calculate total rooms based on people count
  static calculateTotalRooms(peopleCount) {
    const validation = this.validateRooms(peopleCount);
    return validation.min_rooms;
  }

  // Get recommended vehicle for people count
  static async getRecommendedVehicle(peopleCount) {
    try {
      const vehicle = await Vehicle.getRecommendedVehicle(peopleCount);
      if (vehicle) {
        return {
          valid: true,
          vehicle,
          message: \Recommended vehicle: \ (\)\
        };
      }
      return {
        valid: false,
        vehicle: null,
        message: 'No suitable vehicle found'
      };
    } catch (error) {
      return {
        valid: false,
        vehicle: null,
        message: 'Error fetching recommended vehicle'
      };
    }
  }
}

module.exports = ValidationHelper;
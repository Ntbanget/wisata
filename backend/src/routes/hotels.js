const express = require('express');
const HotelController = require('../controllers/hotelController');

const router = express.Router();

// GET /api/hotels - Get all hotels
router.get('/', HotelController.getAllHotels);

// GET /api/hotels/city/:cityId - Get hotels by city
router.get('/city/:cityId', HotelController.getHotelsByCity);

// GET /api/hotels/:id - Get hotel by ID
router.get('/:id', HotelController.getHotelById);

module.exports = router;

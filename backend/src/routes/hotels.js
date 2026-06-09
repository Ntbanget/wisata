const express = require('express');
const HotelController = require('../controllers/hotelController');
const { authenticate } = require('../middleware/auth');
const { adminOnly } = require('../middleware/role');

const router = express.Router();

// Public routes
// GET /api/hotels - Get all hotels
router.get('/', HotelController.getAllHotels);

// GET /api/hotels/city/:cityId - Get hotels by city
router.get('/city/:cityId', HotelController.getHotelsByCity);

// GET /api/hotels/:id - Get hotel by ID
router.get('/:id', HotelController.getHotelById);

// Admin routes
// POST /api/hotels - Create new hotel (admin only)
router.post('/', authenticate, adminOnly, HotelController.createHotel);

// PUT /api/hotels/:id - Update hotel (admin only)
router.put('/:id', authenticate, adminOnly, HotelController.updateHotel);

// DELETE /api/hotels/:id - Delete hotel (admin only)
router.delete('/:id', authenticate, adminOnly, HotelController.deleteHotel);

module.exports = router;

const express = require('express');
const TouristPlaceController = require('../controllers/touristPlaceController');
const { authenticate } = require('../middleware/auth');
const { adminOnly } = require('../middleware/role');

const router = express.Router();

// Public routes
// GET /api/tourist-places - Get all tourist places
router.get('/', TouristPlaceController.getAllTouristPlaces);

// GET /api/tourist-places/city/:cityId - Get tourist places by city
router.get('/city/:cityId', TouristPlaceController.getTouristPlacesByCity);

// GET /api/tourist-places/:id - Get tourist place by ID
router.get('/:id', TouristPlaceController.getTouristPlaceById);

// Admin routes
// POST /api/tourist-places - Create new tourist place (admin only)
router.post('/', authenticate, adminOnly, TouristPlaceController.createTouristPlace);

// PUT /api/tourist-places/:id - Update tourist place (admin only)
router.put('/:id', authenticate, adminOnly, TouristPlaceController.updateTouristPlace);

// DELETE /api/tourist-places/:id - Delete tourist place (admin only)
router.delete('/:id', authenticate, adminOnly, TouristPlaceController.deleteTouristPlace);

module.exports = router;

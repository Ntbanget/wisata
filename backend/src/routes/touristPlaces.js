const express = require('express');
const TouristPlaceController = require('../controllers/touristPlaceController');

const router = express.Router();

// GET /api/tourist-places - Get all tourist places
router.get('/', TouristPlaceController.getAllTouristPlaces);

// GET /api/tourist-places/city/:cityId - Get tourist places by city
router.get('/city/:cityId', TouristPlaceController.getTouristPlacesByCity);

// GET /api/tourist-places/:id - Get tourist place by ID
router.get('/:id', TouristPlaceController.getTouristPlaceById);

module.exports = router;

const express = require('express');
const CityController = require('../controllers/cityController');
const { authenticate, adminOnly } = require('../middleware/auth');
const { adminOnly: adminOnlyRole } = require('../middleware/role');

const router = express.Router();

// GET /api/cities - Get all cities
router.get('/', CityController.getAllCities);

// GET /api/cities/:id - Get city by ID
router.get('/:id', CityController.getCityById);

// GET /api/cities/:id/stats - Get city with statistics
router.get('/:id/stats', CityController.getCityWithStats);

// POST /api/cities - Create new city (admin only)
router.post('/', authenticate, adminOnlyRole, CityController.createCity);

// PUT /api/cities/:id - Update city (admin only)
router.put('/:id', authenticate, adminOnlyRole, CityController.updateCity);

// DELETE /api/cities/:id - Delete city (admin only)
router.delete('/:id', authenticate, adminOnlyRole, CityController.deleteCity);

module.exports = router;

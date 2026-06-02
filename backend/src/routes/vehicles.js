const express = require('express');
const router = express.Router();
const VehicleController = require('../controllers/vehicleController');
const { authenticate } = require('../middleware/auth');
const { adminOnly } = require('../middleware/role');

// Public routes
router.get('/', VehicleController.getAllVehicles);
router.get('/capacity/:minCapacity/:maxCapacity', VehicleController.getVehiclesByCapacity);
router.get('/recommend', VehicleController.getRecommendedVehicle);
router.get('/:id', VehicleController.getVehicleById);

// Admin routes
router.post('/', authenticate, adminOnly, VehicleController.createVehicle);
router.put('/:id', authenticate, adminOnly, VehicleController.updateVehicle);
router.delete('/:id', authenticate, adminOnly, VehicleController.deleteVehicle);

module.exports = router;
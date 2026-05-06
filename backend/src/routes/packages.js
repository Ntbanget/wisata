const express = require('express');
const PackageController = require('../controllers/packageController');

const router = express.Router();

// GET /api/packages - Generate travel packages
router.get('/', PackageController.generatePackages);

// POST /api/packages/custom - Calculate custom package price
router.post('/custom', PackageController.calculateCustomPackage);

// POST /api/packages/validate - Validate package against budget
router.post('/validate', PackageController.validatePackage);

// GET /api/packages/budget-breakdown - Get budget breakdown
router.get('/budget-breakdown', PackageController.getBudgetBreakdown);

module.exports = router;

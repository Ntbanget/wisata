const express = require('express');
const router = express.Router();
const TourGuideController = require('../controllers/tourGuideController');
const { authenticate } = require('../middleware/auth');
const { adminOnly } = require('../middleware/role');

// Public routes
router.get('/', TourGuideController.getAllTourGuides);
router.get('/specialization/:specialization', TourGuideController.getTourGuidesBySpecialization);
router.get('/top-rated', TourGuideController.getTopRatedTourGuides);
router.get('/:id', TourGuideController.getTourGuideById);

// Admin routes
router.post('/', authenticate, adminOnly, TourGuideController.createTourGuide);
router.put('/:id', authenticate, adminOnly, TourGuideController.updateTourGuide);
router.delete('/:id', authenticate, adminOnly, TourGuideController.deleteTourGuide);
router.put('/:id/rating', authenticate, adminOnly, TourGuideController.updateTourGuideRating);

module.exports = router;
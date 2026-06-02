const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { adminOnly } = require('../middleware/role');

// Public routes - USER
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// Public routes - ADMIN (SEPARATE)
router.post('/admin/login', AuthController.adminLogin);

// Protected routes
router.get('/profile', authenticate, AuthController.getProfile);
router.put('/profile', authenticate, AuthController.updateProfile);
router.put('/change-password', authenticate, AuthController.changePassword);

// Admin routes
router.post('/admin/create', authenticate, adminOnly, AuthController.createAdmin);
router.get('/admin/users', authenticate, adminOnly, AuthController.getAllUsers);
router.put('/admin/users/:id/role', authenticate, adminOnly, AuthController.updateUserRole);
router.delete('/admin/users/:id', authenticate, adminOnly, AuthController.deleteUser);

module.exports = router;
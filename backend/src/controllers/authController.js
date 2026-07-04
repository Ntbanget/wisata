const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const User = require('../models/User');
const { logActivity } = require('../helpers/activityLogger');

class AuthController {
  // Register new user
  static async register(req, res) {
    try {
      const { name, email, password, phone } = req.body;

      // Validate input
      if (!name || !email || !password) {
        return res.status(400).json({
          error: 'Missing required fields',
          message: 'Name, email, and password are required'
        });
      }

      // Validate name length
      if (!validator.isLength(name, { min: 2, max: 100 })) {
        return res.status(400).json({
          error: 'Invalid name',
          message: 'Name must be between 2 and 100 characters'
        });
      }

      // Validate email format
      if (!validator.isEmail(email)) {
        return res.status(400).json({
          error: 'Invalid email',
          message: 'Please provide a valid email address'
        });
      }

      // Validate password strength
      if (!validator.isLength(password, { min: 6 })) {
        return res.status(400).json({
          error: 'Invalid password',
          message: 'Password must be at least 6 characters'
        });
      }

      // Validate phone format if provided
      if (phone && !validator.isLength(phone, { min: 10, max: 20 })) {
        return res.status(400).json({
          error: 'Invalid phone',
          message: 'Phone number must be between 10 and 20 characters'
        });
      }

      // Check if user already exists
      const existingUser = await User.getByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          error: 'User already exists',
          message: 'An account with this email already exists'
        });
      }

      // Hash password
      const password_hash = await bcrypt.hash(password, 10);

      // Create user
      const userId = await User.create({
        name,
        email,
        password_hash,
        phone,
        role: 'user'
      });

      // Generate token
      const token = jwt.sign(
        { id: userId, email, role: 'user' },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      const user = await User.getById(userId);
      const { password_hash: _, ...userWithoutPassword } = user;

      res.status(201).json({
        success: true,
        message: 'Registration successful',
        token,
        user: userWithoutPassword
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        error: 'Registration failed',
        message: error.message
      });
    }
  }

  // Login user
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({
          error: 'Missing credentials',
          message: 'Email and password are required'
        });
      }

      // Validate email format
      if (!validator.isEmail(email)) {
        return res.status(400).json({
          error: 'Invalid email',
          message: 'Please provide a valid email address'
        });
      }

      // Validate password length
      if (!validator.isLength(password, { min: 6 })) {
        return res.status(400).json({
          error: 'Invalid password',
          message: 'Password must be at least 6 characters'
        });
      }

      // Find user
      const user = await User.getByEmail(email);
      if (!user) {
        return res.status(401).json({
          error: 'Invalid credentials',
          message: 'Email or password is incorrect'
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({
          error: 'Invalid credentials',
          message: 'Email or password is incorrect'
        });
      }

      // CRITICAL: Prevent admin login through user endpoint
      if (user.role === 'admin') {
        return res.status(403).json({
          error: 'Access denied',
          message: 'Admins must use the Admin Portal at /admin/login'
        });
      }

      // Generate token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      const { password_hash: _, ...userWithoutPassword } = user;

      res.json({
        success: true,
        message: 'Login successful',
        token,
        user: userWithoutPassword
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        error: 'Login failed',
        message: error.message
      });
    }
  }

  // Admin Login - SEPARATE ENDPOINT FOR ADMIN ONLY
  static async adminLogin(req, res) {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({
          error: 'Missing credentials',
          message: 'Email and password are required'
        });
      }

      // Validate email format
      if (!validator.isEmail(email)) {
        return res.status(400).json({
          error: 'Invalid email',
          message: 'Please provide a valid email address'
        });
      }

      // Validate password length
      if (!validator.isLength(password, { min: 6 })) {
        return res.status(400).json({
          error: 'Invalid password',
          message: 'Password must be at least 6 characters'
        });
      }

      // Find user
      const user = await User.getByEmail(email);
      if (!user) {
        return res.status(401).json({
          error: 'Invalid credentials',
          message: 'Email or password is incorrect'
        });
      }

      // CRITICAL: Check if user is ADMIN
      if (user.role !== 'admin') {
        return res.status(403).json({
          error: 'Access denied',
          message: 'This account does not have admin privileges. Please use the user portal.'
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({
          error: 'Invalid credentials',
          message: 'Email or password is incorrect'
        });
      }

      // Generate token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      const { password_hash: _, ...userWithoutPassword } = user;

      res.json({
        success: true,
        message: 'Admin login successful',
        token,
        user: userWithoutPassword
      });
    } catch (error) {
      console.error('Admin login error:', error);
      res.status(500).json({
        error: 'Admin login failed',
        message: error.message
      });
    }
  }

  // Get current user profile
  static async getProfile(req, res) {
    try {
      const user = await User.getById(req.user.id);
      if (!user) {
        return res.status(404).json({
          error: 'User not found'
        });
      }

      const { password_hash: _, ...userWithoutPassword } = user;

      res.json({
        success: true,
        user: userWithoutPassword
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        error: 'Failed to fetch profile',
        message: error.message
      });
    }
  }

  // Update user profile
  static async updateProfile(req, res) {
    try {
      const { name, phone } = req.body;
      const userId = req.user.id;

      const updateData = {};
      if (name) {
        if (!validator.isLength(name, { min: 2, max: 100 })) {
          return res.status(400).json({
            error: 'Invalid name',
            message: 'Name must be between 2 and 100 characters'
          });
        }
        updateData.name = name;
      }
      if (phone !== undefined) {
        if (phone && !validator.isLength(phone, { min: 10, max: 20 })) {
          return res.status(400).json({
            error: 'Invalid phone',
            message: 'Phone number must be between 10 and 20 characters'
          });
        }
        updateData.phone = phone;
      }

      await User.update(userId, updateData);

      const user = await User.getById(userId);
      const { password_hash: _, ...userWithoutPassword } = user;

      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: userWithoutPassword
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        error: 'Failed to update profile',
        message: error.message
      });
    }
  }

  // Change password
  static async changePassword(req, res) {
    try {
      const { current_password, new_password } = req.body;
      const userId = req.user.id;

      if (!current_password || !new_password) {
        return res.status(400).json({
          error: 'Missing required fields',
          message: 'Current password and new password are required'
        });
      }

      if (new_password.length < 6) {
        return res.status(400).json({
          error: 'Invalid password',
          message: 'New password must be at least 6 characters'
        });
      }

      // Get current user
      const user = await User.getById(userId);
      if (!user) {
        return res.status(404).json({
          error: 'User not found'
        });
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(current_password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({
          error: 'Invalid password',
          message: 'Current password is incorrect'
        });
      }

      // Hash new password
      const password_hash = await bcrypt.hash(new_password, 10);

      // Update password
      await User.update(userId, { password_hash });

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        error: 'Failed to change password',
        message: error.message
      });
    }
  }

  // Admin: Create admin user
  static async createAdmin(req, res) {
    try {
      const { name, email, password, phone } = req.body;

      // Validate input
      if (!name || !email || !password) {
        return res.status(400).json({
          error: 'Missing required fields',
          message: 'Name, email, and password are required'
        });
      }

      // Validate name length
      if (!validator.isLength(name, { min: 2, max: 100 })) {
        return res.status(400).json({
          error: 'Invalid name',
          message: 'Name must be between 2 and 100 characters'
        });
      }

      // Validate email format
      if (!validator.isEmail(email)) {
        return res.status(400).json({
          error: 'Invalid email',
          message: 'Please provide a valid email address'
        });
      }

      // Validate password strength
      if (!validator.isLength(password, { min: 6 })) {
        return res.status(400).json({
          error: 'Invalid password',
          message: 'Password must be at least 6 characters'
        });
      }

      // Validate phone format if provided
      if (phone && !validator.isLength(phone, { min: 10, max: 20 })) {
        return res.status(400).json({
          error: 'Invalid phone',
          message: 'Phone number must be between 10 and 20 characters'
        });
      }

      // Check if user already exists
      const existingUser = await User.getByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          error: 'User already exists',
          message: 'An account with this email already exists'
        });
      }

      // Hash password
      const password_hash = await bcrypt.hash(password, 10);

      // Create admin user
      const userId = await User.create({
        name,
        email,
        password_hash,
        phone,
        role: 'admin'
      });

      const user = await User.getById(userId);
      const { password_hash: _, ...userWithoutPassword } = user;

      res.status(201).json({
        success: true,
        message: 'Admin user created successfully',
        user: userWithoutPassword
      });
    } catch (error) {
      console.error('Create admin error:', error);
      res.status(500).json({
        error: 'Failed to create admin user',
        message: error.message
      });
    }
  }

  // Admin: Get all users
  static async getAllUsers(req, res) {
    try {
      const { page = 1, limit = 20, role } = req.query;
      
      const result = await User.getAll(parseInt(page), parseInt(limit), role);

      // Remove passwords from response
      const usersWithoutPasswords = result.users.map(user => {
        const { password_hash, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });

      res.json({
        success: true,
        data: usersWithoutPasswords,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({
        error: 'Failed to fetch users',
        message: error.message
      });
    }
  }

  // Admin: Update user role
  static async updateUserRole(req, res) {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!['user', 'admin'].includes(role)) {
        return res.status(400).json({
          error: 'Invalid role',
          message: 'Role must be one of: user, admin'
        });
      }

      await User.update(parseInt(id), { role });

      const user = await User.getById(parseInt(id));
      const { password_hash: _, ...userWithoutPassword } = user;

      res.json({
        success: true,
        message: 'User role updated successfully',
        user: userWithoutPassword
      });
    } catch (error) {
      console.error('Update user role error:', error);
      res.status(500).json({
        error: 'Failed to update user role',
        message: error.message
      });
    }
  }

  // Admin: Delete user
  static async deleteUser(req, res) {
    try {
      const { id } = req.params;

      // Prevent deleting yourself
      if (parseInt(id) === req.user.id) {
        return res.status(400).json({
          error: 'Cannot delete yourself',
          message: 'You cannot delete your own account'
        });
      }

      await User.delete(parseInt(id));

      // Log activity
      try {
        await logActivity(
          req.user.id,
          req.user.name,
          'DELETE_CUSTOMER',
          'CUSTOMER',
          parseInt(id),
          `Deleted customer with ID ${id}`
        );
      } catch (logError) {
        console.error('Activity log error:', logError);
      }

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({
        error: 'Failed to delete user',
        message: error.message
      });
    }
  }
}

module.exports = AuthController;
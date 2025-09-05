import express from 'express';
import jwt from 'jsonwebtoken';
import Tourist from '../models/Tourist.js';

const router = express.Router();

// @desc    Register a tourist
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  try {
    // Add validation for request body
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Request body is required'
      });
    }

    const { email, password, firstName, lastName, dateOfBirth, nationality, phoneNumber, documentType, documentNumber, checkInDate, checkOutDate } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !dateOfBirth || !nationality || !phoneNumber || !documentType || !documentNumber) {
      return res.status(400).json({
        success: false,
        error: 'Please provide all required fields'
      });
    }

    // Check if tourist already exists
    const existingTourist = await Tourist.findOne({ email });
    if (existingTourist) {
      return res.status(400).json({
        success: false,
        error: 'Tourist with this email already exists'
      });
    }

    // Create tourist (password will be hashed by pre-save hook)
    const tourist = new Tourist({
      email,
      password,
      personalInfo: {
        firstName,
        lastName,
        dateOfBirth,
        nationality,
        phoneNumber
      },
      kycDetails: {
        documentType,
        documentNumber
      },
      tripDetails: {
        checkInDate: checkInDate || new Date(),
        checkOutDate: checkOutDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Default 7 days
      }
    });

    await tourist.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: tourist._id },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Tourist registered successfully',
      data: {
        token,
        tourist: {
          id: tourist._id,
          email: tourist.email,
          personalInfo: tourist.personalInfo
        }
      }
    });
  } catch (error) {
    console.error('Register error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Server error during registration'
    });
  }
});

// @desc    Login tourist
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    // Add validation for request body
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Request body is required'
      });
    }

    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password'
      });
    }

    // Check for tourist
    const tourist = await Tourist.findOne({ email }).select('+password');
    if (!tourist) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await tourist.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: tourist._id },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        tourist: {
          id: tourist._id,
          email: tourist.email,
          personalInfo: tourist.personalInfo
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Server error during login'
    });
  }
});

// Export the router
export { router as authRoutes };
import express from 'express';
import jwt from 'jsonwebtoken';
import { protect } from '../middleware/auth.js'; // **FIX**: Import protect middleware
import { validateTouristRegistration } from '../middleware/validation.js';
import Tourist from '../models/Tourist.js';

const router = express.Router();

// @desc    Test auth route
// @route   GET /api/auth/test
// @access  Public
router.get('/test', (req, res) => {
    res.json({ message: 'Auth route is working' });
});

// @desc    Register a tourist
// @route   POST /api/auth/register
// @access  Public
router.post('/register', validateTouristRegistration, async (req, res) => {
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

    // Create tourist with proper structure
    const tourist = new Tourist({
      email,
      password,
      personalInfo: {
        firstName,
        lastName,
        dateOfBirth: new Date(dateOfBirth),
        nationality,
        phoneNumber
      },
      kycDetails: {
        documentType,
        documentNumber,
        verificationStatus: 'PENDING'
      },
      tripDetails: {
        checkInDate: checkInDate ? new Date(checkInDate) : new Date(),
        checkOutDate: checkOutDate ? new Date(checkOutDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Default 7 days
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
          digitalId: tourist.digitalId,
          email: tourist.email,
          personalInfo: tourist.personalInfo
        }
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        error: `Duplicate ${field}`,
        message: `A tourist with this ${field} already exists`
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server error during registration',
      message: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'
    });
  }
});

// @desc    Login tourist
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Request body is required'
      });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password'
      });
    }

    const tourist = await Tourist.findOne({ email }).select('+password');
    if (!tourist) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const isMatch = await tourist.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

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
          digitalId: tourist.digitalId,
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

// **FIX**: Add a protected route to get the logged-in user's profile
// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
    try {
        const tourist = await Tourist.findById(req.tourist._id);
        if (!tourist) {
            return res.status(404).json({ success: false, error: 'Tourist not found' });
        }
        res.status(200).json({ success: true, data: tourist });
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});


// Export the router
export default router;

import express from 'express';
import { protect } from '../middleware/auth.js';
import Tourist from '../models/Tourist.js';

const router = express.Router();

// @desc    Update tourist location
// @route   POST /api/location/update
// @access  Private
router.post('/update', protect, async (req, res) => {
  try {
    const { latitude, longitude, accuracy, address } = req.body;
    
    const tourist = await Tourist.findByIdAndUpdate(
      req.tourist._id,
      { 
        currentLocation: {
          coordinates: { latitude, longitude },
          accuracy,
          address,
          timestamp: new Date()
        },
        lastActiveAt: new Date()
      },
      { new: true }
    );
    
    res.json({
      success: true,
      message: 'Location updated successfully',
      data: {
        location: tourist.currentLocation
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update location'
    });
  }
});

// @desc    Get location history
// @route   GET /api/location/history
// @access  Private
router.get('/history', protect, async (req, res) => {
  try {
    // TODO: Implement location history tracking
    res.json({
      success: true,
      message: 'Location history endpoint',
      data: []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch location history'
    });
  }
});

export { router as locationRoutes };
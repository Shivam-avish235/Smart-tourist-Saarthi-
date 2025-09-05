import express from 'express';
import { protect } from '../middleware/auth.js';
import Tourist from '../models/Tourist.js';
import { getIO } from '../socket/socket.js';

const router = express.Router();

// @desc    Trigger emergency panic button
// @route   POST /api/emergency/panic
// @access  Private
router.post('/panic', protect, async (req, res) => {
  try {
    const tourist = await Tourist.findById(req.tourist._id);
    
    if (!tourist) {
      return res.status(404).json({
        success: false,
        error: 'Tourist not found'
      });
    }

    // Update tourist status to emergency
    tourist.status = 'emergency';
    tourist.lastActiveAt = new Date();
    
    // Lower safety score during emergency
    tourist.updateSafetyScore(tourist.safetyScore - 30);
    
    await tourist.save();

    // Emit socket event for real-time notifications
    const io = getIO();
    io.emit('emergency-notification', {
      touristId: tourist._id,
      name: `${tourist.personalInfo.firstName} ${tourist.personalInfo.lastName}`,
      location: tourist.currentLocation,
      phone: tourist.personalInfo.phoneNumber,
      emergencyContacts: tourist.emergencyContacts,
      timestamp: new Date()
    });

    // Also emit to specific tourist room for targeted updates
    io.to(`tourist-${tourist._id}`).emit('emergency-alert', {
      message: 'Emergency alert activated! Help is on the way.',
      location: tourist.currentLocation
    });

    console.log(`🚨 EMERGENCY ALERT: Tourist ${tourist.personalInfo.firstName} ${tourist.personalInfo.lastName} activated panic button!`);
    
    res.status(200).json({
      success: true,
      message: 'Emergency alert activated! Help is on the way.',
      data: {
        location: tourist.currentLocation,
        tourist: {
          id: tourist._id,
          name: `${tourist.personalInfo.firstName} ${tourist.personalInfo.lastName}`,
          phone: tourist.personalInfo.phoneNumber
        },
        emergencyContacts: tourist.emergencyContacts
      }
    });
  } catch (error) {
    console.error('Emergency panic error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to activate emergency alert'
    });
  }
});

// @desc    Resolve emergency status
// @route   POST /api/emergency/resolve
// @access  Private
router.post('/resolve', protect, async (req, res) => {
  try {
    const tourist = await Tourist.findById(req.tourist._id);
    
    if (!tourist) {
      return res.status(404).json({
        success: false,
        error: 'Tourist not found'
      });
    }

    // Reset status to active
    tourist.status = 'active';
    tourist.lastActiveAt = new Date();
    
    // Improve safety score after resolution
    tourist.updateSafetyScore(tourist.safetyScore + 20);
    
    await tourist.save();

    // Emit socket event for resolution
    const io = getIO();
    io.emit('emergency-resolved', {
      touristId: tourist._id,
      name: `${tourist.personalInfo.firstName} ${tourist.personalInfo.lastName}`,
      timestamp: new Date()
    });

    res.status(200).json({
      success: true,
      message: 'Emergency status resolved',
      data: {
        status: tourist.status,
        safetyScore: tourist.safetyScore
      }
    });
  } catch (error) {
    console.error('Emergency resolve error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to resolve emergency status'
    });
  }
});

// @desc    Get emergency status
// @route   GET /api/emergency/status
// @access  Private
router.get('/status', protect, async (req, res) => {
  try {
    const tourist = await Tourist.findById(req.tourist._id);
    
    if (!tourist) {
      return res.status(404).json({
        success: false,
        error: 'Tourist not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        status: tourist.status,
        safetyScore: tourist.safetyScore,
        riskLevel: tourist.riskLevel,
        lastActive: tourist.lastActiveAt
      }
    });
  } catch (error) {
    console.error('Emergency status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get emergency status'
    });
  }
});

export { router as emergencyRoutes };

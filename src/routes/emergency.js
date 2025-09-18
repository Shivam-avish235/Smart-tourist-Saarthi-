import express from "express";
import { protect } from "../middleware/auth.js";
import Tourist from "../models/Tourist.js";
import { getIO } from "../socket/socket.js";

const router = express.Router();

// @desc    Trigger emergency panic button
// @route   POST /api/emergency/panic
// @access  Private
router.post("/panic", protect, async (req, res) => {
  try {
    // **FIX**: Using findByIdAndUpdate for a more atomic and reliable operation.
    // This updates the status and decrements the safetyScore in one command.
    const updatedTourist = await Tourist.findByIdAndUpdate(
      req.tourist._id,
      {
        status: 'emergency',
        lastActiveAt: new Date(),
        $inc: { safetyScore: -30 } // Safely decrement the score
      },
      { new: true } // Return the updated document
    );

    if (!updatedTourist) {
      return res
        .status(404)
        .json({ success: false, error: "Tourist not found" });
    }

    const io = getIO();
    io.emit('emergency-notification', {
      touristId: updatedTourist._id,
      name: `${updatedTourist.personalInfo.firstName} ${updatedTourist.personalInfo.lastName}`,
      location: updatedTourist.currentLocation,
      phone: updatedTourist.personalInfo.phoneNumber,
      emergencyContacts: updatedTourist.emergencyContacts,
      reason: req.body.reason || 'Panic button pressed',
      timestamp: new Date()
    });

    console.log(`🚨 EMERGENCY ALERT: Tourist ${updatedTourist.personalInfo.firstName} activated panic button!`);

    res.status(200).json({
      success: true,
      message: 'Emergency alert activated! Help is on the way.',
      data: {
        location: updatedTourist.currentLocation,
        tourist: {
          id: updatedTourist._id,
          name: `${updatedTourist.personalInfo.firstName} ${updatedTourist.personalInfo.lastName}`,
          phone: updatedTourist.personalInfo.phoneNumber
        },
        emergencyContacts: updatedTourist.emergencyContacts,
        reason: req.body.reason || 'Panic button pressed',
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
router.post("/resolve", protect, async (req, res) => {
  try {
    // **FIX**: Using findByIdAndUpdate here as well for consistency and stability.
    const updatedTourist = await Tourist.findByIdAndUpdate(
      req.tourist._id,
      {
        status: "active",
        lastActiveAt: new Date(),
        $inc: { safetyScore: 20 }
      },
      { new: true }
    );

    if (!updatedTourist) {
      return res.status(404).json({
        success: false,
        error: "Tourist not found",
      });
    }

    const io = getIO();
    io.emit("emergency-resolved", {
      touristId: updatedTourist._id,
      name: `${updatedTourist.personalInfo.firstName} ${updatedTourist.personalInfo.lastName}`,
      timestamp: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Emergency status resolved",
      data: {
        status: updatedTourist.status,
        safetyScore: updatedTourist.safetyScore,
      },
    });
  } catch (error) {
    console.error("Emergency resolve error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to resolve emergency status",
    });
  }
});

// @desc    Get emergency status
// @route   GET /api/emergency/status
// @access  Private
router.get("/status", protect, async (req, res) => {
  try {
    const tourist = await Tourist.findById(req.tourist._id);

    if (!tourist) {
      return res.status(404).json({
        success: false,
        error: "Tourist not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        status: tourist.status,
        safetyScore: tourist.safetyScore,
        riskLevel: tourist.riskLevel,
        lastActive: tourist.lastActiveAt,
      },
    });
  } catch (error) {
    console.error("Emergency status error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get emergency status",
    });
  }
});

export { router as emergencyRoutes };


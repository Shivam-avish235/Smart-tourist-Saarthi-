// src/routes/sensor.js
import express from "express";
import SensorData from "../models/SensorData.js";
import Tourist from "../models/Tourist.js";

// Import from the correct path - socket.js is inside socket folder
import { getIO } from "../socket/socket.js";

const router = express.Router();

// POST endpoint for ESP32 data with emergency detection
router.post("/sensor-data", async (req, res) => {
  try {
    const { deviceId, heartbeat, crash, accelerometer, gps } = req.body;

    // Validate required fields
    if (!deviceId || heartbeat === undefined) {
      return res.status(400).json({ 
        success: false, 
        error: "deviceId and heartbeat are required" 
      });
    }

    // Find tourist by deviceId
    const tourist = await Tourist.findOne({ deviceId });
    if (!tourist) {
      return res.status(404).json({ 
        success: false, 
        error: "Tourist not found for this device ID" 
      });
    }

    // Check for emergency conditions
    const isEmergency = crash || heartbeat < 60 || heartbeat > 120;
    
    // Save sensor data to database
    const sensorData = new SensorData({
      userId: tourist._id,
      deviceId,
      heartbeat,
      crash: crash || false,
      accelerometer,
      gps,
      emergencyTriggered: isEmergency,
      timestamp: new Date()
    });

    await sensorData.save();

    // Update tourist status if emergency
    if (isEmergency) {
      tourist.status = 'emergency';
      tourist.riskLevel = 'high';
      await tourist.save();

      // Broadcast emergency alert
      const io = getIO();
      io.emit("emergency-alert", {
        tourist: {
          id: tourist._id,
          name: `${tourist.personalInfo.firstName} ${tourist.personalInfo.lastName}`,
          digitalId: tourist.digitalId
        },
        sensorData: sensorData,
        emergencyType: crash ? 'crash' : 'health_emergency',
        timestamp: new Date()
      });
    }

    // Broadcast real-time sensor data to all connected clients
    const io = getIO();
    io.emit("sensor-update", { 
      userId: tourist._id,
      deviceId,
      heartbeat, 
      crash: crash || false,
      emergency: isEmergency,
      timestamp: new Date()
    });

    console.log("📡 Sensor Data Received & Processed:", { 
      deviceId, 
      heartbeat, 
      crash: crash || false,
      emergency: isEmergency 
    });

    res.status(200).json({ 
      success: true, 
      message: "Data processed successfully",
      emergencyTriggered: isEmergency,
      touristId: tourist._id
    });

  } catch (err) {
    console.error("Sensor Route Error:", err.message);
    res.status(500).json({ 
      success: false, 
      error: "Internal Server Error" 
    });
  }
});

// Get sensor data for a specific tourist
router.get("/tourist/:touristId", async (req, res) => {
  try {
    const { touristId } = req.params;
    const { limit = 50 } = req.query;

    const data = await SensorData.find({ userId: touristId })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json({ success: true, data });
  } catch (err) {
    console.error("Get sensor data error:", err.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

// Get latest sensor data for a device
router.get("/device/:deviceId/latest", async (req, res) => {
  try {
    const data = await SensorData.findOne({ deviceId: req.params.deviceId })
      .sort({ timestamp: -1 });

    if (!data) {
      return res.status(404).json({ success: false, error: "No data found" });
    }

    res.json({ success: true, data });
  } catch (err) {
    console.error("Get latest data error:", err.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

// Simple test endpoint
router.get("/test", (req, res) => {
  res.json({ 
    success: true, 
    message: "Sensor route is working!",
    timestamp: new Date().toISOString()
  });
});

export default router;
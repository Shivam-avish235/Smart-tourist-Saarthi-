import mongoose from "mongoose";

const SensorDataSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Tourist", 
    required: true 
  },
  deviceId: { 
    type: String, 
    required: true 
  },
  heartbeat: { 
    type: Number, 
    required: true,
    min: 30,
    max: 220
  },
  crash: { 
    type: Boolean, 
    required: true,
    default: false
  },
  accelerometer: {
    x: Number,
    y: Number,
    z: Number
  },
  gps: {
    latitude: Number,
    longitude: Number,
    accuracy: Number
  },
  emergencyTriggered: {
    type: Boolean,
    default: false
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  },
});

// Index for faster queries
SensorDataSchema.index({ userId: 1, timestamp: -1 });
SensorDataSchema.index({ deviceId: 1, timestamp: -1 });

export default mongoose.model("SensorData", SensorDataSchema);
// src/models/EmergencyAlert.js
import mongoose from "mongoose";

const EmergencyAlertSchema = new mongoose.Schema({
  touristId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Tourist",
    required: true
  },
  type: {
    type: String,
    enum: ['crash', 'health_emergency', 'manual', 'geofence'],
    required: true
  },
  location: {
    latitude: Number,
    longitude: Number,
    accuracy: Number,
    address: String
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['active', 'resolved', 'false_alarm'],
    default: 'active'
  },
  sensorData: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SensorData"
  },
  description: String,
  resolvedAt: Date,  timestamp: {
    type: Date,
    default: Date.now
  }
});

EmergencyAlertSchema.index({ touristId: 1, timestamp: -1 });
EmergencyAlertSchema.index({ status: 1 });

export default mongoose.model("EmergencyAlert", EmergencyAlertSchema);
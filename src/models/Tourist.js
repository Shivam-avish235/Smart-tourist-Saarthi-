import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const emergencyContactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  relationship: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  isPrimary: {
    type: Boolean,
    default: false
  }
});

const locationSchema = new mongoose.Schema({
  coordinates: {
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    }
  },
  address: String,
  timestamp: {
    type: Date,
    default: Date.now
  },
  accuracy: Number
});

// Main tourist schema with all fields integrated
const touristSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  personalInfo: {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    dateOfBirth: {
      type: Date,
      required: true
    },
    nationality: {
      type: String,
      required: true
    },
    phoneNumber: {
      type: String,
      required: true
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other']
    },
    preferredLanguage: {
      type: String,
      default: 'english'
    }
  },
  kycDetails: {
    documentType: {
      type: String,
      enum: ['aadhaar', 'passport', 'voter_id', 'driver_license'],
      required: true
    },
    documentNumber: {
      type: String,
      required: true
    },
    documentImage: String,
    verified: {
      type: Boolean,
      default: false
    },
    verifiedBy: String,
    verificationDate: Date
  },
  tripDetails: {
    purpose: {
      type: String,
      enum: ['tourism', 'business', 'education', 'other'],
      default: 'tourism'
    },
    checkInDate: {
      type: Date,
      required: true
    },
    checkOutDate: {
      type: Date,
      required: true
    },
    plannedItinerary: [{
      location: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      },
      plannedDate: Date,
      duration: Number
    }]
  },
  currentLocation: locationSchema,
  // Location history array - properly integrated
  locationHistory: [{
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    accuracy: Number,
    timestamp: {
      type: Date,
      default: Date.now
    },
    address: String
  }],
  safetyScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'emergency', 'missing'],
    default: 'active'
  },
  emergencyContacts: [emergencyContactSchema],
  lastActiveAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add indexes
touristSchema.index({ 'currentLocation.coordinates': '2dsphere' });
touristSchema.index({ status: 1, lastActiveAt: -1 });
touristSchema.index({ 'locationHistory.timestamp': -1 }); // Index for location history queries

// Hash password before saving
touristSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
touristSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to add location to history
touristSchema.methods.addLocationToHistory = function(locationData) {
  // Keep only last 100 location points to prevent excessive growth
  if (this.locationHistory.length >= 100) {
    this.locationHistory.shift(); // Remove oldest location
  }
  
  this.locationHistory.push({
    coordinates: locationData.coordinates,
    accuracy: locationData.accuracy,
    address: locationData.address,
    timestamp: new Date()
  });
};

// Method to check if tourist is in emergency
touristSchema.methods.isInEmergency = function() {
  return this.status === 'emergency';
};

// Method to update safety score
touristSchema.methods.updateSafetyScore = function(newScore) {
  this.safetyScore = Math.max(0, Math.min(100, newScore));
  
  // Update risk level based on safety score
  if (this.safetyScore >= 80) {
    this.riskLevel = 'low';
  } else if (this.safetyScore >= 50) {
    this.riskLevel = 'medium';
  } else {
    this.riskLevel = 'high';
  }
};

// Create and export the model
const Tourist = mongoose.model('Tourist', touristSchema);
export default Tourist;
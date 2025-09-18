import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const generateDigitalId = () => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 10);
  return `DI-${timestamp}-${randomStr}`.toUpperCase();
};

const emergencyContactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  relationship: { type: String, default: 'Unknown' },
  phoneNumber: { type: String, required: true },
}, {_id: false});

const touristSchema = new mongoose.Schema({
  digitalId: {
    type: String,
    unique: true,
    required: true,
    default: generateDigitalId
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  personalInfo: {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    dateOfBirth: { type: Date, required: true },
    nationality: { type: String, required: true },
    phoneNumber: { type: String, required: true }
  },
  kycDetails: {
    documentType: { type: String, required: true, enum: ['aadhaar', 'passport', 'driving_license'] },
    documentNumber: { type: String, required: true },
    verified: { type: Boolean, default: false }
  },
  emergencyContacts: [emergencyContactSchema],
  healthInfo: {
    hasHealthCondition: { type: Boolean, default: false },
    description: { type: String, default: '' }
  },
  currentLocation: {
      coordinates: {
          latitude: Number,
          longitude: Number,
      },
      accuracy: Number,
      timestamp: Date,
      address: String,
  },
  status: { type: String, enum: ['active', 'inactive', 'emergency'], default: 'active' },
  lastActiveAt: { type: Date, default: Date.now },
  safetyScore: { type: Number, default: 100, min: 0, max: 100 },
  riskLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
}, { timestamps: true });


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
  return await bcrypt.compare(candidatePassword, this.password);
};

const Tourist = mongoose.model('Tourist', touristSchema);

export default Tourist;


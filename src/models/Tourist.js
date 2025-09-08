import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Helper function to generate a unique digitalId
const generateDigitalId = () => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 10);
  return `DI-${timestamp}-${randomStr}`.toUpperCase();
};

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
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required']
    },
    nationality: {
      type: String,
      required: [true, 'Nationality is required']
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required']
    }
  },
  kycDetails: {
    documentType: {
      type: String,
      required: [true, 'Document type is required'],
      enum: ['aadhaar', 'passport', 'driving_license']
    },
    documentNumber: {
      type: String,
      required: [true, 'Document number is required']
    },
    verified: {
      type: Boolean,
      default: false
    }
  },
  tripDetails: {
    checkInDate: {
      type: Date,
      default: Date.now
    },
    checkOutDate: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for better query performance
touristSchema.index({ email: 1 });
touristSchema.index({ digitalId: 1 });

// Middleware to update the updatedAt field before saving
touristSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

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

// Transform output to remove password and __v
touristSchema.methods.toJSON = function() {
  const tourist = this.toObject();
  delete tourist.password;
  delete tourist.__v;
  return tourist;
};

const Tourist = mongoose.model('Tourist', touristSchema);

export default Tourist;
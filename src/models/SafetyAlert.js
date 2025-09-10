import mongoose from 'mongoose';

const safetyAlertSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: [
            'Weather Warning',
            'Security Threat',
            'Health Advisory',
            'Transport Disruption',
            'Crowd Management',
            'Natural Disaster'
        ]
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    severity: {
        type: String,
        required: true,
        enum: ['Low', 'Medium', 'High', 'Critical']
    },
    location: {
        coordinates: {
            latitude: Number,
            longitude: Number
        },
        address: String,
        radius: Number // in kilometers
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['Active', 'Resolved', 'Monitoring'],
        default: 'Active'
    },
    affectedAttractions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Attraction'
    }],
    safetyMeasures: [{
        type: String,
        trim: true
    }],
    updates: [{
        timestamp: {
            type: Date,
            default: Date.now
        },
        message: String
    }]
}, {
    timestamps: true
});

// Indexes
safetyAlertSchema.index({ 'location.coordinates': '2dsphere' });
safetyAlertSchema.index({ status: 1 });
safetyAlertSchema.index({ startTime: 1 });
safetyAlertSchema.index({ severity: 1 });

export default mongoose.model('SafetyAlert', safetyAlertSchema);

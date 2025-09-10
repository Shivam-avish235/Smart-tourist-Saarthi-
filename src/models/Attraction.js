import mongoose from 'mongoose';

const attractionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Historical', 'Religious', 'Nature', 'Adventure', 'Cultural']
    },
    location: {
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
        address: {
            type: String,
            required: true
        }
    },
    images: [{
        type: String,
        validate: {
            validator: function(v) {
                return /^https?:\/\/.+/.test(v);
            },
            message: 'Invalid URL format for image'
        }
    }],
    openingHours: {
        open: String,
        close: String,
        holidays: [String]
    },
    ticketPrice: {
        adult: Number,
        child: Number,
        foreign: Number
    },
    ratings: {
        average: {
            type: Number,
            min: 0,
            max: 5,
            default: 0
        },
        count: {
            type: Number,
            default: 0
        }
    },
    facilities: [{
        type: String,
        trim: true
    }],
    safetyMetrics: {
        crowdDensity: {
            type: String,
            enum: ['Low', 'Medium', 'High']
        },
        securityLevel: {
            type: String,
            enum: ['Basic', 'Medium', 'High']
        },
        emergencyServices: {
            type: String,
            enum: ['Available', 'On Call', '24/7']
        }
    },
    nearbyServices: [{
        name: String,
        type: String,
        distance: Number
    }]
}, {
    timestamps: true
});

// Indexes
attractionSchema.index({ 'location.coordinates': '2dsphere' });
attractionSchema.index({ category: 1 });
attractionSchema.index({ 'ratings.average': -1 });

export default mongoose.model('Attraction', attractionSchema);

import mongoose from 'mongoose';

const geofenceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
        },
        // Store in [Longitude, Latitude] format
        coordinates: {
            type: [Number],
            required: true,
        },
    },
    radius: {
        type: Number, // In meters
        required: true,
    },
    dangerLevel: {
        type: String,
        required: true,
        enum: ['safe', 'caution', 'danger'], // Green, Yellow, Red
    },
}, {
    timestamps: true,
});

// Index for geospatial queries
geofenceSchema.index({ location: '2dsphere' });

const Geofence = mongoose.model('Geofence', geofenceSchema);

export default Geofence;
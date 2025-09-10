import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    touristId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tourist',
        required: true
    },
    attractionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Attraction',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    visitDate: {
        type: Date,
        required: true
    },
    photos: [{
        type: String,
        validate: {
            validator: function(v) {
                return /^https?:\/\/.+/.test(v);
            },
            message: 'Invalid URL format for photo'
        }
    }],
    tags: [{
        type: String,
        trim: true
    }],
    helpfulVotes: {
        type: Number,
        default: 0
    },
    isVerified: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Indexes
reviewSchema.index({ touristId: 1, attractionId: 1 });
reviewSchema.index({ rating: -1 });
reviewSchema.index({ helpfulVotes: -1 });

export default mongoose.model('Review', reviewSchema);

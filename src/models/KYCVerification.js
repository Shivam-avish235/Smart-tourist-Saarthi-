import mongoose from 'mongoose';
import crypto from 'crypto';

const kycVerificationSchema = new mongoose.Schema({
    touristId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tourist',
        required: true,
        unique: true
    },
    
    blockchainRecord: {
        transactionHash: String,
        contractAddress: String,
        blockNumber: Number,
        gasUsed: Number
    },
    
    digitalIdentityHash: {
        type: String,
        required: true,
        unique: true
    },
    
    documents: [{
        type: {
            type: String,
            enum: ['aadhaar', 'passport', 'driving_license', 'voter_id', 'pan_card'],
            required: true
        },
        documentNumber: String,
        verificationStatus: {
            type: String,
            enum: ['pending', 'verified', 'rejected'],
            default: 'pending'
        },
        verifiedBy: String,
        verificationDate: Date
    }],
    
    overallStatus: {
        type: String,
        enum: ['unverified', 'pending', 'verified', 'flagged'],
        default: 'unverified'
    },
    
    riskScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 50
    },
    
    auditLog: [{
        action: String,
        performedBy: String,
        timestamp: { type: Date, default: Date.now },
        details: mongoose.Schema.Types.Mixed
    }]
}, {
    timestamps: true
});

kycVerificationSchema.methods.generateDigitalIdentityHash = function() {
    const data = {
        touristId: this.touristId,
        documents: this.documents.map(doc => ({
            type: doc.type,
            number: doc.documentNumber
        })),
        timestamp: new Date()
    };
    
    this.digitalIdentityHash = crypto
        .createHash('sha256')
        .update(JSON.stringify(data))
        .digest('hex');
    
    return this.digitalIdentityHash;
};

kycVerificationSchema.methods.addAuditLog = function(action, performedBy, details, ipAddress) {
    this.auditLog.push({
        action,
        performedBy,
        details,
        ipAddress,
        timestamp: new Date()
    });
};

export default mongoose.model('KYCVerification', kycVerificationSchema);

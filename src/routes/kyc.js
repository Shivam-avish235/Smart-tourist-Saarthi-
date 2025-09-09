import express from 'express';
import KYCVerification from '../models/KYCVerification.js';
import BlockchainService from '../services/blockchainService.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
const blockchainService = new BlockchainService();

// Initiate KYC verification
router.post('/kyc/initiate', protect, async (req, res) => {
    try {
        const { documents, biometricData } = req.body;
        const touristId = req.tourist._id;
        
        let kycVerification = await KYCVerification.findOne({ touristId });
        
        if (!kycVerification) {
            kycVerification = new KYCVerification({
                touristId,
                documents: documents || [],
                biometricData: biometricData || {}
            });
        }
        
        const digitalIdentityHash = kycVerification.generateDigitalIdentityHash();
        
        try {
            const blockchainRecord = await blockchainService.createDigitalIdentity(
                touristId.toString(),
                digitalIdentityHash
            );
            kycVerification.blockchainRecord = blockchainRecord;
        } catch (blockchainError) {
            console.error('Blockchain integration failed:', blockchainError);
        }
        
        kycVerification.addAuditLog(
            'KYC_INITIATED',
            touristId.toString(),
            { documents: documents?.length || 0 },
            req.ip
        );
        
        await kycVerification.save();
        
        res.status(201).json({
            success: true,
            message: 'KYC verification initiated',
            data: {
                verificationId: kycVerification._id,
                digitalIdentityHash,
                blockchainTxHash: kycVerification.blockchainRecord?.transactionHash
            }
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to initiate KYC verification'
        });
    }
});

// Get KYC status
router.get('/kyc/status', protect, async (req, res) => {
    try {
        const kycVerification = await KYCVerification.findOne({ 
            touristId: req.tourist._id 
        });
        
        if (!kycVerification) {
            return res.json({
                success: true,
                data: {
                    status: 'not_initiated',
                    verificationLevel: 'none'
                }
            });
        }
        
        res.json({
            success: true,
            data: {
                status: kycVerification.overallStatus,
                verificationLevel: kycVerification.verificationLevel,
                riskScore: kycVerification.riskScore,
                documents: kycVerification.documents.map(doc => ({
                    type: doc.type,
                    status: doc.verificationStatus,
                    verificationDate: doc.verificationDate
                })),
                blockchainVerified: !!kycVerification.blockchainRecord?.transactionHash
            }
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch KYC status'
        });
    }
});

export { router as kycRoutes };

import express from 'express';
import jwt from 'jsonwebtoken';
import Tourist from '../models/Tourist.js';
import Incident from '../models/Incident.js';

const router = express.Router();

// Admin login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
        const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
        
        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            const token = jwt.sign(
                { id: 'admin', role: 'admin' },
                process.env.JWT_SECRET,
                { expiresIn: '8h' }
            );
            
            res.json({
                success: true,
                message: 'Admin login successful',
                data: { token, role: 'admin' }
            });
        } else {
            res.status(401).json({
                success: false,
                error: 'Invalid admin credentials'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server error during admin login'
        });
    }
});

// Dashboard statistics
router.get('/dashboard/stats', async (req, res) => {
    try {
        const totalTourists = await Tourist.countDocuments();
        const activeTourists = await Tourist.countDocuments({
            lastActiveAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        });
        
        const activeIncidents = await Incident.countDocuments({
            status: { $in: ['New', 'Acknowledged', 'In Progress'] }
        });
        
        const highRiskTourists = await Tourist.countDocuments({
            riskLevel: 'High'
        });
        
        const recentAlerts = await Incident.find({
            createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        })
        .populate('touristId', 'personalInfo')
        .sort({ createdAt: -1 })
        .limit(10);
        
        res.json({
            success: true,
            data: {
                totalTourists,
                activeTourists,
                emergencyAlerts: activeIncidents,
                highRiskAreas: highRiskTourists,
                recentAlerts
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch dashboard statistics'
        });
    }
});

// Get all tourists with geolocation
router.get('/tourists', async (req, res) => {
    try {
        const tourists = await Tourist.find({}, {
            digitalId: 1,
            'personalInfo.firstName': 1,
            'personalInfo.lastName': 1,
            'personalInfo.phoneNumber': 1,
            currentLocation: 1,
            safetyScore: 1,
            riskLevel: 1,
            status: 1,
            lastActiveAt: 1
        });
        
        res.json({
            success: true,
            data: tourists
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch tourists data'
        });
    }
});

// Get geofences data
router.get('/admin/geofences', async (req, res) => {
    try {
        const sampleGeofences = [
            {
                id: '1',
                name: 'Safe Zone - City Center',
                type: 'circle',
                center: { lat: 26.1445, lng: 91.7362 },
                radius: 2000,
                dangerLevel: 'safe'
            },
            {
                id: '2',
                name: 'Caution Area - Market District',
                type: 'circle',
                center: { lat: 26.1500, lng: 91.7400 },
                radius: 1500,
                dangerLevel: 'caution'
            },
            {
                id: '3',
                name: 'High Risk - Industrial Zone',
                type: 'circle',
                center: { lat: 26.1350, lng: 91.7300 },
                radius: 1000,
                dangerLevel: 'danger'
            }
        ];
        
        res.json({
            success: true,
            data: sampleGeofences
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch geofences'
        });
    }
});

export { router as adminRoutes };

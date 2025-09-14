import express from 'express';
import jwt from 'jsonwebtoken';
import Tourist from '../models/Tourist.js';
import Incident from '../models/Incident.js';

const router = express.Router();

// Admin login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        const token = jwt.sign({ id: 'admin', role: 'admin' }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '8h' });
        res.json({ success: true, data: { token } });
    } else {
        res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
});

// Dashboard statistics
router.get('/dashboard/stats', async (req, res) => {
    try {
        const totalTourists = await Tourist.countDocuments();
        const activeTourists = await Tourist.countDocuments({ lastActiveAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } });
        const activeIncidents = await Incident.countDocuments({ status: { $in: ['New', 'In Progress'] } });
        const highRiskTourists = await Tourist.countDocuments({ riskLevel: 'High' });
        const recentAlerts = await Incident.find({ createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } })
            .populate('touristId', 'personalInfo')
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({ success: true, data: { totalTourists, activeTourists, emergencyAlerts: activeIncidents, highRiskAreas: highRiskTourists, recentAlerts } });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch stats' });
    }
});

// Get all tourists
router.get('/tourists', async (req, res) => {
    try {
        const tourists = await Tourist.find({}, 'personalInfo status safetyScore lastActiveAt riskLevel currentLocation');
        res.json({ success: true, data: tourists });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch tourists' });
    }
});

export { router as adminRoutes };


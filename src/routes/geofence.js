import express from 'express';
import Geofence from '../models/Geofence.js';

const router = express.Router();

// @desc    Create a new Geofence Zone
// @route   POST /api/geofences
router.post('/', async (req, res) => {
    try {
        const { name, latitude, longitude, radius, dangerLevel } = req.body;

        if (name === undefined || latitude === undefined || longitude === undefined || radius === undefined || dangerLevel === undefined) {
            return res.status(400).json({ success: false, error: 'All fields are required' });
        }

        const geofence = new Geofence({
            name,
            location: {
                coordinates: [longitude, latitude], // MongoDB uses [long, lat] format
            },
            radius,
            dangerLevel,
        });

        await geofence.save();
        res.status(201).json({ success: true, data: geofence });
    } catch (error) {
        console.error('Error creating geofence:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @desc    Get all Geofence Zones
// @route   GET /api/geofences
router.get('/', async (req, res) => {
    try {
        const geofences = await Geofence.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: geofences });
    } catch (error) {
        console.error('Error fetching geofences:', error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @desc    Update a Geofence Zone
// @route   PUT /api/geofences/:id
router.put('/:id', async (req, res) => {
    try {
        const { name, latitude, longitude, radius, dangerLevel } = req.body;
        
        const updatedData = {
            name,
            location: {
                coordinates: [longitude, latitude],
            },
            radius,
            dangerLevel,
        };

        const geofence = await Geofence.findByIdAndUpdate(req.params.id, updatedData, {
            new: true,
            runValidators: true,
        });

        if (!geofence) {
            return res.status(404).json({ success: false, error: 'Geofence not found' });
        }

        res.status(200).json({ success: true, data: geofence });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});

// @desc    Delete a Geofence Zone
// @route   DELETE /api/geofences/:id
router.delete('/:id', async (req, res) => {
    try {
        const geofence = await Geofence.findByIdAndDelete(req.params.id);

        if (!geofence) {
            return res.status(404).json({ success: false, error: 'Geofence not found' });
        }

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server Error' });
    }
});


export { router as geofenceRoutes };
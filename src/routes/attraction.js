import express from 'express';
import Attraction from '../models/Attraction.js';

const router = express.Router();

// All attractions
router.get('/', async (req, res) => {
  try {
    const attractions = await Attraction.find();
    res.json(attractions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch attractions' });
  }
});

export default router;

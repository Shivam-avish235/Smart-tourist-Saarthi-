import express from 'express';
import Tourist from '../models/Tourist.js'; // bana lo schema Tourist ke liye

const router = express.Router();

// Total count
router.get('/count', async (req, res) => {
  try {
    const count = await Tourist.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch count' });
  }
});

// All tourists
router.get('/', async (req, res) => {
  try {
    const tourists = await Tourist.find();
    res.json(tourists);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tourists' });
  }
});

export default router;

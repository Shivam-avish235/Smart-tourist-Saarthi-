import Tourist from '../models/Tourist.js';
import { getIO } from '../socket/socket.js';

export const getAllTourists = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const filter = {};

    if (req.query.riskLevel) filter.riskLevel = req.query.riskLevel;
    if (req.query.country) filter.country = req.query.country;
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';

    const tourists = await Tourist.find(filter).skip(skip).limit(limit).sort({ lastActive: -1 });
    const total = await Tourist.countDocuments(filter);

    res.json({
      success: true,
      data: tourists,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

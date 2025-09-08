import Tourist from '../models/Tourist.js';
import { getIO } from '../socket/socket.js';

// Get all tourists with filtering and pagination
export const getAllTourists = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (req.query.riskLevel) filter.riskLevel = req.query.riskLevel;
    if (req.query.country) filter.country = req.query.country;
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';

    const tourists = await Tourist.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ lastActive: -1 });

    const total = await Tourist.countDocuments(filter);

    res.json({
      success: true,
      data: tourists,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get tourist by ID
export const getTouristById = async (req, res) => {
  try {
    const tourist = await Tourist.findById(req.params.id);

    if (!tourist) {
      return res.status(404).json({
        success: false,
        error: 'Tourist not found'
      });
    }

    res.json({ success: true, data: tourist });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update tourist profile
export const updateTourist = async (req, res) => {
  try {
    const tourist = await Tourist.findByIdAndUpdate(
      req.params.id,
      { ...req.body, lastActive: new Date() },
      { new: true, runValidators: true }
    );

    if (!tourist) {
      return res.status(404).json({
        success: false,
        error: 'Tourist not found'
      });
    }

    // Emit real-time update
    const io = getIO();
    io.emit('tourist_updated', tourist);

    res.json({ success: true, data: tourist });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update safety score
export const updateSafetyScore = async (req, res) => {
  try {
    const { id } = req.params;
    const { factors } = req.body; // { location, activity, health, etc. }

    const tourist = await Tourist.findById(id);
    if (!tourist) {
      return res.status(404).json({
        success: false,
        error: 'Tourist not found'
      });
    }

    // Calculate safety score based on factors
    let score = 75; // Base score

    if (factors.location?.riskLevel === 'High') score -= 20;
    else if (factors.location?.riskLevel === 'Medium') score -= 10;

    if (factors.activity?.inactive > 30) score -= 15; // 30 min inactive
    if (factors.health?.heartRate > 120) score -= 10; // High heart rate
    if (factors.health?.heartRate < 50) score -= 15; // Low heart rate

    tourist.safetyScore = Math.max(0, Math.min(100, score));
    tourist.lastActive = new Date();

    // Update risk level based on score
    if (tourist.safetyScore < 30) tourist.riskLevel = 'High';
    else if (tourist.safetyScore < 60) tourist.riskLevel = 'Medium';
    else tourist.riskLevel = 'Low';

    await tourist.save();

    // Emit real-time update
    const io = getIO();
    io.emit('safety_score_updated', {
      touristId: tourist._id,
      safetyScore: tourist.safetyScore,
      riskLevel: tourist.riskLevel
    });

    res.json({ success: true, data: tourist });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get tourist analytics
export const getTouristAnalytics = async (req, res) => {
  try {
    const totalTourists = await Tourist.countDocuments({ isActive: true });
    const activeTourists = await Tourist.countDocuments({ 
      isActive: true,
      lastActive: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
    });

    const riskDistribution = await Tourist.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$riskLevel', count: { $sum: 1 } } }
    ]);

    const avgSafetyScore = await Tourist.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, avgScore: { $avg: '$safetyScore' } } }
    ]);

    const countryDistribution = await Tourist.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$country', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        totalTourists,
        activeTourists,
        averageSafetyScore: avgSafetyScore[0]?.avgScore || 0,
        riskDistribution,
        countryDistribution
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

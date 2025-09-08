import jwt from 'jsonwebtoken';
import Tourist from '../models/Tourist.js';

// Protect routes - verify JWT token
export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      
      // Get tourist from token
      req.tourist = await Tourist.findById(decoded.id);
      
      if (!req.tourist) {
        return res.status(401).json({
          success: false,
          error: 'Not authorized to access this route'
        });
      }
      
      next();
    } catch (error) {
      console.error('Token verification error:', error.message);
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Server error during authentication'
    });
  }
};

// Optional: Admin authorization middleware
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.tourist.role)) {
      return res.status(403).json({
        success: false,
        error: `User role ${req.tourist.role} is not authorized to access this route`
      });
    }
    next();
  };
};
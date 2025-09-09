// middleware/auth.js

import jwt from 'jsonwebtoken';
import Tourist from '../models/Tourist.js';

// protect middleware

export const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.tourist = await Tourist.findById(decoded.id).select('-password');
    if (!req.tourist) {
      return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
    }

    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
  }
};

// authorize middleware

export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.tourist.role)) {
    return res.status(403).json({
      success: false,
      error: `User role ${req.tourist.role} is not authorized to access this route`,
    });
  }
  next();
};

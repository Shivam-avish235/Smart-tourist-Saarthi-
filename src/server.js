import cors from 'cors';
import { config } from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import mongoose from 'mongoose';
import morgan from 'morgan';
import path from 'path'; // For static file serving
import { fileURLToPath } from 'url';

import { initSocket } from './socket/socket.js';


// Load environment variables
config({ path: './.env' });

// Route imports
import { adminRoutes } from './routes/admin.js'; // Admin related APIs
import { emergencyRoutes } from './routes/emergency.js';
import { kycRoutes } from './routes/kyc.js';
import { locationRoutes } from './routes/location.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



// Serve frontend static files from the "public" directory at root URL
app.use(express.static(path.join(__dirname, '..', 'public')));

// Serve index.html on root route for SPA fallback
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});


// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS config: Allow frontend url (adjust production URL accordingly)
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000'
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Security headers with Helmet - use hashes or nonces instead of 'unsafe-inline'
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", 'https:'],
      scriptSrc: ["'self'", 'https:'],
      // Add other directives as needed (e.g., imgSrc, connectSrc)
    },
  },
  crossOriginEmbedderPolicy: false
}));

// Logging
app.use(process.env.NODE_ENV === 'development' ? morgan('dev') : morgan('combined'));

// MongoDB connection check
if (!process.env.MONGO_URI) {
  console.error('❌ MONGO_URI is not defined in environment variables');
  process.exit(1);
}

const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
};

mongoose.connect(process.env.MONGO_URI, mongooseOptions)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// Optional: Serve frontend static files (if built and present in /public)
// Uncomment if you plan to serve frontend via this Express server:
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// app.use(express.static(path.join(__dirname, '..', 'public')));

// Mount API routes with consistent prefixes
app.use('/api/admin', adminRoutes);

app.use('/api/emergency', emergencyRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/kyc', kycRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  let dbStatusText;
  switch (dbStatus) {
    case 0: dbStatusText = 'disconnected'; break;
    case 1: dbStatusText = 'connected'; break;
    case 2: dbStatusText = 'connecting'; break;
    case 3: dbStatusText = 'disconnecting'; break;
    default: dbStatusText = 'unknown';
  }
  res.status(200).json({
    success: true,
    message: 'Server is running',
    database: dbStatusText,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: 'Invalid JSON format in request body'
    });
  }

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: errors
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      error: `Duplicate field value: ${field}`,
      details: `The ${field} '${err.keyValue[field]}' already exists`
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token expired'
    });
  }

  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Server Error'
  });
});

// 404 handler (placed last, after all routes/middleware)
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl
  });
});

const PORT = process.env.PORT || 5000;

// Start HTTP server and initialize Socket.io
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
});

initSocket(server);

// Graceful shutdown for unhandled rejections and exceptions
process.on('unhandledRejection', (err, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', err);
  mongoose.connection.close(() => {
    server.close(() => process.exit(1));
  });
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  mongoose.connection.close(() => {
    server.close(() => process.exit(1));
  });
});

export default app;

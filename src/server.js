import cors from 'cors';
import { config } from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import mongoose from 'mongoose';
import morgan from 'morgan';
import { initSocket } from './socket/socket.js';

// Load env vars FIRST
config({ path: './.env' });

// Log environment variables to verify they're loading
console.log('MONGO_URI:', process.env.MONGO_URI);
console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);

// Route imports
import { authRoutes } from './routes/auth.js';
import { emergencyRoutes } from './routes/emergency.js';
import { locationRoutes } from './routes/location.js';

// Create Express app
const app = express();

// Body parser middleware
app.use(express.json({ 
  limit: '10mb'
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Enable CORS with more options
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || 'http://localhost:3000' 
    : 'http://localhost:3000',
  credentials: true
}));

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// MongoDB connection with better error handling and options
if (!process.env.MONGO_URI) {
  console.error('❌ MONGO_URI is not defined in environment variables');
  process.exit(1);
}

// MongoDB connection options
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

// Handle MongoDB connection events
mongoose.connection.on('error', err => {
  console.error('❌ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('ℹ️  MongoDB disconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('ℹ️  Shutting down gracefully...');
  await mongoose.connection.close();
  console.log('✅ MongoDB connection closed.');
  process.exit(0);
});

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/location', locationRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Smart Tourist Safety System API is running!',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Health check endpoint with DB status
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  let dbStatusText;
  
  switch(dbStatus) {
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
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: errors
    });
  }
  
  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      error: `Duplicate field value: ${field}`,
      details: `The ${field} '${err.keyValue[field]}' already exists`
    });
  }
  
  // JWT errors
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

// Handle 404 routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl
  });
});

const PORT = process.env.PORT || 5000;

// Create server instance
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Initialize Socket.io with the server
initSocket(server);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  server.close(() => {
    process.exit(1);
  });
});

export default app;
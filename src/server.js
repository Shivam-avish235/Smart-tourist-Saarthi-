import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

// Import initializer
import { initializeServer } from './config/initialize.js';

// Route imports
import { adminRoutes } from './routes/admin.js';
import attractionRoutes from './routes/attraction.js';
import authRoutes from './routes/auth.js';
import { emergencyRoutes } from './routes/emergency.js';
import { kycRoutes } from './routes/kyc.js';
import { locationRoutes } from './routes/location.js';
import touristRoutes from './routes/tourist.js';
import { geofenceRoutes } from './routes/geofence.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors());

// --- FIX: Updated helmet configuration to allow map tiles and referrer ---
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "img-src": ["'self'", "data:", "*.tile.openstreetmap.org"],
        "script-src": ["'self'", "unpkg.com", "cdn.jsdelivr.net"],
        "connect-src": ["'self'"],
      },
    },
    // Add this policy to allow the browser to send a referrer header
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  })
);

app.use(morgan('dev'));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '..', 'public')));

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/tourists', touristRoutes);
app.use('/api/attractions', attractionRoutes);
app.use('/api/geofences', geofenceRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is healthy' });
});

// Serve index.html on root route for SPA fallback
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Server Error'
  });
});

// Initialize server
if (process.env.NODE_ENV !== 'test') {
  initializeServer(app).catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}

export default app;


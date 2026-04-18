/**
 * DS3 Spatial Render Service
 * Task 3.1: WebXR/ARKit/ARCore service for AR visualization
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8083;

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'spatial-render-service',
    version: '1.0.0',
    features: ['webxr', 'arkit', 'arcore', 'avatar-management']
  });
});

// Routes
app.use('/v1/spatial', require('./routes/index.js'));

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Spatial Render Service running on port ${PORT}`);
});

export default app;

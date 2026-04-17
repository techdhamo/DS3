import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import rateLimit from '@fastify/rate-limit';
import dotenv from 'dotenv';

import { masterAccountRoutes } from './routes/master-accounts';
import { profileRoutes } from './routes/profiles';
import { delegatedLinkRoutes } from './routes/delegated-links';
import { photoRoutes } from './routes/photos';
import { errorHandler } from './middleware/error-handler';
import { setupDatabase } from './db/setup';

dotenv.config();

const app = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport: process.env.NODE_ENV === 'development' ? {
      target: 'pino-pretty',
      options: {
        colorize: true
      }
    } : undefined
  }
});

// Register plugins
app.register(cors, {
  origin: process.env.CORS_ORIGIN || true,
  credentials: true
});

app.register(jwt, {
  secret: process.env.JWT_SECRET || 'your-secret-key',
  sign: {
    expiresIn: '7d'
  }
});

app.register(multipart, {
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
    files: 10
  }
});

app.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute'
});

// Error handler
app.setErrorHandler(errorHandler);

// Health check
app.get('/health', async () => {
  return { status: 'ok', service: 'identity-service', version: '1.0.0' };
});

// Register routes
app.register(masterAccountRoutes, { prefix: '/v1/identity/master-accounts' });
app.register(profileRoutes, { prefix: '/v1/identity/profiles' });
app.register(delegatedLinkRoutes, { prefix: '/v1/identity/delegated-links' });
app.register(photoRoutes, { prefix: '/v1/identity/photos' });

// Start server
const start = async () => {
  try {
    // Setup database
    await setupDatabase();
    
    const port = parseInt(process.env.PORT || '3001');
    const host = process.env.HOST || '0.0.0.0';
    
    await app.listen({ port, host });
    app.log.info(`Identity Service running on ${host}:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();

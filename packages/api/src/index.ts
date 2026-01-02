import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Load environment variables before other imports
dotenv.config();

import prisma from './lib/prisma';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import teamRoutes from './routes/team';
import thoughtRoutes from './routes/thoughts';
import topicRoutes from './routes/topics';
import meetingRoutes from './routes/meetings';
import actionRoutes from './routes/actions';
import labelRoutes from './routes/labels';
import competencyRoutes from './routes/competencies';
import notificationRoutes from './routes/notifications';
import uploadRoutes from './routes/uploads';
import adminImportRoutes from './routes/admin/import';

const app = express();
const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5175';

// ===========================================
// Middleware
// ===========================================

// CORS - allow frontend origin
app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Request logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ===========================================
// Routes
// ===========================================

// Health check endpoint (outside /api/v1 for load balancers)
app.get('/health', async (_req, res) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected',
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: process.env.NODE_ENV === 'development' ? String(error) : undefined,
    });
  }
});

// API info endpoint
app.get('/api/v1', (_req, res) => {
  res.json({
    success: true,
    data: {
      name: '1:1 Companion API',
      version: '0.1.0',
      environment: process.env.NODE_ENV || 'development',
    },
  });
});

// ===========================================
// API Routes
// ===========================================

// Authentication routes
app.use('/api/v1/auth', authRoutes);

// Admin routes
app.use('/api/v1/users', userRoutes);           // Admin user management
app.use('/api/v1/admin/import', adminImportRoutes); // Admin CSV import

// Team routes (Leader only)
app.use('/api/v1/team', teamRoutes);

// Core resource routes
app.use('/api/v1/thoughts', thoughtRoutes);
app.use('/api/v1/topics', topicRoutes);
app.use('/api/v1/meetings', meetingRoutes);
app.use('/api/v1/actions', actionRoutes);

// Configuration routes
app.use('/api/v1/labels', labelRoutes);
app.use('/api/v1/competencies', competencyRoutes);

// Utility routes
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/uploads', uploadRoutes);

// ===========================================
// 404 Handler
// ===========================================

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found',
    },
  });
});

// ===========================================
// Error Handler (must be last)
// ===========================================

app.use(errorHandler);

// ===========================================
// Server Startup
// ===========================================

async function startServer(): Promise<void> {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✓ Database connected');

    app.listen(PORT, () => {
      console.log(`✓ Server running on http://localhost:${PORT}`);
      console.log(`  Health check: http://localhost:${PORT}/health`);
      console.log(`  API base: http://localhost:${PORT}/api/v1`);
      console.log(`  CORS origin: ${CORS_ORIGIN}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down...');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();

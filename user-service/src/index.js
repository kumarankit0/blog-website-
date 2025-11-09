const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const config = require('./config');
const logger = require('./logger');
const requestLogger = require('./middleware/requestLogger');
const { getMetrics } = require('./middleware/metrics');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: true, limit: '50kb' }));

// Sanitize inputs to prevent NoSQL injection
app.use(mongoSanitize());

// Correlation ID middleware
app.use((req, res, next) => {
  const correlationId = req.headers['x-correlation-id'];
  req.correlationId = correlationId;
  if (correlationId) {
    res.setHeader('x-correlation-id', correlationId);
  }
  next();
});

// Structured request logging
app.use(requestLogger);

// Health check endpoint
app.get('/health', (req, res) => {
  const correlationId = req.headers['x-correlation-id'];
  const response = { status: 'ok' };
  if (correlationId) {
    res.setHeader('x-correlation-id', correlationId);
  }
  res.json(response);
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
  const metrics = getMetrics();
  res.json({
    status: 'success',
    data: metrics,
  });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
  });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error({ error: err.message, stack: err.stack }, 'Unhandled error');
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
});

// Connect to MongoDB
mongoose.connect(config.mongoUri)
  .then(() => {
    logger.info('Connected to MongoDB');
    
    // Start server
    app.listen(config.port, () => {
      logger.info(`User service running on port ${config.port}`);
    });
  })
  .catch((error) => {
    logger.error({ error: error.message }, 'MongoDB connection error');
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  mongoose.connection.close(() => {
    logger.info('MongoDB connection closed');
    process.exit(0);
  });
});


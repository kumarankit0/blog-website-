const logger = require('../logger');
const { incrementRequests, incrementErrors } = require('./metrics');

// Structured request logging middleware
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  const correlationId = req.headers['x-correlation-id'] || 'unknown';
  const userId = req.user?.userId || null;

  // Increment request counter
  incrementRequests();

  // Log request
  logger.info({
    correlationId,
    userId,
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  }, 'Incoming request');

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const latency = duration;
    
    // Increment error counter if status >= 400
    if (res.statusCode >= 400) {
      incrementErrors();
    }
    
    // Structured log with all required fields
    const logData = {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      userId: userId,
      correlationId: correlationId,
      latency: latency,
    };

    if (res.statusCode >= 400) {
      logger.warn(logData, 'Request completed with error');
    } else {
      logger.info(logData, 'Request completed');
    }
  });

  next();
};

module.exports = requestLogger;


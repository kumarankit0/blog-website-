const jwt = require('jsonwebtoken');
const config = require('../config');
const logger = require('../logger');

// JWT authentication middleware
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'No token provided',
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer '
    const decoded = jwt.verify(token, config.jwtSecret);
    
    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      role: decoded.role || 'user',
    };
    
    next();
  } catch (error) {
    logger.warn({ error: error.message, correlationId: req.correlationId }, 'JWT verification failed');
    return res.status(401).json({
      status: 'error',
      message: 'Invalid or expired token',
    });
  }
};

// Role-based authorization middleware
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn({ 
        userId: req.user.userId, 
        role: req.user.role, 
        allowedRoles,
        correlationId: req.correlationId 
      }, 'Unauthorized role access attempt');
      
      return res.status(403).json({
        status: 'error',
        message: 'Insufficient permissions',
      });
    }

    next();
  };
};

// Check if user is owner or admin
const authorizeOwnerOrAdmin = (getResourceOwnerId) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      });
    }

    // Admin can do anything
    if (req.user.role === 'admin') {
      return next();
    }

    try {
      const ownerId = await getResourceOwnerId(req);
      
      if (req.user.userId !== ownerId) {
        logger.warn({ 
          userId: req.user.userId, 
          ownerId,
          correlationId: req.correlationId 
        }, 'Unauthorized resource access attempt');
        
        return res.status(403).json({
          status: 'error',
          message: 'You can only modify your own resources',
        });
      }

      next();
    } catch (error) {
      logger.error({ error: error.message, correlationId: req.correlationId }, 'Error in authorizeOwnerOrAdmin');
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  };
};

module.exports = {
  authenticate,
  authorize,
  authorizeOwnerOrAdmin,
};


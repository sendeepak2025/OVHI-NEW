const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authorization token required' 
      });
    }

    const token = authHeader.substring(7);
    
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        provider: {
          select: {
            id: true,
            isActive: true
          }
        }
      }
    });

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Check if provider is active (for provider users)
    if (user.provider && !user.provider.isActive) {
      return res.status(403).json({ 
        success: false, 
        message: 'Account is deactivated' 
      });
    }

    // Add user info to request object
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      providerId: user.provider?.id
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired' 
      });
    }

    logger.error('Auth middleware error', { 
      error: error.message, 
      stack: error.stack,
      headers: req.headers
    });
    
    res.status(500).json({ 
      success: false, 
      message: 'Authentication failed' 
    });
  }
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        provider: {
          select: {
            id: true,
            isActive: true
          }
        }
      }
    });

    if (user && (!user.provider || user.provider.isActive)) {
      req.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        providerId: user.provider?.id
      };
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    // If token verification fails, continue without user
    req.user = null;
    next();
  }
};

// Role-based access control middleware
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Insufficient permissions' 
      });
    }

    next();
  };
};

// Provider-only access middleware
const requireProvider = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
    });
  }

  if (req.user.role !== 6 || !req.user.providerId) {
    return res.status(403).json({ 
      success: false, 
      message: 'Provider access required' 
    });
  }

  next();
};

module.exports = {
  authMiddleware,
  optionalAuth,
  requireRole,
  requireProvider
};
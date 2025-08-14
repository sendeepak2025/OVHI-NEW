const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const Joi = require('joi');
const logger = require('../utils/logger');
const { createAuditLog } = require('../utils/audit');
const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().required(),
  role: Joi.number().valid(6).optional() // Only provider role for now
});

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role,
      name: user.name 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

// POST /api/auth/login - Login user
router.post('/login', async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error', 
        details: error.details 
      });
    }

    const { email, password } = value;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            specialty: true,
            isActive: true
          }
        }
      }
    });

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Check if provider is active
    if (user.provider && !user.provider.isActive) {
      return res.status(403).json({ 
        success: false, 
        message: 'Account is deactivated. Please contact administrator.' 
      });
    }

    // Generate token
    const token = generateToken(user);

    // Create audit log
    await createAuditLog({
      action: 'LOGIN',
      resource: 'user',
      resourceId: user.id,
      userId: user.id,
      details: { 
        email: user.email,
        loginTime: new Date().toISOString()
      }
    });

    logger.info('User logged in', { userId: user.id, email: user.email });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          provider: user.provider
        }
      }
    });
  } catch (error) {
    logger.error('Login error', { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

// POST /api/auth/register - Register new user
router.post('/register', async (req, res) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error', 
        details: error.details 
      });
    }

    const { email, password, name, role = 6 } = value;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({ 
        success: false, 
        message: 'User with this email already exists' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role
      }
    });

    // If provider role, create provider record
    let provider = null;
    if (role === 6) {
      provider = await prisma.provider.create({
        data: {
          userId: user.id,
          name: name,
          role: 'Primary Physician',
          specialty: 'General Practice',
          color: '#4f46e5',
          availability: {
            monday: ['9:00 AM - 5:00 PM'],
            tuesday: ['9:00 AM - 5:00 PM'],
            wednesday: ['9:00 AM - 5:00 PM'],
            thursday: ['9:00 AM - 5:00 PM'],
            friday: ['9:00 AM - 5:00 PM'],
            saturday: [],
            sunday: []
          }
        }
      });
    }

    // Generate token
    const token = generateToken(user);

    // Create audit log
    await createAuditLog({
      action: 'REGISTER',
      resource: 'user',
      resourceId: user.id,
      userId: user.id,
      details: { 
        email: user.email,
        role: user.role,
        registrationTime: new Date().toISOString()
      }
    });

    logger.info('User registered', { userId: user.id, email: user.email, role: user.role });

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          provider: provider ? {
            id: provider.id,
            name: provider.name,
            specialty: provider.specialty,
            isActive: provider.isActive
          } : null
        }
      }
    });
  } catch (error) {
    logger.error('Registration error', { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

// POST /api/auth/refresh - Refresh JWT token
router.post('/refresh', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ 
        success: false, 
        message: 'Token is required' 
      });
    }

    // Verify current token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            specialty: true,
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

    // Generate new token
    const newToken = generateToken(user);

    res.json({
      success: true,
      data: {
        token: newToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          provider: user.provider
        }
      }
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }
    
    logger.error('Token refresh error', { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, message: 'Token refresh failed' });
  }
});

// POST /api/auth/logout - Logout user (optional - mainly for audit trail)
router.post('/logout', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Create audit log
        await createAuditLog({
          action: 'LOGOUT',
          resource: 'user',
          resourceId: decoded.id,
          userId: decoded.id,
          details: { 
            logoutTime: new Date().toISOString()
          }
        });

        logger.info('User logged out', { userId: decoded.id });
      } catch (error) {
        // Token verification failed, but still return success for logout
        logger.warn('Logout with invalid token', { error: error.message });
      }
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    logger.error('Logout error', { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, message: 'Logout failed' });
  }
});

// GET /api/auth/me - Get current user info
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authorization token required' 
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            specialty: true,
            isActive: true,
            availability: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          provider: user.provider
        }
      }
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }
    
    logger.error('Get user info error', { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, message: 'Failed to get user info' });
  }
});

module.exports = router;
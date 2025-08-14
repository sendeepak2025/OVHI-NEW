const express = require('express');
const { PrismaClient } = require('@prisma/client');
const Joi = require('joi');
const logger = require('../utils/logger');
const { createAuditLog } = require('../utils/audit');
const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const providerSchema = Joi.object({
  name: Joi.string().required(),
  role: Joi.string().required(),
  specialty: Joi.string().required(),
  color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).required(),
  availability: Joi.object({
    monday: Joi.array().items(Joi.string()),
    tuesday: Joi.array().items(Joi.string()),
    wednesday: Joi.array().items(Joi.string()),
    thursday: Joi.array().items(Joi.string()),
    friday: Joi.array().items(Joi.string()),
    saturday: Joi.array().items(Joi.string()),
    sunday: Joi.array().items(Joi.string())
  }).required(),
  isActive: Joi.boolean().optional()
});

const updateProviderSchema = Joi.object({
  name: Joi.string().optional(),
  role: Joi.string().optional(),
  specialty: Joi.string().optional(),
  color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional(),
  availability: Joi.object({
    monday: Joi.array().items(Joi.string()),
    tuesday: Joi.array().items(Joi.string()),
    wednesday: Joi.array().items(Joi.string()),
    thursday: Joi.array().items(Joi.string()),
    friday: Joi.array().items(Joi.string()),
    saturday: Joi.array().items(Joi.string()),
    sunday: Joi.array().items(Joi.string())
  }).optional(),
  isActive: Joi.boolean().optional()
});

const availabilitySchema = Joi.object({
  availability: Joi.object({
    monday: Joi.array().items(Joi.string()),
    tuesday: Joi.array().items(Joi.string()),
    wednesday: Joi.array().items(Joi.string()),
    thursday: Joi.array().items(Joi.string()),
    friday: Joi.array().items(Joi.string()),
    saturday: Joi.array().items(Joi.string()),
    sunday: Joi.array().items(Joi.string())
  }).required()
});

// GET /api/providers - Get all providers
router.get('/', async (req, res) => {
  try {
    const { 
      includeInactive = false, 
      page = 1, 
      limit = 50,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};
    if (includeInactive === 'false' || includeInactive === false) {
      where.isActive = true;
    }

    const [providers, total] = await Promise.all([
      prisma.provider.findMany({
        where,
        include: {
          _count: {
            select: {
              appointments: {
                where: {
                  status: { not: 'CANCELLED' },
                  date: {
                    gte: new Date()
                  }
                }
              }
            }
          }
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take
      }),
      prisma.provider.count({ where })
    ]);

    res.json({
      success: true,
      data: providers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error('Error fetching providers', { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, message: 'Failed to fetch providers' });
  }
});

// GET /api/providers/:id - Get specific provider
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const provider = await prisma.provider.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            appointments: {
              where: {
                status: { not: 'CANCELLED' },
                date: {
                  gte: new Date()
                }
              }
            }
          }
        },
        appointments: {
          where: {
            date: {
              gte: new Date(),
              lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
            },
            status: { not: 'CANCELLED' }
          },
          include: {
            patient: {
              select: { id: true, name: true }
            },
            location: {
              select: { id: true, name: true }
            }
          },
          orderBy: { date: 'asc' }
        }
      }
    });

    if (!provider) {
      return res.status(404).json({ 
        success: false, 
        message: 'Provider not found' 
      });
    }

    res.json({ success: true, data: provider });
  } catch (error) {
    logger.error('Error fetching provider', { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, message: 'Failed to fetch provider' });
  }
});

// GET /api/providers/:id/availability - Get provider availability
router.get('/:id/availability', async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate, includeAppointments = false } = req.query;

    const provider = await prisma.provider.findUnique({
      where: { id },
      select: { id: true, name: true, availability: true }
    });

    if (!provider) {
      return res.status(404).json({ 
        success: false, 
        message: 'Provider not found' 
      });
    }

    let response = {
      success: true,
      data: {
        provider: {
          id: provider.id,
          name: provider.name
        },
        availability: provider.availability
      }
    };

    // Include existing appointments if requested
    if (includeAppointments === 'true' && startDate && endDate) {
      const appointments = await prisma.appointment.findMany({
        where: {
          providerId: id,
          date: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          },
          status: { not: 'CANCELLED' }
        },
        include: {
          patient: { select: { id: true, name: true } },
          location: { select: { id: true, name: true } }
        },
        orderBy: { date: 'asc' }
      });

      response.data.appointments = appointments;
    }

    res.json(response);
  } catch (error) {
    logger.error('Error fetching provider availability', { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, message: 'Failed to fetch provider availability' });
  }
});

// PUT /api/providers/:id/availability - Update provider availability
router.put('/:id/availability', async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = availabilitySchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error', 
        details: error.details 
      });
    }

    const existingProvider = await prisma.provider.findUnique({
      where: { id }
    });

    if (!existingProvider) {
      return res.status(404).json({ 
        success: false, 
        message: 'Provider not found' 
      });
    }

    const provider = await prisma.provider.update({
      where: { id },
      data: { availability: value.availability }
    });

    // Create audit log
    await createAuditLog({
      action: 'UPDATE_AVAILABILITY',
      resource: 'provider',
      resourceId: provider.id,
      userId: req.user?.id,
      details: { 
        newAvailability: value.availability,
        oldAvailability: existingProvider.availability
      }
    });

    // Emit real-time update
    req.io.emit('provider-availability-updated', {
      providerId: provider.id,
      availability: provider.availability
    });

    logger.info('Provider availability updated', { providerId: provider.id, userId: req.user?.id });
    res.json({ success: true, data: provider });
  } catch (error) {
    logger.error('Error updating provider availability', { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, message: 'Failed to update provider availability' });
  }
});

// POST /api/providers - Create new provider
router.post('/', async (req, res) => {
  try {
    const { error, value } = providerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error', 
        details: error.details 
      });
    }

    // Create a user account for the provider (simplified)
    const user = await prisma.user.create({
      data: {
        email: `${value.name.toLowerCase().replace(/\s+/g, '.')}@clinic.com`,
        password: 'temporary-password', // In real app, hash this and send reset email
        name: value.name,
        role: 6 // Provider role
      }
    });

    const provider = await prisma.provider.create({
      data: {
        ...value,
        userId: user.id
      }
    });

    // Create audit log
    await createAuditLog({
      action: 'CREATE',
      resource: 'provider',
      resourceId: provider.id,
      userId: req.user?.id,
      details: { providerData: value }
    });

    logger.info('Provider created', { providerId: provider.id, userId: req.user?.id });
    res.status(201).json({ success: true, data: provider });
  } catch (error) {
    logger.error('Error creating provider', { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, message: 'Failed to create provider' });
  }
});

// PUT /api/providers/:id - Update provider
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = updateProviderSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error', 
        details: error.details 
      });
    }

    const existingProvider = await prisma.provider.findUnique({
      where: { id }
    });

    if (!existingProvider) {
      return res.status(404).json({ 
        success: false, 
        message: 'Provider not found' 
      });
    }

    const provider = await prisma.provider.update({
      where: { id },
      data: value
    });

    // Create audit log
    await createAuditLog({
      action: 'UPDATE',
      resource: 'provider',
      resourceId: provider.id,
      userId: req.user?.id,
      details: { changes: value, originalData: existingProvider }
    });

    // Emit real-time update
    req.io.emit('provider-updated', provider);

    logger.info('Provider updated', { providerId: provider.id, userId: req.user?.id });
    res.json({ success: true, data: provider });
  } catch (error) {
    logger.error('Error updating provider', { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, message: 'Failed to update provider' });
  }
});

// DELETE /api/providers/:id - Delete provider (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const provider = await prisma.provider.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            appointments: {
              where: {
                status: { not: 'CANCELLED' },
                date: { gte: new Date() }
              }
            }
          }
        }
      }
    });

    if (!provider) {
      return res.status(404).json({ 
        success: false, 
        message: 'Provider not found' 
      });
    }

    // Check if provider has future appointments
    if (provider._count.appointments > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete provider with active future appointments' 
      });
    }

    // Soft delete by setting isActive to false
    const updatedProvider = await prisma.provider.update({
      where: { id },
      data: { isActive: false }
    });

    // Create audit log
    await createAuditLog({
      action: 'SOFT_DELETE',
      resource: 'provider',
      resourceId: id,
      userId: req.user?.id,
      details: { deletedProvider: provider }
    });

    logger.info('Provider soft deleted', { providerId: id, userId: req.user?.id });
    res.json({ success: true, message: 'Provider deactivated successfully' });
  } catch (error) {
    logger.error('Error deleting provider', { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, message: 'Failed to delete provider' });
  }
});

// GET /api/providers/:id/schedule - Get provider's schedule for a date range
router.get('/:id/schedule', async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ 
        success: false, 
        message: 'Start date and end date are required' 
      });
    }

    const provider = await prisma.provider.findUnique({
      where: { id },
      select: { id: true, name: true, availability: true, color: true }
    });

    if (!provider) {
      return res.status(404).json({ 
        success: false, 
        message: 'Provider not found' 
      });
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        providerId: id,
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        },
        status: { not: 'CANCELLED' }
      },
      include: {
        patient: { select: { id: true, name: true } },
        location: { select: { id: true, name: true } }
      },
      orderBy: { date: 'asc' }
    });

    // Generate schedule with available slots and appointments
    const schedule = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.toLocaleDateString('en-US', { weekday: 'lowercase' });
      const dayAvailability = provider.availability[dayOfWeek] || [];
      const dayAppointments = appointments.filter(apt => 
        apt.date.toDateString() === d.toDateString()
      );

      schedule.push({
        date: new Date(d).toISOString().split('T')[0],
        dayOfWeek,
        availability: dayAvailability,
        appointments: dayAppointments,
        appointmentCount: dayAppointments.length
      });
    }

    res.json({ 
      success: true, 
      data: {
        provider: {
          id: provider.id,
          name: provider.name,
          color: provider.color
        },
        schedule
      }
    });
  } catch (error) {
    logger.error('Error fetching provider schedule', { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, message: 'Failed to fetch provider schedule' });
  }
});

// GET /api/providers/stats - Get providers statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const [
      totalProviders,
      activeProviders,
      totalAppointments,
      confirmedAppointments,
      providerStats
    ] = await Promise.all([
      prisma.provider.count(),
      prisma.provider.count({ where: { isActive: true } }),
      prisma.appointment.count({ where: dateFilter }),
      prisma.appointment.count({ 
        where: { 
          ...dateFilter,
          status: 'CONFIRMED' 
        } 
      }),
      prisma.provider.findMany({
        where: { isActive: true },
        include: {
          _count: {
            select: {
              appointments: {
                where: {
                  ...dateFilter,
                  status: { not: 'CANCELLED' }
                }
              }
            }
          }
        }
      })
    ]);

    const providerPerformance = providerStats.map(provider => ({
      id: provider.id,
      name: provider.name,
      specialty: provider.specialty,
      appointmentCount: provider._count.appointments,
      color: provider.color
    }));

    res.json({ 
      success: true, 
      data: {
        totalProviders,
        activeProviders,
        totalAppointments,
        confirmedAppointments,
        providerPerformance
      }
    });
  } catch (error) {
    logger.error('Error fetching provider stats', { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, message: 'Failed to fetch provider statistics' });
  }
});

module.exports = router;
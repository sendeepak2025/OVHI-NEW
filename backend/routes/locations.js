const express = require('express');
const { PrismaClient } = require('@prisma/client');
const Joi = require('joi');
const logger = require('../utils/logger');
const { createAuditLog } = require('../utils/audit');
const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const locationSchema = Joi.object({
  name: Joi.string().required(),
  address: Joi.string().required(),
  phone: Joi.string().required(),
  capacity: Joi.number().integer().min(1).optional(),
  color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).required(),
  isActive: Joi.boolean().optional()
});

const updateLocationSchema = Joi.object({
  name: Joi.string().optional(),
  address: Joi.string().optional(),
  phone: Joi.string().optional(),
  capacity: Joi.number().integer().min(1).optional(),
  color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional(),
  isActive: Joi.boolean().optional()
});

// GET /api/locations - Get all locations
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

    const [locations, total] = await Promise.all([
      prisma.location.findMany({
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
      prisma.location.count({ where })
    ]);

    res.json({
      success: true,
      data: locations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error('Error fetching locations', { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, message: 'Failed to fetch locations' });
  }
});

// GET /api/locations/:id - Get specific location
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const location = await prisma.location.findUnique({
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
            provider: {
              select: { id: true, name: true, specialty: true }
            }
          },
          orderBy: { date: 'asc' }
        }
      }
    });

    if (!location) {
      return res.status(404).json({ 
        success: false, 
        message: 'Location not found' 
      });
    }

    res.json({ success: true, data: location });
  } catch (error) {
    logger.error('Error fetching location', { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, message: 'Failed to fetch location' });
  }
});

// POST /api/locations - Create new location
router.post('/', async (req, res) => {
  try {
    const { error, value } = locationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error', 
        details: error.details 
      });
    }

    const location = await prisma.location.create({
      data: value
    });

    // Create audit log
    await createAuditLog({
      action: 'CREATE',
      resource: 'location',
      resourceId: location.id,
      userId: req.user?.id,
      details: { locationData: value }
    });

    logger.info('Location created', { locationId: location.id, userId: req.user?.id });
    res.status(201).json({ success: true, data: location });
  } catch (error) {
    logger.error('Error creating location', { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, message: 'Failed to create location' });
  }
});

// PUT /api/locations/:id - Update location
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = updateLocationSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error', 
        details: error.details 
      });
    }

    const existingLocation = await prisma.location.findUnique({
      where: { id }
    });

    if (!existingLocation) {
      return res.status(404).json({ 
        success: false, 
        message: 'Location not found' 
      });
    }

    const location = await prisma.location.update({
      where: { id },
      data: value
    });

    // Create audit log
    await createAuditLog({
      action: 'UPDATE',
      resource: 'location',
      resourceId: location.id,
      userId: req.user?.id,
      details: { changes: value, originalData: existingLocation }
    });

    // Emit real-time update
    req.io.emit('location-updated', location);

    logger.info('Location updated', { locationId: location.id, userId: req.user?.id });
    res.json({ success: true, data: location });
  } catch (error) {
    logger.error('Error updating location', { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, message: 'Failed to update location' });
  }
});

// DELETE /api/locations/:id - Delete location (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const location = await prisma.location.findUnique({
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

    if (!location) {
      return res.status(404).json({ 
        success: false, 
        message: 'Location not found' 
      });
    }

    // Check if location has future appointments
    if (location._count.appointments > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete location with active future appointments' 
      });
    }

    // Soft delete by setting isActive to false
    const updatedLocation = await prisma.location.update({
      where: { id },
      data: { isActive: false }
    });

    // Create audit log
    await createAuditLog({
      action: 'SOFT_DELETE',
      resource: 'location',
      resourceId: id,
      userId: req.user?.id,
      details: { deletedLocation: location }
    });

    logger.info('Location soft deleted', { locationId: id, userId: req.user?.id });
    res.json({ success: true, message: 'Location deactivated successfully' });
  } catch (error) {
    logger.error('Error deleting location', { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, message: 'Failed to delete location' });
  }
});

// GET /api/locations/:id/schedule - Get location's schedule for a date range
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

    const location = await prisma.location.findUnique({
      where: { id },
      select: { id: true, name: true, capacity: true, color: true }
    });

    if (!location) {
      return res.status(404).json({ 
        success: false, 
        message: 'Location not found' 
      });
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        locationId: id,
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        },
        status: { not: 'CANCELLED' }
      },
      include: {
        patient: { select: { id: true, name: true } },
        provider: { select: { id: true, name: true, specialty: true, color: true } }
      },
      orderBy: { date: 'asc' }
    });

    // Generate schedule grouped by date
    const schedule = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayAppointments = appointments.filter(apt => 
        apt.date.toDateString() === d.toDateString()
      );

      // Calculate utilization
      const totalDurationMinutes = dayAppointments.reduce((total, apt) => {
        return total + parseInt(apt.duration.split(' ')[0]);
      }, 0);

      const utilizationPercentage = Math.round(
        (dayAppointments.length / location.capacity) * 100
      );

      schedule.push({
        date: new Date(d).toISOString().split('T')[0],
        appointments: dayAppointments,
        appointmentCount: dayAppointments.length,
        totalDurationMinutes,
        utilizationPercentage,
        isOverCapacity: dayAppointments.length > location.capacity
      });
    }

    res.json({ 
      success: true, 
      data: {
        location: {
          id: location.id,
          name: location.name,
          capacity: location.capacity,
          color: location.color
        },
        schedule
      }
    });
  } catch (error) {
    logger.error('Error fetching location schedule', { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, message: 'Failed to fetch location schedule' });
  }
});

// GET /api/locations/:id/availability - Check location availability
router.get('/:id/availability', async (req, res) => {
  try {
    const { id } = req.params;
    const { date, duration = '30' } = req.query;

    if (!date) {
      return res.status(400).json({ 
        success: false, 
        message: 'Date is required' 
      });
    }

    const location = await prisma.location.findUnique({
      where: { id },
      select: { id: true, name: true, capacity: true }
    });

    if (!location) {
      return res.status(404).json({ 
        success: false, 
        message: 'Location not found' 
      });
    }

    const selectedDate = new Date(date);
    const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));

    const appointments = await prisma.appointment.findMany({
      where: {
        locationId: id,
        date: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: { not: 'CANCELLED' }
      },
      select: {
        date: true,
        duration: true
      },
      orderBy: { date: 'asc' }
    });

    // Calculate peak hours and availability
    const hourlyCount = {};
    appointments.forEach(apt => {
      const hour = apt.date.getHours();
      const durationMinutes = parseInt(apt.duration.split(' ')[0]);
      const endHour = Math.ceil((apt.date.getMinutes() + durationMinutes) / 60) + hour;
      
      for (let h = hour; h < endHour; h++) {
        hourlyCount[h] = (hourlyCount[h] || 0) + 1;
      }
    });

    const availabilityByHour = {};
    for (let hour = 8; hour <= 18; hour++) { // 8 AM to 6 PM
      const currentCount = hourlyCount[hour] || 0;
      availabilityByHour[hour] = {
        hour: `${hour}:00`,
        currentAppointments: currentCount,
        availableSlots: Math.max(0, location.capacity - currentCount),
        isAvailable: currentCount < location.capacity,
        utilizationPercentage: Math.round((currentCount / location.capacity) * 100)
      };
    }

    res.json({ 
      success: true, 
      data: {
        location: {
          id: location.id,
          name: location.name,
          capacity: location.capacity
        },
        date,
        totalAppointments: appointments.length,
        peakHour: Object.keys(hourlyCount).reduce((a, b) => 
          hourlyCount[a] > hourlyCount[b] ? a : b, '8'
        ),
        availabilityByHour,
        isFullyBooked: appointments.length >= location.capacity * 10 // Assuming 10 hours operational
      }
    });
  } catch (error) {
    logger.error('Error checking location availability', { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, message: 'Failed to check location availability' });
  }
});

// GET /api/locations/stats - Get locations statistics
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
      totalLocations,
      activeLocations,
      totalAppointments,
      locationStats
    ] = await Promise.all([
      prisma.location.count(),
      prisma.location.count({ where: { isActive: true } }),
      prisma.appointment.count({ where: dateFilter }),
      prisma.location.findMany({
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

    const locationUtilization = locationStats.map(location => {
      const utilizationPercentage = location.capacity > 0 
        ? Math.round((location._count.appointments / (location.capacity * 30)) * 100) // Assuming 30 days
        : 0;

      return {
        id: location.id,
        name: location.name,
        capacity: location.capacity,
        appointmentCount: location._count.appointments,
        utilizationPercentage,
        color: location.color
      };
    });

    res.json({ 
      success: true, 
      data: {
        totalLocations,
        activeLocations,
        totalAppointments,
        averageUtilization: Math.round(
          locationUtilization.reduce((sum, loc) => sum + loc.utilizationPercentage, 0) / 
          locationUtilization.length
        ),
        locationUtilization
      }
    });
  } catch (error) {
    logger.error('Error fetching location stats', { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, message: 'Failed to fetch location statistics' });
  }
});

module.exports = router;
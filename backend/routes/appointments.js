const express = require('express');
const { PrismaClient } = require('@prisma/client');
const Joi = require('joi');
const logger = require('../utils/logger');
const { createAuditLog } = require('../utils/audit');
const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const appointmentSchema = Joi.object({
  patientId: Joi.string().required(),
  providerId: Joi.string().required(),
  locationId: Joi.string().required(),
  date: Joi.date().iso().required(),
  duration: Joi.string().valid('15 minutes', '30 minutes', '45 minutes', '60 minutes', '90 minutes').required(),
  type: Joi.string().valid('TELEHEALTH', 'IN_PERSON').required(),
  status: Joi.string().valid('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW').optional(),
  notes: Joi.string().optional().allow(''),
});

const updateAppointmentSchema = Joi.object({
  patientId: Joi.string().optional(),
  providerId: Joi.string().optional(),
  locationId: Joi.string().optional(),
  date: Joi.date().iso().optional(),
  duration: Joi.string().valid('15 minutes', '30 minutes', '45 minutes', '60 minutes', '90 minutes').optional(),
  type: Joi.string().valid('TELEHEALTH', 'IN_PERSON').optional(),
  status: Joi.string().valid('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW').optional(),
  notes: Joi.string().optional().allow(''),
});

const statusUpdateSchema = Joi.object({
  status: Joi.string().valid('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW').required(),
});

// GET /api/appointments - Get appointments with filtering
router.get('/', async (req, res) => {
  try {
    const {
      date,
      startDate,
      endDate,
      providerId,
      locationId,
      patientId,
      status,
      type,
      page = 1,
      limit = 50,
      sortBy = 'date',
      sortOrder = 'asc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build where clause
    const where = {};
    
    if (date) {
      const selectedDate = new Date(date);
      const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));
      where.date = {
        gte: startOfDay,
        lte: endOfDay
      };
    } else if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    if (providerId) where.providerId = providerId;
    if (locationId) where.locationId = locationId;
    if (patientId) where.patientId = patientId;
    if (status) where.status = status;
    if (type) where.type = type;

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: {
          patient: {
            select: { id: true, name: true, email: true, phone: true }
          },
          provider: {
            select: { id: true, name: true, role: true, specialty: true, color: true }
          },
          location: {
            select: { id: true, name: true, address: true, phone: true, color: true }
          }
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take
      }),
      prisma.appointment.count({ where })
    ]);

    res.json({
      success: true,
      data: appointments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error('Error fetching appointments', { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, message: 'Failed to fetch appointments' });
  }
});

// GET /api/appointments/search - Advanced search
router.get('/search', async (req, res) => {
  try {
    const { q, ...filters } = req.query;

    let where = {};
    
    // Apply filters
    if (filters.providerId) where.providerId = filters.providerId;
    if (filters.locationId) where.locationId = filters.locationId;
    if (filters.status) where.status = filters.status;
    if (filters.type) where.type = filters.type;

    // Date filters
    if (filters.date) {
      const selectedDate = new Date(filters.date);
      const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));
      where.date = {
        gte: startOfDay,
        lte: endOfDay
      };
    }

    // Text search
    if (q) {
      where.OR = [
        {
          patient: {
            name: { contains: q, mode: 'insensitive' }
          }
        },
        {
          provider: {
            name: { contains: q, mode: 'insensitive' }
          }
        },
        {
          location: {
            name: { contains: q, mode: 'insensitive' }
          }
        },
        {
          notes: { contains: q, mode: 'insensitive' }
        }
      ];
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        patient: {
          select: { id: true, name: true, email: true, phone: true }
        },
        provider: {
          select: { id: true, name: true, role: true, specialty: true, color: true }
        },
        location: {
          select: { id: true, name: true, address: true, phone: true, color: true }
        }
      },
      orderBy: { date: 'asc' }
    });

    res.json({ success: true, data: appointments });
  } catch (error) {
    logger.error('Error searching appointments', { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, message: 'Failed to search appointments' });
  }
});

// GET /api/appointments/calendar - Calendar view data
router.get('/calendar', async (req, res) => {
  try {
    const { startDate, endDate, providerId, locationId } = req.query;

    const where = {};
    
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }
    
    if (providerId) where.providerId = providerId;
    if (locationId) where.locationId = locationId;

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        patient: {
          select: { id: true, name: true }
        },
        provider: {
          select: { id: true, name: true, color: true }
        },
        location: {
          select: { id: true, name: true }
        }
      },
      orderBy: { date: 'asc' }
    });

    // Group by date
    const calendarData = appointments.reduce((acc, appointment) => {
      const dateKey = appointment.date.toISOString().split('T')[0];
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(appointment);
      return acc;
    }, {});

    res.json({ success: true, data: calendarData });
  } catch (error) {
    logger.error('Error fetching calendar data', { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, message: 'Failed to fetch calendar data' });
  }
});

// GET /api/appointments/availability - Check availability
router.get('/availability', async (req, res) => {
  try {
    const { providerId, locationId, date, duration = '30 minutes' } = req.query;

    if (!providerId || !date) {
      return res.status(400).json({ 
        success: false, 
        message: 'Provider ID and date are required' 
      });
    }

    const selectedDate = new Date(date);
    const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));

    // Get existing appointments for the provider on the specified date
    const existingAppointments = await prisma.appointment.findMany({
      where: {
        providerId,
        ...(locationId && { locationId }),
        date: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: {
          not: 'CANCELLED'
        }
      },
      orderBy: { date: 'asc' }
    });

    // Get provider availability
    const provider = await prisma.provider.findUnique({
      where: { id: providerId },
      select: { availability: true }
    });

    if (!provider) {
      return res.status(404).json({ 
        success: false, 
        message: 'Provider not found' 
      });
    }

    // Calculate available time slots
    const dayOfWeek = selectedDate.toLocaleDateString('en-US', { weekday: 'lowercase' });
    const dayAvailability = provider.availability[dayOfWeek] || [];

    const availableSlots = [];
    const durationMinutes = parseInt(duration.split(' ')[0]);

    dayAvailability.forEach(timeRange => {
      const [startTime, endTime] = timeRange.split(' - ');
      const start = new Date(`${date} ${startTime}`);
      const end = new Date(`${date} ${endTime}`);

      let current = new Date(start);
      while (current < end) {
        const slotEnd = new Date(current.getTime() + durationMinutes * 60000);
        
        if (slotEnd <= end) {
          // Check if this slot conflicts with existing appointments
          const hasConflict = existingAppointments.some(apt => {
            const aptStart = new Date(apt.date);
            const aptDuration = parseInt(apt.duration.split(' ')[0]);
            const aptEnd = new Date(aptStart.getTime() + aptDuration * 60000);
            
            return (current >= aptStart && current < aptEnd) ||
                   (slotEnd > aptStart && slotEnd <= aptEnd) ||
                   (current <= aptStart && slotEnd >= aptEnd);
          });

          if (!hasConflict) {
            availableSlots.push({
              start: current.toISOString(),
              end: slotEnd.toISOString(),
              startTime: current.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit', 
                hour12: true 
              }),
              endTime: slotEnd.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit', 
                hour12: true 
              })
            });
          }
        }
        
        current = new Date(current.getTime() + 15 * 60000); // 15-minute increments
      }
    });

    res.json({ 
      success: true, 
      data: {
        availableSlots,
        existingAppointments: existingAppointments.length,
        totalSlots: availableSlots.length
      }
    });
  } catch (error) {
    logger.error('Error checking availability', { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, message: 'Failed to check availability' });
  }
});

// POST /api/appointments - Create new appointment
router.post('/', async (req, res) => {
  try {
    const { error, value } = appointmentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error', 
        details: error.details 
      });
    }

    // Check for conflicts
    const appointmentDate = new Date(value.date);
    const durationMinutes = parseInt(value.duration.split(' ')[0]);
    const appointmentEnd = new Date(appointmentDate.getTime() + durationMinutes * 60000);

    const conflicts = await prisma.appointment.findMany({
      where: {
        providerId: value.providerId,
        status: { not: 'CANCELLED' },
        date: {
          gte: new Date(appointmentDate.getTime() - 24 * 60 * 60 * 1000), // 24 hours before
          lte: new Date(appointmentDate.getTime() + 24 * 60 * 60 * 1000)   // 24 hours after
        }
      }
    });

    const hasConflict = conflicts.some(apt => {
      const aptStart = new Date(apt.date);
      const aptDuration = parseInt(apt.duration.split(' ')[0]);
      const aptEnd = new Date(aptStart.getTime() + aptDuration * 60000);
      
      return (appointmentDate >= aptStart && appointmentDate < aptEnd) ||
             (appointmentEnd > aptStart && appointmentEnd <= aptEnd) ||
             (appointmentDate <= aptStart && appointmentEnd >= aptEnd);
    });

    if (hasConflict) {
      return res.status(409).json({ 
        success: false, 
        message: 'Time slot conflict detected',
        conflicts: conflicts.filter(apt => {
          const aptStart = new Date(apt.date);
          const aptDuration = parseInt(apt.duration.split(' ')[0]);
          const aptEnd = new Date(aptStart.getTime() + aptDuration * 60000);
          
          return (appointmentDate >= aptStart && appointmentDate < aptEnd) ||
                 (appointmentEnd > aptStart && appointmentEnd <= aptEnd) ||
                 (appointmentDate <= aptStart && appointmentEnd >= aptEnd);
        })
      });
    }

    const appointment = await prisma.appointment.create({
      data: value,
      include: {
        patient: {
          select: { id: true, name: true, email: true, phone: true }
        },
        provider: {
          select: { id: true, name: true, role: true, specialty: true, color: true }
        },
        location: {
          select: { id: true, name: true, address: true, phone: true, color: true }
        }
      }
    });

    // Create audit log
    await createAuditLog({
      action: 'CREATE',
      resource: 'appointment',
      resourceId: appointment.id,
      userId: req.user?.id,
      details: { appointmentData: value }
    });

    // Emit real-time update
    req.io.to(`provider-${value.providerId}`).emit('appointment-created', appointment);

    logger.info('Appointment created', { appointmentId: appointment.id, userId: req.user?.id });
    res.status(201).json({ success: true, data: appointment });
  } catch (error) {
    logger.error('Error creating appointment', { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, message: 'Failed to create appointment' });
  }
});

// PUT /api/appointments/:id - Update appointment
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = updateAppointmentSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error', 
        details: error.details 
      });
    }

    const existingAppointment = await prisma.appointment.findUnique({
      where: { id }
    });

    if (!existingAppointment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Appointment not found' 
      });
    }

    // Check for conflicts if date/time is being changed
    if (value.date || value.duration) {
      const appointmentDate = new Date(value.date || existingAppointment.date);
      const duration = value.duration || existingAppointment.duration;
      const durationMinutes = parseInt(duration.split(' ')[0]);
      const appointmentEnd = new Date(appointmentDate.getTime() + durationMinutes * 60000);

      const conflicts = await prisma.appointment.findMany({
        where: {
          id: { not: id },
          providerId: value.providerId || existingAppointment.providerId,
          status: { not: 'CANCELLED' },
          date: {
            gte: new Date(appointmentDate.getTime() - 24 * 60 * 60 * 1000),
            lte: new Date(appointmentDate.getTime() + 24 * 60 * 60 * 1000)
          }
        }
      });

      const hasConflict = conflicts.some(apt => {
        const aptStart = new Date(apt.date);
        const aptDuration = parseInt(apt.duration.split(' ')[0]);
        const aptEnd = new Date(aptStart.getTime() + aptDuration * 60000);
        
        return (appointmentDate >= aptStart && appointmentDate < aptEnd) ||
               (appointmentEnd > aptStart && appointmentEnd <= aptEnd) ||
               (appointmentDate <= aptStart && appointmentEnd >= aptEnd);
      });

      if (hasConflict) {
        return res.status(409).json({ 
          success: false, 
          message: 'Time slot conflict detected' 
        });
      }
    }

    const appointment = await prisma.appointment.update({
      where: { id },
      data: value,
      include: {
        patient: {
          select: { id: true, name: true, email: true, phone: true }
        },
        provider: {
          select: { id: true, name: true, role: true, specialty: true, color: true }
        },
        location: {
          select: { id: true, name: true, address: true, phone: true, color: true }
        }
      }
    });

    // Create audit log
    await createAuditLog({
      action: 'UPDATE',
      resource: 'appointment',
      resourceId: appointment.id,
      userId: req.user?.id,
      details: { changes: value, originalData: existingAppointment }
    });

    // Emit real-time update
    req.io.to(`provider-${appointment.providerId}`).emit('appointment-updated', appointment);

    logger.info('Appointment updated', { appointmentId: appointment.id, userId: req.user?.id });
    res.json({ success: true, data: appointment });
  } catch (error) {
    logger.error('Error updating appointment', { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, message: 'Failed to update appointment' });
  }
});

// PATCH /api/appointments/:id/status - Update appointment status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = statusUpdateSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error', 
        details: error.details 
      });
    }

    const appointment = await prisma.appointment.update({
      where: { id },
      data: { status: value.status },
      include: {
        patient: {
          select: { id: true, name: true, email: true, phone: true }
        },
        provider: {
          select: { id: true, name: true, role: true, specialty: true, color: true }
        },
        location: {
          select: { id: true, name: true, address: true, phone: true, color: true }
        }
      }
    });

    // Create audit log
    await createAuditLog({
      action: 'STATUS_UPDATE',
      resource: 'appointment',
      resourceId: appointment.id,
      userId: req.user?.id,
      details: { newStatus: value.status }
    });

    // Emit real-time update
    req.io.to(`provider-${appointment.providerId}`).emit('appointment-status-updated', appointment);

    logger.info('Appointment status updated', { 
      appointmentId: appointment.id, 
      newStatus: value.status, 
      userId: req.user?.id 
    });
    res.json({ success: true, data: appointment });
  } catch (error) {
    logger.error('Error updating appointment status', { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, message: 'Failed to update appointment status' });
  }
});

// DELETE /api/appointments/:id - Delete appointment
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await prisma.appointment.findUnique({
      where: { id }
    });

    if (!appointment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Appointment not found' 
      });
    }

    await prisma.appointment.delete({
      where: { id }
    });

    // Create audit log
    await createAuditLog({
      action: 'DELETE',
      resource: 'appointment',
      resourceId: id,
      userId: req.user?.id,
      details: { deletedAppointment: appointment }
    });

    // Emit real-time update
    req.io.to(`provider-${appointment.providerId}`).emit('appointment-deleted', { id });

    logger.info('Appointment deleted', { appointmentId: id, userId: req.user?.id });
    res.json({ success: true, message: 'Appointment deleted successfully' });
  } catch (error) {
    logger.error('Error deleting appointment', { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, message: 'Failed to delete appointment' });
  }
});

// POST /api/appointments/bulk - Bulk operations
router.post('/bulk', async (req, res) => {
  try {
    const { action, appointmentIds, data } = req.body;

    if (!action || !appointmentIds || !Array.isArray(appointmentIds)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Action and appointment IDs array are required' 
      });
    }

    let result;
    
    switch (action) {
      case 'delete':
        result = await prisma.appointment.deleteMany({
          where: { id: { in: appointmentIds } }
        });
        break;
        
      case 'update-status':
        if (!data?.status) {
          return res.status(400).json({ 
            success: false, 
            message: 'Status is required for bulk status update' 
          });
        }
        result = await prisma.appointment.updateMany({
          where: { id: { in: appointmentIds } },
          data: { status: data.status }
        });
        break;
        
      default:
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid bulk action' 
        });
    }

    // Create audit log
    await createAuditLog({
      action: `BULK_${action.toUpperCase()}`,
      resource: 'appointment',
      userId: req.user?.id,
      details: { appointmentIds, action, data }
    });

    // Emit real-time update
    req.io.emit('appointments-bulk-updated', { action, appointmentIds, data });

    logger.info('Bulk appointment operation completed', { 
      action, 
      appointmentIds, 
      affectedCount: result.count,
      userId: req.user?.id 
    });
    
    res.json({ 
      success: true, 
      message: `Bulk ${action} completed successfully`,
      affectedCount: result.count
    });
  } catch (error) {
    logger.error('Error performing bulk operation', { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, message: 'Failed to perform bulk operation' });
  }
});

// GET /api/appointments/conflicts - Check for conflicts
router.get('/conflicts', async (req, res) => {
  try {
    const { providerId, startDate, endDate } = req.query;

    if (!providerId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Provider ID is required' 
      });
    }

    const where = {
      providerId,
      status: { not: 'CANCELLED' }
    };

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        patient: { select: { id: true, name: true } },
        provider: { select: { id: true, name: true } },
        location: { select: { id: true, name: true } }
      },
      orderBy: { date: 'asc' }
    });

    // Find actual conflicts (overlapping appointments)
    const conflicts = [];
    for (let i = 0; i < appointments.length - 1; i++) {
      const current = appointments[i];
      const next = appointments[i + 1];
      
      const currentStart = new Date(current.date);
      const currentDuration = parseInt(current.duration.split(' ')[0]);
      const currentEnd = new Date(currentStart.getTime() + currentDuration * 60000);
      
      const nextStart = new Date(next.date);
      
      if (currentEnd > nextStart) {
        conflicts.push({
          appointment1: current,
          appointment2: next,
          overlapMinutes: Math.round((currentEnd - nextStart) / (1000 * 60))
        });
      }
    }

    res.json({ 
      success: true, 
      data: {
        totalAppointments: appointments.length,
        conflicts,
        conflictCount: conflicts.length
      }
    });
  } catch (error) {
    logger.error('Error checking conflicts', { error: error.message, stack: error.stack });
    res.status(500).json({ success: false, message: 'Failed to check conflicts' });
  }
});

module.exports = router;
const { PrismaClient } = require('@prisma/client');
const logger = require('./logger');

const prisma = new PrismaClient();

/**
 * Create an audit log entry
 * @param {Object} params - Audit log parameters
 * @param {string} params.action - Action performed (CREATE, UPDATE, DELETE, etc.)
 * @param {string} params.resource - Resource type (appointment, provider, location, etc.)
 * @param {string} [params.resourceId] - ID of the affected resource
 * @param {string} [params.userId] - ID of the user performing the action
 * @param {Object} [params.details] - Additional details about the action
 */
const createAuditLog = async ({ action, resource, resourceId, userId, details = {} }) => {
  try {
    const auditLog = await prisma.auditLog.create({
      data: {
        action,
        resource,
        resourceId,
        userId,
        details
      }
    });

    // Also log to winston for immediate monitoring
    logger.audit(action, resource, resourceId, userId, details);

    return auditLog;
  } catch (error) {
    // Don't throw error to prevent breaking the main operation
    logger.error('Failed to create audit log', {
      error: error.message,
      action,
      resource,
      resourceId,
      userId,
      details
    });
  }
};

/**
 * Get audit logs with filtering
 * @param {Object} filters - Filter options
 * @param {string} [filters.action] - Filter by action
 * @param {string} [filters.resource] - Filter by resource type
 * @param {string} [filters.resourceId] - Filter by resource ID
 * @param {string} [filters.userId] - Filter by user ID
 * @param {Date} [filters.startDate] - Filter by start date
 * @param {Date} [filters.endDate] - Filter by end date
 * @param {number} [filters.page=1] - Page number
 * @param {number} [filters.limit=50] - Number of records per page
 */
const getAuditLogs = async (filters = {}) => {
  try {
    const {
      action,
      resource,
      resourceId,
      userId,
      startDate,
      endDate,
      page = 1,
      limit = 50
    } = filters;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build where clause
    const where = {};
    
    if (action) where.action = action;
    if (resource) where.resource = resource;
    if (resourceId) where.resourceId = resourceId;
    if (userId) where.userId = userId;
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [auditLogs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take
      }),
      prisma.auditLog.count({ where })
    ]);

    return {
      auditLogs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    };
  } catch (error) {
    logger.error('Failed to get audit logs', {
      error: error.message,
      filters
    });
    throw error;
  }
};

/**
 * Get audit trail for a specific resource
 * @param {string} resource - Resource type
 * @param {string} resourceId - Resource ID
 */
const getResourceAuditTrail = async (resource, resourceId) => {
  try {
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        resource,
        resourceId
      },
      orderBy: { createdAt: 'desc' }
    });

    return auditLogs;
  } catch (error) {
    logger.error('Failed to get resource audit trail', {
      error: error.message,
      resource,
      resourceId
    });
    throw error;
  }
};

/**
 * Get user activity logs
 * @param {string} userId - User ID
 * @param {Object} options - Additional options
 * @param {Date} [options.startDate] - Start date filter
 * @param {Date} [options.endDate] - End date filter
 * @param {number} [options.limit=100] - Limit number of records
 */
const getUserActivity = async (userId, options = {}) => {
  try {
    const { startDate, endDate, limit = 100 } = options;

    const where = { userId };
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const auditLogs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit)
    });

    // Group by action for summary
    const activitySummary = auditLogs.reduce((acc, log) => {
      const key = `${log.action}_${log.resource}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return {
      logs: auditLogs,
      summary: activitySummary,
      totalActions: auditLogs.length
    };
  } catch (error) {
    logger.error('Failed to get user activity', {
      error: error.message,
      userId,
      options
    });
    throw error;
  }
};

/**
 * Clean up old audit logs
 * @param {number} daysToKeep - Number of days to keep logs (default: 365)
 */
const cleanupOldAuditLogs = async (daysToKeep = 365) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const deletedCount = await prisma.auditLog.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate
        }
      }
    });

    logger.info('Audit logs cleanup completed', {
      deletedCount: deletedCount.count,
      cutoffDate: cutoffDate.toISOString(),
      daysToKeep
    });

    return deletedCount.count;
  } catch (error) {
    logger.error('Failed to cleanup audit logs', {
      error: error.message,
      daysToKeep
    });
    throw error;
  }
};

/**
 * Get audit statistics
 * @param {Object} options - Filter options
 * @param {Date} [options.startDate] - Start date
 * @param {Date} [options.endDate] - End date
 */
const getAuditStatistics = async (options = {}) => {
  try {
    const { startDate, endDate } = options;

    const where = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [
      totalLogs,
      actionStats,
      resourceStats,
      recentLogs
    ] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.groupBy({
        by: ['action'],
        where,
        _count: { action: true }
      }),
      prisma.auditLog.groupBy({
        by: ['resource'],
        where,
        _count: { resource: true }
      }),
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 10
      })
    ]);

    return {
      totalLogs,
      actionStats: actionStats.map(stat => ({
        action: stat.action,
        count: stat._count.action
      })),
      resourceStats: resourceStats.map(stat => ({
        resource: stat.resource,
        count: stat._count.resource
      })),
      recentActivity: recentLogs
    };
  } catch (error) {
    logger.error('Failed to get audit statistics', {
      error: error.message,
      options
    });
    throw error;
  }
};

module.exports = {
  createAuditLog,
  getAuditLogs,
  getResourceAuditTrail,
  getUserActivity,
  cleanupOldAuditLogs,
  getAuditStatistics
};
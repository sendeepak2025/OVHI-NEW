const winston = require('winston');

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    if (Object.keys(meta).length > 0) {
      log += `\n${JSON.stringify(meta, null, 2)}`;
    }
    
    return log;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: {
    service: 'healthcare-appointments-api',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    
    // File transport for errors
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // File transport for all logs
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ],
  
  // Handle uncaught exceptions and rejections
  exceptionHandlers: [
    new winston.transports.File({ filename: 'logs/exceptions.log' })
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: 'logs/rejections.log' })
  ]
});

// Create logs directory if it doesn't exist
const fs = require('fs');
const path = require('path');
const logDir = 'logs';

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Add request logging helper
logger.logRequest = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      userId: req.user?.id
    };

    if (res.statusCode >= 400) {
      logger.warn('HTTP Error', logData);
    } else {
      logger.info('HTTP Request', logData);
    }
  });

  next();
};

// Add performance monitoring
logger.performance = {
  start: (operation) => {
    return {
      operation,
      startTime: process.hrtime.bigint()
    };
  },
  
  end: (timer, metadata = {}) => {
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - timer.startTime) / 1000000; // Convert to milliseconds
    
    logger.info('Performance', {
      operation: timer.operation,
      duration: `${duration.toFixed(2)}ms`,
      ...metadata
    });
    
    return duration;
  }
};

// Add database query logging
logger.query = (query, duration, params = {}) => {
  logger.debug('Database Query', {
    query: query.substring(0, 100) + (query.length > 100 ? '...' : ''),
    duration: `${duration}ms`,
    params: Object.keys(params).length > 0 ? params : undefined
  });
};

// Add security event logging
logger.security = {
  loginAttempt: (email, success, ip, userAgent) => {
    logger.info('Login Attempt', {
      email,
      success,
      ip,
      userAgent,
      timestamp: new Date().toISOString()
    });
  },
  
  accessDenied: (userId, resource, action, ip) => {
    logger.warn('Access Denied', {
      userId,
      resource,
      action,
      ip,
      timestamp: new Date().toISOString()
    });
  },
  
  suspiciousActivity: (description, metadata = {}) => {
    logger.warn('Suspicious Activity', {
      description,
      ...metadata,
      timestamp: new Date().toISOString()
    });
  }
};

// Add audit logging
logger.audit = (action, resource, resourceId, userId, details = {}) => {
  logger.info('Audit Log', {
    action,
    resource,
    resourceId,
    userId,
    details,
    timestamp: new Date().toISOString()
  });
};

module.exports = logger;
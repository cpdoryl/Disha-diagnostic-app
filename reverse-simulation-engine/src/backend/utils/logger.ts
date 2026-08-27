/**
 * Logger Utility for DISHA Stage 3
 * Provides structured logging with Winston
 */

import winston from 'winston';

const logLevel = process.env.LOG_LEVEL || 'info';

// Define custom format
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.metadata(),
  winston.format.json()
);

// Create logger instance
const logger = winston.createLogger({
  level: logLevel,
  format: customFormat,
  defaultMeta: { service: 'disha-stage3' },
  transports: [
    // Console output
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const metaString = Object.keys(meta).length > 0 ? JSON.stringify(meta, null, 2) : '';
          return `${timestamp} [${level}]: ${message} ${metaString}`;
        })
      ),
    }),

    // Error log file
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),

    // Combined log file
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

/**
 * Logger interface for structured logging
 */
export interface ILogger {
  info(message: string, data?: Record<string, any>): void;
  error(message: string, data?: Record<string, any>): void;
  warn(message: string, data?: Record<string, any>): void;
  debug(message: string, data?: Record<string, any>): void;
}

/**
 * Structured logger implementation
 */
class StructuredLogger implements ILogger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  info(message: string, data?: Record<string, any>): void {
    logger.info(message, {
      context: this.context,
      ...data,
    });
  }

  error(message: string, data?: Record<string, any>): void {
    logger.error(message, {
      context: this.context,
      ...data,
    });
  }

  warn(message: string, data?: Record<string, any>): void {
    logger.warn(message, {
      context: this.context,
      ...data,
    });
  }

  debug(message: string, data?: Record<string, any>): void {
    logger.debug(message, {
      context: this.context,
      ...data,
    });
  }
}

/**
 * Create a logger instance for a specific context/module
 */
export function createLogger(context: string): ILogger {
  return new StructuredLogger(context);
}

/**
 * Export default logger instance
 */
export { logger };

// Create context-specific loggers
export const loggers = {
  calculation: createLogger('CalculationEngine'),
  goal: createLogger('GoalService'),
  feasibility: createLogger('FeasibilityService'),
  action: createLogger('ActionPlanService'),
  allocation: createLogger('AllocationService'),
  timeline: createLogger('TimelineService'),
  api: createLogger('APIGateway'),
  database: createLogger('Database'),
  auth: createLogger('Authentication'),
};

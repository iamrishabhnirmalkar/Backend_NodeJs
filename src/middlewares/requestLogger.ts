import { Request, Response, NextFunction } from 'express';
import database from '../config/database/connection';
import logger from '../utils/logger';

const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  // Log request start to console
  logger.info(`Incoming ${req.method} ${req.url}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Capture response finish
  res.on('finish', async () => {
    const duration = Date.now() - start;
    const status = res.statusCode;

    // Log completion to console
    logger.info(`Completed ${req.method} ${req.url} ${status} - ${duration}ms`);

    // Log to Database (Async, don't block response)
    try {
      await database.apiLog.create({
        data: {
          method: req.method,
          url: req.url || 'unknown',
          status: status,
          duration: duration,
          ip: req.ip || null,
          userAgent: req.get('user-agent') || null,
        },
      });
    } catch (error: any) {
      // Log db error but don't crash app
      logger.error('Failed to write API log to database', { error: error.message });
    }
  });

  next();
};

export default requestLogger;

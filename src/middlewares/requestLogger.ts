import { Request, Response, NextFunction } from 'express';
import database from '../config/database/connection';
import logger from '../utils/logger';
import colors, { methodColor, statusColor } from '../utils/terminalColors';

function formatTime(): string {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  const ms = String(now.getMilliseconds()).padStart(3, '0');
  return `${h}:${m}:${s}.${ms}`;
}

const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const ts = formatTime();
  const methodCol = methodColor(req.method);

  // Log request start to console (colored, easy to read)
  console.log(
    `${colors.dim}[${ts}]${colors.reset} ${colors.bold}${methodCol}${req.method.padEnd(7)}${colors.reset} ${colors.dim}${req.url}${colors.reset}`,
  );

  // Capture response finish
  res.on('finish', async () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const statusCol = statusColor(status);
    const methodColFinish = methodColor(req.method);

    // Log completion to console (colored: method, status, duration)
    console.log(
      `${colors.dim}[${formatTime()}]${colors.reset} ${colors.bold}${methodColFinish}${req.method.padEnd(7)}${colors.reset} ${req.url} ${statusCol}${status}${colors.reset} ${colors.dim}${duration}ms${colors.reset}`,
    );

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
      logger.error('Failed to write API log to database', { error: error.message });
    }
  });

  next();
};

export default requestLogger;

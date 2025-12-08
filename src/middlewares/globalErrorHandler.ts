import { Request, Response, NextFunction } from 'express';
import { THttpError } from '../@types/types';
import logger from '../utils/logger';
import config from '../config/config';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default (err: THttpError, req: Request, res: Response, _: NextFunction) => {
  // Log the error with stack trace (which contains the file path)
  logger.error(err.message, {
    meta: {
      statusCode: err.statusCode,
      path: req.path,
      method: req.method,
      stack: err.stack // This contains the file path (e.g., C:\...\apiController.ts:line:col)
    }
  });

  const response = {
    success: false,
    statusCode: err.statusCode || 500,
    message: err.message || 'Internal Server Error',
    data: null,
    // Include stack trace only in development
    ...(config.NODE_ENV === 'development' && { trace: err.stack }),
  };

  res.status(response.statusCode).json(response);
};

import { NextFunction, Request, Response } from 'express';
import responseMessage from '../../constants/responseMessage';
import httpError from '../../utils/httpError';
import httpResponse from '../../utils/httpResponse';
import quicker from '../../utils/quicker';

import database from '../../config/database/connection';

export default {
  self: (req: Request, res: Response, next: NextFunction) => {
    try {
      httpResponse(req, res, 200, responseMessage.SUCCESS, {});
    } catch (error) {
      httpError(next, error, req, 500);
    }
  },
  health: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Assess DB: run a simple query (works for MySQL, MariaDB, PostgreSQL)
      const dbStatus = await database.$queryRaw`SELECT 1`
        .then(() => 'CONNECTED')
        .catch(() => 'DISCONNECTED');

      const healthData = {
        application: quicker.getApplicationHealth(),
        system: quicker.getSystemHealth(),
        database: dbStatus,
        timestamp: Date.now(),
      };

      httpResponse(req, res, 200, responseMessage.SUCCESS, healthData);
    } catch (err) {
      httpError(next, err, req, 500);
    }
  },
};

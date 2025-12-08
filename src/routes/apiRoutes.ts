import { Router } from 'express';
import apiController from '../controllers/apiController';
import validateHttpMethods from '../middlewares/validateHttpMethods';
import methodNotAllowed from '../middlewares/methodNotAllowed';

const router: Router = Router();

router.get('/self',
    /* #swagger.tags = ['Self'] */
    /* #swagger.description = 'Self Check' */
    /* #swagger.responses[200] = {
        description: 'Self check passed',
        schema: {
            success: true,
            message: 'Operation successful',
            data: {}
        }
    } */
    /* #swagger.responses[500] = {
        description: 'Internal Server Error',
        schema: {
            name: 'HttpError',
            success: false,
            statusCode: 500,
            request: {
                ip: '127.0.0.1',
                method: 'GET',
                url: '/api/v1/self'
            },
            message: 'Something went wrong',
            data: null
        }
    } */
    apiController.self
);
router.all('/self', methodNotAllowed);

router.get('/health',
    /* #swagger.tags = ['Health'] */
    /* #swagger.description = 'Health Check' */
    /* #swagger.responses[200] = {
        description: 'Health check passed',
        schema: {
            success: true,
            message: 'Operation successful',
            data: {
                application: {
                    version: '1.0.0',
                    environment: 'development',
                    uptime: '10s'
                },
                system: {
                    cpuUsage: '10%',
                    totalMemory: '16GB',
                    freeMemory: '8GB'
                },
                database: 'CONNECTED',
                timestamp: 1678888888888
            }
        }
    } */
    /* #swagger.responses[500] = {
        description: 'Internal Server Error',
        schema: {
            name: 'HttpError',
            success: false,
            statusCode: 500,
            request: {
                ip: '127.0.0.1',
                method: 'GET',
                url: '/api/v1/health'
            },
            message: 'Something went wrong',
            data: null
        }
    } */
    apiController.health
);
router.all('/health', methodNotAllowed);

export default router;

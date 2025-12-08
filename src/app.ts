import express, { Application, Request, Response, NextFunction } from 'express';
import path from 'path';
import cors from 'cors';
import router from './routes/apiRoutes';
import responseMessage from './constants/responseMessage';
import httpError from './utils/httpError';
import globalErrorHandler from './middlewares/globalErrorHandler';
import helmet from 'helmet';
import config from './config/config';
import validateHttpMethods from './middlewares/validateHttpMethods';
import requestLogger from './middlewares/requestLogger';
import rateLimiter from './middlewares/rateLimiter';
import swaggerUi from 'swagger-ui-express';
import * as swaggerOutput from './docs/swagger-output.json';

const app: Application = express();

app.set('trust proxy', 1);

// Middlewares
app.use(helmet());
app.use(requestLogger); // Log requests
app.use(rateLimiter); // Rate limit requests
app.use(
  cors({
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
    origin: config.FRONTEND_URLS,
    credentials: true,
  }),
);
router.use(validateHttpMethods);

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Favicon handler
app.get('/favicon.ico', (req: Request, res: Response) => {
  res.status(204).end();
});

// Routes
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'This Is API Routes',
    environment: config.NODE_ENV,
    allowedOrigins: config.FRONTEND_URLS,
  });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerOutput));

app.use('/api/v1', router);

// 404 Error Handler - returns 404 instead of 500
app.use((req: Request, _: Response, next: NextFunction) => {
  const error = new Error(responseMessage.NOT_FOUND('route'));
  httpError(next, error, req, 404);
});

// Global Error Handler (must be last)
app.use(globalErrorHandler);

export default app;

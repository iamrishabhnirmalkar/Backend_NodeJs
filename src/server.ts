import app from './app';
import config from './config/config';

const server = app.listen(config.PORT, () => {
  try {
    console.info(`APPLICATION_STARTED`, {
      port: config.PORT,
      SERVER_URL: config.SERVER_URL,
    });
  } catch (error) {
    console.error(`APPLICATION_ERROR`, {
      meta: error,
    });
    process.exit(1);
  }
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.info('SIGTERM received');
  server.close(() => {
    console.info('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.info('SIGINT received');
  server.close(() => {
    console.info('Process terminated');
  });
});

export default server;

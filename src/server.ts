import app from './app';
import config from './config/config';
import colors from './utils/terminalColors';

// Bind to 0.0.0.0 so the server is reachable from outside the container (Docker)
const host = process.env.HOST ?? '0.0.0.0';
const server = app.listen(config.PORT, host, () => {
  try {
    console.log(
      `${colors.bold}${colors.brightGreen}✓${colors.reset} Server running at ${colors.brightCyan}${config.SERVER_URL}${colors.reset} (port ${colors.bold}${config.PORT}${colors.reset})`,
    );
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

import dotenvFlow from 'dotenv-flow';
dotenvFlow.config();

// Parse comma-separated frontend URLs into an array
const parseFrontendUrls = (urls: string): string[] => {
  return urls
    .split(',')
    .map((url) => url.trim())
    .filter((url) => url.length > 0);
};

export default {
  // Server Port
  PORT: parseInt(process.env.PORT as string),
  SERVER_URL: process.env.SERVER_URL as string,
  NODE_ENV: process.env.NODE_ENV,

  // Database
  DATABASE: {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: 3306,
    charset: 'utf8mb4',
    timezone: '+00:00',
  },

  // Frontend URLs (array of allowed origins)
  FRONTEND_URLS: parseFrontendUrls(process.env.FRONTEND_URL ?? ''),

  // Redis
  REDIS: {
    host: process.env.REDIS_HOST as string,
    port: parseInt(process.env.REDIS_PORT as string, 10),
    password: process.env.REDIS_PASSWORD,
  },

  // Rate Limiting
  RATE_LIMIT: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS as string, 10) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX as string, 10) || 100,
  },
};

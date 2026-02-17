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
  // Server Port (default 8000 for Docker/local)
  PORT: parseInt(process.env.PORT as string, 10) || 8000,
  SERVER_URL: (process.env.SERVER_URL as string) || 'http://localhost:8000',
  NODE_ENV: process.env.NODE_ENV,

  // Database (supports MySQL/MariaDB via MYSQL_* or PostgreSQL via POSTGRES_*)
  DATABASE: {
    host: process.env.MYSQL_HOST ?? process.env.POSTGRES_HOST,
    user: process.env.MYSQL_USER ?? process.env.POSTGRES_USER,
    password: process.env.MYSQL_PASSWORD ?? process.env.POSTGRES_PASSWORD,
    database: process.env.MYSQL_DATABASE ?? process.env.POSTGRES_DB,
    port: process.env.POSTGRES_HOST ? 5432 : 3306,
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

  // JWT Configuration
  JWT: {
    accessTokenSecret: (process.env.JWT_ACCESS_TOKEN_SECRET as string) || '',
    refreshTokenSecret: (process.env.JWT_REFRESH_TOKEN_SECRET as string) || '',
    accessTokenExpiry: process.env.JWT_ACCESS_TOKEN_EXPIRY || '15m',
    refreshTokenExpiry: process.env.JWT_REFRESH_TOKEN_EXPIRY || '7d',
  },
};

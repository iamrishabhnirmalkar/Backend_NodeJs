import dotenvFlow from "dotenv-flow";
dotenvFlow.config();

// Parse comma-separated frontend URLs into an array
const parseFrontendUrls = (urls: string): string[] => {
  return urls
    .split(",")
    .map((url) => url.trim())
    .filter((url) => url.length > 0);
};

export default {
  // Server Port
  PORT: parseInt(process.env.PORT as string),
  SERVER_URL: process.env.SERVER_URL as string,
  NODE_ENV: process.env.NODE_ENV || "development",

  // Database
  DATABASE: {
    host: process.env.MYSQL_HOST || "localhost",
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    database: process.env.MYSQL_DATABASE || "",
    port: 3306,
    charset: "utf8mb4",
    timezone: "+00:00",
  },

  // Frontend URLs (array of allowed origins)
  FRONTEND_URLS: parseFrontendUrls(
    process.env.FRONTEND_URL || "http://localhost:3000"
  ),

  // Redis
  REDIS: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    password: process.env.REDIS_PASSWORD || undefined,
  },
};

export default {
  //  Server Port
  PORT: parseInt(process.env.PORT || "8000"),
  SERVEL_URL: process.env.SERVEL_URL || "http://localhost:8000",

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

  // Frontend URL
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",

  // Redis
  REDIS: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    password: process.env.REDIS_PASSWORD || undefined,
  },
};

import express, { Application, Request, Response, NextFunction } from "express";
import path from "path";
import cors from "cors";
import router from "./routes/apiRoutes";
import responseMessage from "./constants/responseMessage";
import httpError from "./utils/httpError";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import helmet from "helmet";
import config from "./config/config";

const app: Application = express();

// CORS configuration with multiple origins
const corsOptions = {
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"],
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Check if the origin is in the allowed list
    if (config.FRONTEND_URLS.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

// Middlewares
app.use(helmet());
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

// Favicon handler - stops the 500 errors
app.get("/favicon.ico", (req: Request, res: Response) => {
  res.status(204).end();
});

// Routes
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "This Is API Routes",
    environment: config.NODE_ENV,
    allowedOrigins: config.FRONTEND_URLS,
  });
});
app.use("/api/v1", router);

// 404 Error Handler - returns 404 instead of 500
app.use((req: Request, _: Response, next: NextFunction) => {
  const error = new Error(responseMessage.NOT_FOUND("route"));
  httpError(next, error, req, 404);
});

// Global Error Handler
app.use(globalErrorHandler);

export default app;

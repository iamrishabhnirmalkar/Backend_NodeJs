import express, { Application, Request, Response, NextFunction } from "express";
import path from "path";
import cors from "cors";
import router from "./routes/apiRoutes";
import responseMessage from "./constants/responseMessage";
import httpError from "./utils/httpError";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import helmet from "helmet";

const app: Application = express();

// Middlewares
app.use(helmet());
app.use(
  cors({
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"],
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

// Favicon handler - stops the 500 errors
app.get("/favicon.ico", (req: Request, res: Response) => {
  res.status(204).end();
});

// Routes
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "This Is API Routes" });
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

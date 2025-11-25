import { Request, Response, NextFunction } from "express";
import httpError from "../utils/httpError";
import responseMessage from "../constants/responseMessage";

/**
 * Global HTTP method validation middleware
 * Validates that only standard HTTP methods are used
 */
const validateHttpMethods = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const validMethods = [
    "GET",
    "POST",
    "PUT",
    "DELETE",
    "PATCH",
    "HEAD",
    "OPTIONS",
  ];
  const method = req.method.toUpperCase();

  // Check if method is valid
  if (!validMethods.includes(method)) {
    const error = new Error(
      `Invalid HTTP method: ${method}. Valid methods: ${validMethods.join(
        ", "
      )}`
    );
    return httpError(next, error, req, 400);
  }

  next();
};

export default validateHttpMethods;

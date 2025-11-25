import { Request, Response, NextFunction } from "express";
import httpError from "../utils/httpError";
import responseMessage from "../constants/responseMessage";

/**
 * Enhanced middleware to handle 405 Method Not Allowed errors globally
 * This should be added at the end of each route chain to catch unsupported HTTP methods
 */
export default (req: Request, res: Response, next: NextFunction): void => {
  const allowedMethods = extractAllowedMethods(req);

  // If no route matched, this middleware shouldn't handle it (let 404 handle it)
  if (!req.route || allowedMethods.length === 0) {
    return next();
  }

  // Set the Allow header (required by HTTP spec for 405 responses)
  res.setHeader("Allow", allowedMethods.join(", "));

  const errorMessage = `${
    responseMessage.METHOD_NOT_ALLOWED
  }. Allowed methods: ${allowedMethods.join(", ")}`;
  const error = new Error(errorMessage);

  httpError(next, error, req, 405);
};

/**
 * Extract allowed methods from Express route
 */
function extractAllowedMethods(req: Request): string[] {
  const methods: Set<string> = new Set();

  if (!req.route) {
    return [];
  }

  // Method 1: Check route methods object (primary method)
  if (req.route.methods) {
    Object.keys(req.route.methods).forEach((method) => {
      if (req.route.methods[method] && method !== "_all") {
        methods.add(method.toUpperCase());
      }
    });
  }

  // Method 2: Check route stack for all registered methods
  if (req.route.stack) {
    req.route.stack.forEach((layer: any) => {
      if (layer.route && layer.route.methods) {
        Object.keys(layer.route.methods).forEach((method) => {
          if (layer.route.methods[method] && method !== "_all") {
            methods.add(method.toUpperCase());
          }
        });
      }
    });
  }

  return Array.from(methods).sort();
}

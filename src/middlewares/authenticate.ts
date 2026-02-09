import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import database from '../config/database/connection';
import httpError from '../utils/httpError';
import responseMessage from '../constants/responseMessage';

/**
 * Authentication middleware - verifies JWT token and attaches user to request
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      httpError(next, new Error(responseMessage.UNAUTHORIZED('Token is required')), req, 401);
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const payload = verifyAccessToken(token);

    // Check if user exists and is active
    const user = await database.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        username: true,
        isActive: true,
      },
    });

    if (!user) {
      httpError(next, new Error(responseMessage.UNAUTHORIZED('User not found')), req, 401);
      return;
    }

    if (!user.isActive) {
      httpError(
        next,
        new Error(responseMessage.UNAUTHORIZED('User account is inactive')),
        req,
        401,
      );
      return;
    }

    // Attach user to request
    req.user = {
      userId: user.id,
      email: user.email,
      username: user.username,
    };

    next();
  } catch (error: any) {
    httpError(next, new Error(responseMessage.UNAUTHORIZED(error.message)), req, 401);
  }
};

export default authenticate;

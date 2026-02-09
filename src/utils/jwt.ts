import jwt from 'jsonwebtoken';
import config from '../config/config';

export interface JWTPayload {
  userId: string;
  email: string;
  username: string;
}

/**
 * Generate access token (short-lived)
 */
export function generateAccessToken(payload: JWTPayload): string {
  if (!config.JWT.accessTokenSecret) {
    throw new Error('JWT_ACCESS_TOKEN_SECRET is not configured');
  }

  return jwt.sign(payload, config.JWT.accessTokenSecret, {
    expiresIn: config.JWT.accessTokenExpiry,
  } as jwt.SignOptions);
}

/**
 * Generate refresh token (long-lived)
 */
export function generateRefreshToken(payload: JWTPayload): string {
  if (!config.JWT.refreshTokenSecret) {
    throw new Error('JWT_REFRESH_TOKEN_SECRET is not configured');
  }

  return jwt.sign(payload, config.JWT.refreshTokenSecret, {
    expiresIn: config.JWT.refreshTokenExpiry,
  } as jwt.SignOptions);
}

/**
 * Verify access token
 */
export function verifyAccessToken(token: string): JWTPayload {
  if (!config.JWT.accessTokenSecret) {
    throw new Error('JWT_ACCESS_TOKEN_SECRET is not configured');
  }

  try {
    return jwt.verify(token, config.JWT.accessTokenSecret) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): JWTPayload {
  if (!config.JWT.refreshTokenSecret) {
    throw new Error('JWT_REFRESH_TOKEN_SECRET is not configured');
  }

  try {
    return jwt.verify(token, config.JWT.refreshTokenSecret) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
}

/**
 * Decode token without verification (for debugging)
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch {
    return null;
  }
}

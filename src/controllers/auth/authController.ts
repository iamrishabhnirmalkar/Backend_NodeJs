import { Request, Response, NextFunction } from 'express';
import database from '../../config/database/connection';
import { hashPassword, comparePassword, validatePasswordStrength } from '../../utils/password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/jwt';
import httpError from '../../utils/httpError';
import httpResponse from '../../utils/httpResponse';
import responseMessage from '../../constants/responseMessage';

/** UserRole with role included (for map callbacks) */
type UrWithRole = { role: { name: string } };
/** UserRole with role and rolePermissions included (for map callbacks) */
type UrWithRoleAndPerms = {
  role: {
    id: string;
    name: string;
    description: string | null;
    rolePermissions: Array<{ permission: { name: string } }>;
  };
};

export default {
  /**
   * Register a new user
   * POST /api/v1/auth/register
   */
  register: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, username, password, firstName, lastName } = req.body;

      // Validation
      if (!email || !username || !password) {
        httpError(
          next,
          new Error(responseMessage.BAD_REQUEST('Email, username, and password are required')),
          req,
          400,
        );
        return;
      }

      // Validate password strength
      const passwordValidation = validatePasswordStrength(password);
      if (!passwordValidation.isValid) {
        httpError(
          next,
          new Error(responseMessage.BAD_REQUEST(passwordValidation.errors.join(', '))),
          req,
          400,
        );
        return;
      }

      // Check if user already exists
      const existingUser = await database.user.findFirst({
        where: {
          OR: [{ email }, { username }],
        },
      });

      if (existingUser) {
        const field = existingUser.email === email ? 'Email' : 'Username';
        httpError(next, new Error(responseMessage.CONFLICT(`${field} already exists`)), req, 409);
        return;
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user
      const user = await database.user.create({
        data: {
          email,
          username,
          password: hashedPassword,
          firstName,
          lastName,
        },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          isActive: true,
          createdAt: true,
        },
      });

      httpResponse(req, res, 201, 'User registered successfully', {
        user,
      });
    } catch (error: any) {
      httpError(next, error, req, 500);
    }
  },

  /**
   * Login user
   * POST /api/v1/auth/login
   */
  login: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        httpError(
          next,
          new Error(responseMessage.BAD_REQUEST('Email and password are required')),
          req,
          400,
        );
        return;
      }

      // Find user
      const user = await database.user.findUnique({
        where: { email },
      });

      if (!user) {
        httpError(
          next,
          new Error(responseMessage.UNAUTHORIZED('Invalid email or password')),
          req,
          401,
        );
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

      // Verify password
      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        httpError(
          next,
          new Error(responseMessage.UNAUTHORIZED('Invalid email or password')),
          req,
          401,
        );
        return;
      }

      // Generate tokens
      const accessToken = generateAccessToken({
        userId: user.id,
        email: user.email,
        username: user.username,
      });

      const refreshToken = generateRefreshToken({
        userId: user.id,
        email: user.email,
        username: user.username,
      });

      // Calculate refresh token expiry (7 days from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      // Store refresh token in database
      await database.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          expiresAt,
        },
      });

      // Get user roles
      const userRoles = await database.userRole.findMany({
        where: { userId: user.id },
        include: {
          role: true,
        },
      });

      httpResponse(req, res, 200, 'Login successful', {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          roles: userRoles.map((ur: UrWithRole) => ur.role.name),
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      });
    } catch (error: any) {
      httpError(next, error, req, 500);
    }
  },

  /**
   * Refresh access token
   * POST /api/v1/auth/refresh
   */
  refresh: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken: token } = req.body;

      if (!token) {
        httpError(
          next,
          new Error(responseMessage.BAD_REQUEST('Refresh token is required')),
          req,
          400,
        );
        return;
      }

      // Verify refresh token
      const payload = verifyRefreshToken(token);

      // Check if refresh token exists in database
      const storedToken = await database.refreshToken.findUnique({
        where: { token },
        include: { user: true },
      });

      if (!storedToken) {
        httpError(next, new Error(responseMessage.UNAUTHORIZED('Invalid refresh token')), req, 401);
        return;
      }

      // Check if token is expired
      if (new Date() > storedToken.expiresAt) {
        // Delete expired token
        await database.refreshToken.delete({ where: { id: storedToken.id } });
        httpError(next, new Error(responseMessage.UNAUTHORIZED('Refresh token expired')), req, 401);
        return;
      }

      // Check if user is still active
      if (!storedToken.user.isActive) {
        httpError(
          next,
          new Error(responseMessage.UNAUTHORIZED('User account is inactive')),
          req,
          401,
        );
        return;
      }

      // Generate new access token
      const accessToken = generateAccessToken({
        userId: storedToken.user.id,
        email: storedToken.user.email,
        username: storedToken.user.username,
      });

      httpResponse(req, res, 200, 'Token refreshed successfully', {
        accessToken,
      });
    } catch (error: any) {
      httpError(next, error, req, 500);
    }
  },

  /**
   * Logout user (invalidate refresh token)
   * POST /api/v1/auth/logout
   */
  logout: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken: token } = req.body;

      if (token) {
        // Delete refresh token from database
        await database.refreshToken.deleteMany({
          where: { token },
        });
      }

      httpResponse(req, res, 200, 'Logout successful', {});
    } catch (error: any) {
      httpError(next, error, req, 500);
    }
  },

  /**
   * Get current user profile
   * GET /api/v1/auth/me
   */
  me: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        httpError(
          next,
          new Error(responseMessage.UNAUTHORIZED('Authentication required')),
          req,
          401,
        );
        return;
      }

      const user = await database.user.findUnique({
        where: { id: req.user.userId },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        httpError(next, new Error(responseMessage.NOT_FOUND('User')), req, 404);
        return;
      }

      // Get user roles and permissions
      const userRoles = await database.userRole.findMany({
        where: { userId: user.id },
        include: {
          role: {
            include: {
              rolePermissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      });

      const roles = userRoles.map((ur: UrWithRoleAndPerms) => ({
        id: ur.role.id,
        name: ur.role.name,
        description: ur.role.description,
      }));

      const permissions = userRoles.flatMap((ur: UrWithRoleAndPerms) =>
        ur.role.rolePermissions.map((rp: { permission: { name: string } }) => rp.permission.name),
      );

      httpResponse(req, res, 200, responseMessage.SUCCESS, {
        user: {
          ...user,
          roles,
          permissions: [...new Set(permissions)], // Remove duplicates
        },
      });
    } catch (error: any) {
      httpError(next, error, req, 500);
    }
  },
};

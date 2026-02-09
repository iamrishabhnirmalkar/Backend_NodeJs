import { Router } from 'express';
import { authController } from '../../controllers';
import authenticate from '../../middlewares/authenticate';
import methodNotAllowed from '../../middlewares/methodNotAllowed';

const router: Router = Router();

// Public routes
router.post(
  '/register',
  /* #swagger.tags = ['Authentication'] */
  /* #swagger.description = 'Register a new user account. Password must be at least 8 characters with uppercase, lowercase, number, and special character.' */
  /* #swagger.summary = 'User Registration' */
  /* #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
          $ref: '#/definitions/RegisterRequest'
        }
      } */
  /* #swagger.responses[201] = {
        description: 'User registered successfully',
        schema: {
          success: true,
          message: 'User registered successfully',
          data: {
            user: { $ref: '#/definitions/User' }
          }
        }
      } */
  /* #swagger.responses[400] = {
        description: 'Validation error',
        schema: { $ref: '#/definitions/ErrorResponse' }
      } */
  /* #swagger.responses[409] = {
        description: 'Email or username already exists',
        schema: { $ref: '#/definitions/ErrorResponse' }
      } */
  authController.register,
);
router.all('/register', methodNotAllowed);

router.post(
  '/login',
  /* #swagger.tags = ['Authentication'] */
  /* #swagger.description = 'Login with email and password. Returns access token (15min expiry) and refresh token (7 days expiry).' */
  /* #swagger.summary = 'User Login' */
  /* #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
          $ref: '#/definitions/LoginRequest'
        }
      } */
  /* #swagger.responses[200] = {
        description: 'Login successful',
        schema: {
          success: true,
          message: 'Login successful',
          data: { $ref: '#/definitions/LoginResponse' }
        }
      } */
  /* #swagger.responses[401] = {
        description: 'Invalid credentials or inactive account',
        schema: { $ref: '#/definitions/ErrorResponse' }
      } */
  authController.login,
);
router.all('/login', methodNotAllowed);

router.post(
  '/refresh',
  /* #swagger.tags = ['Authentication'] */
  /* #swagger.description = 'Refresh access token using refresh token. Returns new access token.' */
  /* #swagger.summary = 'Refresh Access Token' */
  /* #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
          $ref: '#/definitions/RefreshTokenRequest'
        }
      } */
  /* #swagger.responses[200] = {
        description: 'Token refreshed successfully',
        schema: {
          success: true,
          message: 'Token refreshed successfully',
          data: {
            accessToken: 'new_jwt_access_token'
          }
        }
      } */
  /* #swagger.responses[401] = {
        description: 'Invalid or expired refresh token',
        schema: { $ref: '#/definitions/ErrorResponse' }
      } */
  authController.refresh,
);
router.all('/refresh', methodNotAllowed);

router.post(
  '/logout',
  /* #swagger.tags = ['Authentication'] */
  /* #swagger.description = 'Logout user by invalidating refresh token. Optional - can be called without token.' */
  /* #swagger.summary = 'User Logout' */
  /* #swagger.parameters['body'] = {
        in: 'body',
        required: false,
        schema: {
          refreshToken: 'jwt_refresh_token_string'
        }
      } */
  /* #swagger.responses[200] = {
        description: 'Logout successful',
        schema: {
          success: true,
          message: 'Logout successful',
          data: {}
        }
      } */
  authController.logout,
);
router.all('/logout', methodNotAllowed);

// Protected routes
router.get(
  '/me',
  /* #swagger.tags = ['Authentication'] */
  /* #swagger.description = 'Get current authenticated user profile with roles and permissions. Requires valid JWT token.' */
  /* #swagger.summary = 'Get Current User Profile' */
  /* #swagger.security = [{"bearerAuth": []}] */
  /* #swagger.responses[200] = {
        description: 'User profile retrieved successfully',
        schema: {
          success: true,
          message: 'Operation successful',
          data: {
            user: {
              id: 'uuid',
              email: 'user@example.com',
              username: 'username',
              firstName: 'John',
              lastName: 'Doe',
              isActive: true,
              roles: [
                {
                  id: 'uuid',
                  name: 'admin',
                  description: 'Administrator role'
                }
              ],
              permissions: ['user:create', 'user:read', 'user:update', 'user:delete'],
              createdAt: '2024-01-01T00:00:00.000Z',
              updatedAt: '2024-01-01T00:00:00.000Z'
            }
          }
        }
      } */
  /* #swagger.responses[401] = {
        description: 'Unauthorized - Invalid or missing token',
        schema: { $ref: '#/definitions/ErrorResponse' }
      } */
  authenticate,
  authController.me,
);
router.all('/me', methodNotAllowed);

export default router;

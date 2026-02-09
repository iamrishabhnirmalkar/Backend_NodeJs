import swaggerAutogen from 'swagger-autogen';
import path from 'path';

const doc = {
  info: {
    title: 'Backend Node.js API',
    version: '1.0.0',
    description: `
# Backend Node.js API Documentation

## Authentication & Authorization

This API uses **JWT (JSON Web Tokens)** for authentication and **RBAC (Role-Based Access Control)** for authorization.

### Authentication Flow

1. **Register** - Create a new user account
2. **Login** - Authenticate and receive access + refresh tokens
3. **Use Access Token** - Include in Authorization header: \`Bearer <access_token>\`
4. **Refresh Token** - Get new access token when current one expires
5. **Logout** - Invalidate refresh token

### RBAC System

- **Users** can have multiple **Roles**
- **Roles** can have multiple **Permissions**
- Permissions follow format: \`resource:action\` (e.g., \`user:create\`, \`user:read\`)

### Security

- All protected endpoints require a valid JWT access token
- Admin-only endpoints require the \`admin\` role
- Token expires after 15 minutes (configurable)
- Refresh token expires after 7 days

### Getting Started

1. Register a new user via \`POST /api/v1/auth/register\`
2. Login via \`POST /api/v1/auth/login\` to get tokens
3. Use the \`accessToken\` in the Authorization header for protected endpoints
4. Use \`POST /api/v1/auth/refresh\` to get a new access token when needed
    `,
    contact: {
      name: 'API Support',
    },
  },
  host: 'localhost:8000',
  schemes: ['http', 'https'],
  consumes: ['application/json'],
  produces: ['application/json'],
  securityDefinitions: {
    bearerAuth: {
      type: 'apiKey',
      name: 'Authorization',
      in: 'header',
      description:
        'JWT Authorization header using the Bearer scheme. Example: "Authorization: Bearer {token}"',
    },
  },
  definitions: {
    User: {
      id: 'uuid',
      email: 'user@example.com',
      username: 'username',
      firstName: 'John',
      lastName: 'Doe',
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    Role: {
      id: 'uuid',
      name: 'admin',
      description: 'Administrator role with full access',
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    Permission: {
      id: 'uuid',
      name: 'user:create',
      resource: 'user',
      action: 'create',
      description: 'Permission to create users',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    LoginRequest: {
      email: 'user@example.com',
      password: 'SecurePass123!',
    },
    RegisterRequest: {
      email: 'user@example.com',
      username: 'username',
      password: 'SecurePass123!',
      firstName: 'John',
      lastName: 'Doe',
    },
    RefreshTokenRequest: {
      refreshToken: 'jwt_refresh_token_string',
    },
    LoginResponse: {
      user: {
        id: 'uuid',
        email: 'user@example.com',
        username: 'username',
        firstName: 'John',
        lastName: 'Doe',
        roles: ['admin'],
      },
      tokens: {
        accessToken: 'jwt_access_token',
        refreshToken: 'jwt_refresh_token',
      },
    },
    ErrorResponse: {
      success: false,
      statusCode: 400,
      message: 'Error message',
      data: null,
    },
  },
};

const outputFile = path.join(__dirname, '../docs/swagger-output.json');
const endpointsFiles = [
  path.join(__dirname, '../app.ts'),
  path.join(__dirname, '../routes/api/apiRoutes.ts'),
  path.join(__dirname, '../routes/auth/authRoutes.ts'),
  path.join(__dirname, '../routes/role/roleRoutes.ts'),
  path.join(__dirname, '../routes/permission/permissionRoutes.ts'),
  path.join(__dirname, '../routes/userRole/userRoleRoutes.ts'),
];

swaggerAutogen()(outputFile, endpointsFiles, doc);

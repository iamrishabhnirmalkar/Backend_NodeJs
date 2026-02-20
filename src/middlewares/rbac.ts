import { Request, Response, NextFunction } from 'express';
import database from '../config/database/connection';
import httpError from '../utils/httpError';
import responseMessage from '../constants/responseMessage';

/** UserRole with role included (for map callbacks) */
type UrWithRole = { role: { name: string } };
/** RolePermission with permission included (for map callbacks) */
type RpWithPermission = { permission: { name: string } };

/**
 * RBAC Middleware - Check if user has required role(s)
 * Usage: requireRole('admin') or requireRole(['admin', 'moderator'])
 */
export const requireRole = (allowedRoles: string | string[]) => {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

      // Get user roles
      const userRoles = await database.userRole.findMany({
        where: {
          userId: req.user.userId,
          role: {
            isActive: true,
          },
        },
        include: {
          role: true,
        },
      });

      const userRoleNames = userRoles.map((ur: UrWithRole) => ur.role.name);

      // Check if user has any of the required roles
      const hasRole = roles.some((role) => userRoleNames.includes(role));

      if (!hasRole) {
        httpError(
          next,
          new Error(responseMessage.FORBIDDEN(`Required role: ${roles.join(' or ')}`)),
          req,
          403,
        );
        return;
      }

      // Attach roles to request for use in controllers
      req.user.roles = userRoleNames;

      next();
    } catch (error: any) {
      httpError(next, error, req, 500);
    }
  };
};

/**
 * RBAC Middleware - Check if user has required permission(s)
 * Usage: requirePermission('user:create') or requirePermission(['user:create', 'user:read'])
 */
export const requirePermission = (allowedPermissions: string | string[]) => {
  const permissions = Array.isArray(allowedPermissions) ? allowedPermissions : [allowedPermissions];

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

      // Get user roles
      const userRoles = await database.userRole.findMany({
        where: {
          userId: req.user.userId,
          role: {
            isActive: true,
          },
        },
        select: {
          roleId: true,
        },
      });

      const roleIds = userRoles.map((ur: { roleId: string }) => ur.roleId);

      if (roleIds.length === 0) {
        httpError(next, new Error(responseMessage.FORBIDDEN('No roles assigned')), req, 403);
        return;
      }

      // Get permissions for user's roles
      const rolePermissions = await database.rolePermission.findMany({
        where: {
          roleId: { in: roleIds },
        },
        include: {
          permission: true,
        },
      });

      const userPermissions = rolePermissions.map((rp: RpWithPermission) => rp.permission.name);

      // Check if user has any of the required permissions
      const hasPermission = permissions.some((permission) => userPermissions.includes(permission));

      if (!hasPermission) {
        httpError(
          next,
          new Error(responseMessage.FORBIDDEN(`Required permission: ${permissions.join(' or ')}`)),
          req,
          403,
        );
        return;
      }

      // Attach permissions to request
      req.user.permissions = userPermissions;

      next();
    } catch (error: any) {
      httpError(next, error, req, 500);
    }
  };
};

/**
 * RBAC Middleware - Check if user has required role AND permission
 * Usage: requireRoleAndPermission('admin', 'user:delete')
 */
export const requireRoleAndPermission = (allowedRole: string, allowedPermission: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

      // Get user roles
      const userRoles = await database.userRole.findMany({
        where: {
          userId: req.user.userId,
          role: {
            isActive: true,
            name: allowedRole,
          },
        },
        select: {
          roleId: true,
        },
      });

      if (userRoles.length === 0) {
        httpError(
          next,
          new Error(responseMessage.FORBIDDEN(`Required role: ${allowedRole}`)),
          req,
          403,
        );
        return;
      }

      // Check permission
      const rolePermissions = await database.rolePermission.findMany({
        where: {
          roleId: userRoles[0].roleId,
          permission: {
            name: allowedPermission,
          },
        },
      });

      if (rolePermissions.length === 0) {
        httpError(
          next,
          new Error(responseMessage.FORBIDDEN(`Required permission: ${allowedPermission}`)),
          req,
          403,
        );
        return;
      }

      next();
    } catch (error: any) {
      httpError(next, error, req, 500);
    }
  };
};

export default { requireRole, requirePermission, requireRoleAndPermission };

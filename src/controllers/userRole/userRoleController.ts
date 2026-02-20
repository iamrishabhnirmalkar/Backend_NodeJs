import { Request, Response, NextFunction } from 'express';
import database from '../../config/database/connection';
import httpError from '../../utils/httpError';
import httpResponse from '../../utils/httpResponse';
import responseMessage from '../../constants/responseMessage';

/** UserRole with role (and rolePermissions) included for map callbacks */
type UrWithRoleAndPerms = {
  role: {
    id: string;
    name: string;
    description: string | null;
    rolePermissions: Array<{ permission: { name: string } }>;
  };
  createdAt: Date;
};
type UrWithRole = { role: { id: string; name: string } };

export default {
  /**
   * Assign role to user
   * POST /api/v1/users/:userId/roles
   */
  assignRole: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req.params;
      const { roleId } = req.body;

      if (!roleId) {
        httpError(next, new Error(responseMessage.BAD_REQUEST('Role ID is required')), req, 400);
        return;
      }

      // Check if user exists
      const user = await database.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        httpError(next, new Error(responseMessage.NOT_FOUND('User')), req, 404);
        return;
      }

      // Check if role exists
      const role = await database.role.findUnique({
        where: { id: roleId },
      });

      if (!role) {
        httpError(next, new Error(responseMessage.NOT_FOUND('Role')), req, 404);
        return;
      }

      // Check if assignment already exists
      const existingAssignment = await database.userRole.findUnique({
        where: {
          userId_roleId: {
            userId,
            roleId,
          },
        },
      });

      if (existingAssignment) {
        httpError(
          next,
          new Error(responseMessage.CONFLICT('Role already assigned to user')),
          req,
          409,
        );
        return;
      }

      const userRole = await database.userRole.create({
        data: {
          userId,
          roleId,
        },
        include: {
          role: true,
          user: {
            select: {
              id: true,
              email: true,
              username: true,
            },
          },
        },
      });

      httpResponse(req, res, 201, 'Role assigned to user successfully', { userRole });
    } catch (error: any) {
      httpError(next, error, req, 500);
    }
  },

  /**
   * Remove role from user
   * DELETE /api/v1/users/:userId/roles/:roleId
   */
  removeRole: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId, roleId } = req.params;

      const userRole = await database.userRole.findUnique({
        where: {
          userId_roleId: {
            userId,
            roleId,
          },
        },
      });

      if (!userRole) {
        httpError(next, new Error(responseMessage.NOT_FOUND('User role assignment')), req, 404);
        return;
      }

      await database.userRole.delete({
        where: {
          userId_roleId: {
            userId,
            roleId,
          },
        },
      });

      httpResponse(req, res, 200, 'Role removed from user successfully', {});
    } catch (error: any) {
      httpError(next, error, req, 500);
    }
  },

  /**
   * Get user roles
   * GET /api/v1/users/:userId/roles
   */
  getUserRoles: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req.params;

      const user = await database.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        httpError(next, new Error(responseMessage.NOT_FOUND('User')), req, 404);
        return;
      }

      const userRoles = await database.userRole.findMany({
        where: { userId },
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

      httpResponse(req, res, 200, responseMessage.SUCCESS, {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
        roles: userRoles.map((ur: UrWithRoleAndPerms) => ({
          id: ur.role.id,
          name: ur.role.name,
          description: ur.role.description,
          permissions: ur.role.rolePermissions.map(
            (rp: { permission: { name: string } }) => rp.permission.name,
          ),
          assignedAt: ur.createdAt,
        })),
      });
    } catch (error: any) {
      httpError(next, error, req, 500);
    }
  },

  /**
   * Update user roles (replace all roles)
   * PUT /api/v1/users/:userId/roles
   */
  updateUserRoles: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req.params;
      const { roleIds } = req.body;

      if (!Array.isArray(roleIds)) {
        httpError(
          next,
          new Error(responseMessage.BAD_REQUEST('Role IDs array is required')),
          req,
          400,
        );
        return;
      }

      // Check if user exists
      const user = await database.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        httpError(next, new Error(responseMessage.NOT_FOUND('User')), req, 404);
        return;
      }

      // Verify all roles exist
      if (roleIds.length > 0) {
        const roles = await database.role.findMany({
          where: {
            id: { in: roleIds },
          },
        });

        if (roles.length !== roleIds.length) {
          httpError(next, new Error(responseMessage.BAD_REQUEST('Some roles not found')), req, 400);
          return;
        }
      }

      // Remove existing roles and assign new ones
      await database.userRole.deleteMany({
        where: { userId },
      });

      if (roleIds.length > 0) {
        await database.userRole.createMany({
          data: roleIds.map((roleId: string) => ({
            userId,
            roleId,
          })),
          skipDuplicates: true,
        });
      }

      const updatedUserRoles = await database.userRole.findMany({
        where: { userId },
        include: {
          role: true,
        },
      });

      httpResponse(req, res, 200, 'User roles updated successfully', {
        roles: updatedUserRoles.map((ur: UrWithRole) => ur.role),
      });
    } catch (error: any) {
      httpError(next, error, req, 500);
    }
  },
};

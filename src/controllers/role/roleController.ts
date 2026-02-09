import { Request, Response, NextFunction } from 'express';
import database from '../../config/database/connection';
import httpError from '../../utils/httpError';
import httpResponse from '../../utils/httpResponse';
import responseMessage from '../../constants/responseMessage';

export default {
  /**
   * Get all roles
   * GET /api/v1/roles
   */
  getAll: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { isActive } = req.query;

      const where: any = {};
      if (isActive !== undefined) {
        where.isActive = isActive === 'true';
      }

      const roles = await database.role.findMany({
        where,
        include: {
          _count: {
            select: {
              userRoles: true,
              rolePermissions: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      httpResponse(req, res, 200, responseMessage.SUCCESS, { roles });
    } catch (error: any) {
      httpError(next, error, req, 500);
    }
  },

  /**
   * Get role by ID
   * GET /api/v1/roles/:id
   */
  getById: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const role = await database.role.findUnique({
        where: { id },
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
          userRoles: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  username: true,
                },
              },
            },
          },
          _count: {
            select: {
              userRoles: true,
              rolePermissions: true,
            },
          },
        },
      });

      if (!role) {
        httpError(next, new Error(responseMessage.NOT_FOUND('Role')), req, 404);
        return;
      }

      httpResponse(req, res, 200, responseMessage.SUCCESS, { role });
    } catch (error: any) {
      httpError(next, error, req, 500);
    }
  },

  /**
   * Create new role
   * POST /api/v1/roles
   */
  create: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, description, isActive } = req.body;

      if (!name) {
        httpError(next, new Error(responseMessage.BAD_REQUEST('Role name is required')), req, 400);
        return;
      }

      // Check if role already exists
      const existingRole = await database.role.findUnique({
        where: { name },
      });

      if (existingRole) {
        httpError(next, new Error(responseMessage.CONFLICT('Role already exists')), req, 409);
        return;
      }

      const role = await database.role.create({
        data: {
          name,
          description,
          isActive: isActive !== undefined ? isActive : true,
        },
      });

      httpResponse(req, res, 201, 'Role created successfully', { role });
    } catch (error: any) {
      httpError(next, error, req, 500);
    }
  },

  /**
   * Update role
   * PUT /api/v1/roles/:id
   */
  update: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { name, description, isActive } = req.body;

      // Check if role exists
      const existingRole = await database.role.findUnique({
        where: { id },
      });

      if (!existingRole) {
        httpError(next, new Error(responseMessage.NOT_FOUND('Role')), req, 404);
        return;
      }

      // Check if name is being changed and if it conflicts
      if (name && name !== existingRole.name) {
        const nameConflict = await database.role.findUnique({
          where: { name },
        });

        if (nameConflict) {
          httpError(
            next,
            new Error(responseMessage.CONFLICT('Role name already exists')),
            req,
            409,
          );
          return;
        }
      }

      const role = await database.role.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(description !== undefined && { description }),
          ...(isActive !== undefined && { isActive }),
        },
      });

      httpResponse(req, res, 200, 'Role updated successfully', { role });
    } catch (error: any) {
      httpError(next, error, req, 500);
    }
  },

  /**
   * Delete role
   * DELETE /api/v1/roles/:id
   */
  delete: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const role = await database.role.findUnique({
        where: { id },
      });

      if (!role) {
        httpError(next, new Error(responseMessage.NOT_FOUND('Role')), req, 404);
        return;
      }

      await database.role.delete({
        where: { id },
      });

      httpResponse(req, res, 200, 'Role deleted successfully', {});
    } catch (error: any) {
      httpError(next, error, req, 500);
    }
  },

  /**
   * Assign permissions to role
   * POST /api/v1/roles/:id/permissions
   */
  assignPermissions: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { permissionIds } = req.body;

      if (!Array.isArray(permissionIds) || permissionIds.length === 0) {
        httpError(
          next,
          new Error(responseMessage.BAD_REQUEST('Permission IDs array is required')),
          req,
          400,
        );
        return;
      }

      // Check if role exists
      const role = await database.role.findUnique({
        where: { id },
      });

      if (!role) {
        httpError(next, new Error(responseMessage.NOT_FOUND('Role')), req, 404);
        return;
      }

      // Verify all permissions exist
      const permissions = await database.permission.findMany({
        where: {
          id: { in: permissionIds },
        },
      });

      if (permissions.length !== permissionIds.length) {
        httpError(
          next,
          new Error(responseMessage.BAD_REQUEST('Some permissions not found')),
          req,
          400,
        );
        return;
      }

      // Remove existing permissions and assign new ones
      await database.rolePermission.deleteMany({
        where: { roleId: id },
      });

      await database.rolePermission.createMany({
        data: permissionIds.map((permissionId: string) => ({
          roleId: id,
          permissionId,
        })),
        skipDuplicates: true,
      });

      const updatedRole = await database.role.findUnique({
        where: { id },
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
        },
      });

      httpResponse(req, res, 200, 'Permissions assigned successfully', { role: updatedRole });
    } catch (error: any) {
      httpError(next, error, req, 500);
    }
  },
};

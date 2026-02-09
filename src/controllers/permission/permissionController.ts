import { Request, Response, NextFunction } from 'express';
import database from '../../config/database/connection';
import httpError from '../../utils/httpError';
import httpResponse from '../../utils/httpResponse';
import responseMessage from '../../constants/responseMessage';

export default {
  /**
   * Get all permissions
   * GET /api/v1/permissions
   */
  getAll: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { resource, action } = req.query;

      const where: any = {};
      if (resource) {
        where.resource = resource as string;
      }
      if (action) {
        where.action = action as string;
      }

      const permissions = await database.permission.findMany({
        where,
        include: {
          _count: {
            select: {
              rolePermissions: true,
            },
          },
        },
        orderBy: [{ resource: 'asc' }, { action: 'asc' }],
      });

      httpResponse(req, res, 200, responseMessage.SUCCESS, { permissions });
    } catch (error: any) {
      httpError(next, error, req, 500);
    }
  },

  /**
   * Get permission by ID
   * GET /api/v1/permissions/:id
   */
  getById: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const permission = await database.permission.findUnique({
        where: { id },
        include: {
          rolePermissions: {
            include: {
              role: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                },
              },
            },
          },
          _count: {
            select: {
              rolePermissions: true,
            },
          },
        },
      });

      if (!permission) {
        httpError(next, new Error(responseMessage.NOT_FOUND('Permission')), req, 404);
        return;
      }

      httpResponse(req, res, 200, responseMessage.SUCCESS, { permission });
    } catch (error: any) {
      httpError(next, error, req, 500);
    }
  },

  /**
   * Create new permission
   * POST /api/v1/permissions
   */
  create: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, resource, action, description } = req.body;

      if (!name || !resource || !action) {
        httpError(
          next,
          new Error(responseMessage.BAD_REQUEST('Name, resource, and action are required')),
          req,
          400,
        );
        return;
      }

      // Check if permission already exists
      const existingPermission = await database.permission.findUnique({
        where: { name },
      });

      if (existingPermission) {
        httpError(next, new Error(responseMessage.CONFLICT('Permission already exists')), req, 409);
        return;
      }

      const permission = await database.permission.create({
        data: {
          name,
          resource,
          action,
          description,
        },
      });

      httpResponse(req, res, 201, 'Permission created successfully', { permission });
    } catch (error: any) {
      httpError(next, error, req, 500);
    }
  },

  /**
   * Update permission
   * PUT /api/v1/permissions/:id
   */
  update: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { name, resource, action, description } = req.body;

      // Check if permission exists
      const existingPermission = await database.permission.findUnique({
        where: { id },
      });

      if (!existingPermission) {
        httpError(next, new Error(responseMessage.NOT_FOUND('Permission')), req, 404);
        return;
      }

      // Check if name is being changed and if it conflicts
      if (name && name !== existingPermission.name) {
        const nameConflict = await database.permission.findUnique({
          where: { name },
        });

        if (nameConflict) {
          httpError(
            next,
            new Error(responseMessage.CONFLICT('Permission name already exists')),
            req,
            409,
          );
          return;
        }
      }

      const permission = await database.permission.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(resource && { resource }),
          ...(action && { action }),
          ...(description !== undefined && { description }),
        },
      });

      httpResponse(req, res, 200, 'Permission updated successfully', { permission });
    } catch (error: any) {
      httpError(next, error, req, 500);
    }
  },

  /**
   * Delete permission
   * DELETE /api/v1/permissions/:id
   */
  delete: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const permission = await database.permission.findUnique({
        where: { id },
      });

      if (!permission) {
        httpError(next, new Error(responseMessage.NOT_FOUND('Permission')), req, 404);
        return;
      }

      await database.permission.delete({
        where: { id },
      });

      httpResponse(req, res, 200, 'Permission deleted successfully', {});
    } catch (error: any) {
      httpError(next, error, req, 500);
    }
  },
};

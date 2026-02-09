import { Router } from 'express';
import { permissionController } from '../../controllers';
import authenticate from '../../middlewares/authenticate';
import rbac from '../../middlewares/rbac';
import methodNotAllowed from '../../middlewares/methodNotAllowed';

const router: Router = Router();

// All permission routes require authentication
router.use(authenticate);

// All permission routes require admin role
router.use(rbac.requireRole('admin'));

router.get(
  '/',
  /* #swagger.tags = ['RBAC - Permissions'] */
  /* #swagger.description = 'Get all permissions. Can filter by resource or action query parameters. Requires admin role.' */
  /* #swagger.summary = 'List All Permissions' */
  /* #swagger.security = [{"bearerAuth": []}] */
  /* #swagger.parameters['resource'] = {
        in: 'query',
        type: 'string',
        description: 'Filter by resource (e.g., user, product)',
        required: false
      } */
  /* #swagger.parameters['action'] = {
        in: 'query',
        type: 'string',
        description: 'Filter by action (e.g., create, read, update, delete)',
        required: false
      } */
  /* #swagger.responses[200] = {
        description: 'Permissions retrieved successfully',
        schema: {
          success: true,
          message: 'Operation successful',
          data: {
            permissions: [
              {
                id: 'uuid',
                name: 'user:create',
                resource: 'user',
                action: 'create',
                description: 'Permission to create users',
                createdAt: '2024-01-01T00:00:00.000Z',
                updatedAt: '2024-01-01T00:00:00.000Z',
                _count: {
                  rolePermissions: 3
                }
              }
            ]
          }
        }
      } */
  /* #swagger.responses[403] = {
        description: 'Forbidden - Admin role required',
        schema: { $ref: '#/definitions/ErrorResponse' }
      } */
  permissionController.getAll,
);
router.all('/', methodNotAllowed);

router.get(
  '/:id',
  /* #swagger.tags = ['RBAC - Permissions'] */
  /* #swagger.description = 'Get permission by ID with associated roles. Requires admin role.' */
  /* #swagger.summary = 'Get Permission by ID' */
  /* #swagger.security = [{"bearerAuth": []}] */
  /* #swagger.parameters['id'] = {
        in: 'path',
        type: 'string',
        required: true,
        description: 'Permission UUID'
      } */
  /* #swagger.responses[200] = {
        description: 'Permission retrieved successfully',
        schema: {
          success: true,
          message: 'Operation successful',
          data: {
            permission: {
              id: 'uuid',
              name: 'user:create',
              resource: 'user',
              action: 'create',
              description: 'Permission to create users',
              rolePermissions: [
                {
                  role: {
                    id: 'uuid',
                    name: 'admin',
                    description: 'Administrator role'
                  }
                }
              ],
              _count: {
                rolePermissions: 3
              }
            }
          }
        }
      } */
  /* #swagger.responses[404] = {
        description: 'Permission not found',
        schema: { $ref: '#/definitions/ErrorResponse' }
      } */
  permissionController.getById,
);
router.all('/:id', methodNotAllowed);

router.post(
  '/',
  /* #swagger.tags = ['RBAC - Permissions'] */
  /* #swagger.description = 'Create a new permission. Permission name format: resource:action (e.g., "user:create"). Requires admin role.' */
  /* #swagger.summary = 'Create Permission' */
  /* #swagger.security = [{"bearerAuth": []}] */
  /* #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
          name: 'product:update',
          resource: 'product',
          action: 'update',
          description: 'Permission to update products'
        }
      } */
  /* #swagger.responses[201] = {
        description: 'Permission created successfully',
        schema: {
          success: true,
          message: 'Permission created successfully',
          data: {
            permission: { $ref: '#/definitions/Permission' }
          }
        }
      } */
  /* #swagger.responses[409] = {
        description: 'Permission name already exists',
        schema: { $ref: '#/definitions/ErrorResponse' }
      } */
  permissionController.create,
);
router.all('/', methodNotAllowed);

router.put(
  '/:id',
  /* #swagger.tags = ['RBAC - Permissions'] */
  /* #swagger.description = 'Update permission details. Requires admin role.' */
  /* #swagger.summary = 'Update Permission' */
  /* #swagger.security = [{"bearerAuth": []}] */
  /* #swagger.parameters['id'] = {
        in: 'path',
        type: 'string',
        required: true,
        description: 'Permission UUID'
      } */
  /* #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
          name: 'updated:permission',
          resource: 'updated',
          action: 'permission',
          description: 'Updated description'
        }
      } */
  /* #swagger.responses[200] = {
        description: 'Permission updated successfully',
        schema: {
          success: true,
          message: 'Permission updated successfully',
          data: {
            permission: { $ref: '#/definitions/Permission' }
          }
        }
      } */
  permissionController.update,
);
router.all('/:id', methodNotAllowed);

router.delete(
  '/:id',
  /* #swagger.tags = ['RBAC - Permissions'] */
  /* #swagger.description = 'Delete a permission. This will remove the permission from all roles. Requires admin role.' */
  /* #swagger.summary = 'Delete Permission' */
  /* #swagger.security = [{"bearerAuth": []}] */
  /* #swagger.parameters['id'] = {
        in: 'path',
        type: 'string',
        required: true,
        description: 'Permission UUID'
      } */
  /* #swagger.responses[200] = {
        description: 'Permission deleted successfully',
        schema: {
          success: true,
          message: 'Permission deleted successfully',
          data: {}
        }
      } */
  permissionController.delete,
);
router.all('/:id', methodNotAllowed);

export default router;

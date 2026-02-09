import { Router } from 'express';
import { roleController } from '../../controllers';
import authenticate from '../../middlewares/authenticate';
import rbac from '../../middlewares/rbac';
import methodNotAllowed from '../../middlewares/methodNotAllowed';

const router: Router = Router();

// All role routes require authentication
router.use(authenticate);

// All role routes require admin role
router.use(rbac.requireRole('admin'));

router.get(
  '/',
  /* #swagger.tags = ['RBAC - Roles'] */
  /* #swagger.description = 'Get all roles. Requires admin role. Can filter by isActive query parameter.' */
  /* #swagger.summary = 'List All Roles' */
  /* #swagger.security = [{"bearerAuth": []}] */
  /* #swagger.parameters['isActive'] = {
        in: 'query',
        type: 'string',
        description: 'Filter by active status (true/false)',
        required: false
      } */
  /* #swagger.responses[200] = {
        description: 'Roles retrieved successfully',
        schema: {
          success: true,
          message: 'Operation successful',
          data: {
            roles: [
              {
                id: 'uuid',
                name: 'admin',
                description: 'Administrator role',
                isActive: true,
                createdAt: '2024-01-01T00:00:00.000Z',
                updatedAt: '2024-01-01T00:00:00.000Z',
                _count: {
                  userRoles: 5,
                  rolePermissions: 10
                }
              }
            ]
          }
        }
      } */
  /* #swagger.responses[401] = {
        description: 'Unauthorized - Invalid or missing token',
        schema: { $ref: '#/definitions/ErrorResponse' }
      } */
  /* #swagger.responses[403] = {
        description: 'Forbidden - Admin role required',
        schema: { $ref: '#/definitions/ErrorResponse' }
      } */
  roleController.getAll,
);
router.all('/', methodNotAllowed);

router.get(
  '/:id',
  /* #swagger.tags = ['RBAC - Roles'] */
  /* #swagger.description = 'Get role by ID with associated permissions and users. Requires admin role.' */
  /* #swagger.summary = 'Get Role by ID' */
  /* #swagger.security = [{"bearerAuth": []}] */
  /* #swagger.parameters['id'] = {
        in: 'path',
        type: 'string',
        required: true,
        description: 'Role UUID'
      } */
  /* #swagger.responses[200] = {
        description: 'Role retrieved successfully',
        schema: {
          success: true,
          message: 'Operation successful',
          data: {
            role: {
              id: 'uuid',
              name: 'admin',
              description: 'Administrator role',
              isActive: true,
              rolePermissions: [
                {
                  permission: { $ref: '#/definitions/Permission' }
                }
              ],
              userRoles: [
                {
                  user: {
                    id: 'uuid',
                    email: 'user@example.com',
                    username: 'username'
                  }
                }
              ],
              _count: {
                userRoles: 5,
                rolePermissions: 10
              }
            }
          }
        }
      } */
  /* #swagger.responses[404] = {
        description: 'Role not found',
        schema: { $ref: '#/definitions/ErrorResponse' }
      } */
  roleController.getById,
);
router.all('/:id', methodNotAllowed);

router.post(
  '/',
  /* #swagger.tags = ['RBAC - Roles'] */
  /* #swagger.description = 'Create a new role. Requires admin role.' */
  /* #swagger.summary = 'Create Role' */
  /* #swagger.security = [{"bearerAuth": []}] */
  /* #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
          name: 'moderator',
          description: 'Moderator role for content management',
          isActive: true
        }
      } */
  /* #swagger.responses[201] = {
        description: 'Role created successfully',
        schema: {
          success: true,
          message: 'Role created successfully',
          data: {
            role: { $ref: '#/definitions/Role' }
          }
        }
      } */
  /* #swagger.responses[409] = {
        description: 'Role name already exists',
        schema: { $ref: '#/definitions/ErrorResponse' }
      } */
  roleController.create,
);
router.all('/', methodNotAllowed);

router.put(
  '/:id',
  /* #swagger.tags = ['RBAC - Roles'] */
  /* #swagger.description = 'Update role details. Requires admin role.' */
  /* #swagger.summary = 'Update Role' */
  /* #swagger.security = [{"bearerAuth": []}] */
  /* #swagger.parameters['id'] = {
        in: 'path',
        type: 'string',
        required: true,
        description: 'Role UUID'
      } */
  /* #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
          name: 'updated_role_name',
          description: 'Updated description',
          isActive: false
        }
      } */
  /* #swagger.responses[200] = {
        description: 'Role updated successfully',
        schema: {
          success: true,
          message: 'Role updated successfully',
          data: {
            role: { $ref: '#/definitions/Role' }
          }
        }
      } */
  roleController.update,
);
router.all('/:id', methodNotAllowed);

router.delete(
  '/:id',
  /* #swagger.tags = ['RBAC - Roles'] */
  /* #swagger.description = 'Delete a role. This will also remove all user-role assignments and role-permission assignments. Requires admin role.' */
  /* #swagger.summary = 'Delete Role' */
  /* #swagger.security = [{"bearerAuth": []}] */
  /* #swagger.parameters['id'] = {
        in: 'path',
        type: 'string',
        required: true,
        description: 'Role UUID'
      } */
  /* #swagger.responses[200] = {
        description: 'Role deleted successfully',
        schema: {
          success: true,
          message: 'Role deleted successfully',
          data: {}
        }
      } */
  roleController.delete,
);
router.all('/:id', methodNotAllowed);

router.post(
  '/:id/permissions',
  /* #swagger.tags = ['RBAC - Roles'] */
  /* #swagger.description = 'Assign permissions to a role. This replaces all existing permissions. Requires admin role.' */
  /* #swagger.summary = 'Assign Permissions to Role' */
  /* #swagger.security = [{"bearerAuth": []}] */
  /* #swagger.parameters['id'] = {
        in: 'path',
        type: 'string',
        required: true,
        description: 'Role UUID'
      } */
  /* #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
          permissionIds: ['permission-uuid-1', 'permission-uuid-2', 'permission-uuid-3']
        }
      } */
  /* #swagger.responses[200] = {
        description: 'Permissions assigned successfully',
        schema: {
          success: true,
          message: 'Permissions assigned successfully',
          data: {
            role: {
              id: 'uuid',
              name: 'admin',
              rolePermissions: [
                {
                  permission: { $ref: '#/definitions/Permission' }
                }
              ]
            }
          }
        }
      } */
  roleController.assignPermissions,
);
router.all('/:id/permissions', methodNotAllowed);

export default router;

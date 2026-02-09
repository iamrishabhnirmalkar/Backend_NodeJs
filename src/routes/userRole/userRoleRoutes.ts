import { Router } from 'express';
import { userRoleController } from '../../controllers';
import authenticate from '../../middlewares/authenticate';
import rbac from '../../middlewares/rbac';
import methodNotAllowed from '../../middlewares/methodNotAllowed';

const router: Router = Router();

// All user-role routes require authentication
router.use(authenticate);

// All user-role routes require admin role
router.use(rbac.requireRole('admin'));

router.get(
  '/:userId/roles',
  /* #swagger.tags = ['RBAC - User Roles'] */
  /* #swagger.description = 'Get all roles assigned to a user with their permissions. Requires admin role.' */
  /* #swagger.summary = 'Get User Roles' */
  /* #swagger.security = [{"bearerAuth": []}] */
  /* #swagger.parameters['userId'] = {
        in: 'path',
        type: 'string',
        required: true,
        description: 'User UUID'
      } */
  /* #swagger.responses[200] = {
        description: 'User roles retrieved successfully',
        schema: {
          success: true,
          message: 'Operation successful',
          data: {
            user: {
              id: 'uuid',
              email: 'user@example.com',
              username: 'username'
            },
            roles: [
              {
                id: 'uuid',
                name: 'admin',
                description: 'Administrator role',
                permissions: ['user:create', 'user:read', 'user:update', 'user:delete'],
                assignedAt: '2024-01-01T00:00:00.000Z'
              }
            ]
          }
        }
      } */
  /* #swagger.responses[404] = {
        description: 'User not found',
        schema: { $ref: '#/definitions/ErrorResponse' }
      } */
  userRoleController.getUserRoles,
);
router.all('/:userId/roles', methodNotAllowed);

router.post(
  '/:userId/roles',
  /* #swagger.tags = ['RBAC - User Roles'] */
  /* #swagger.description = 'Assign a role to a user. Requires admin role.' */
  /* #swagger.summary = 'Assign Role to User' */
  /* #swagger.security = [{"bearerAuth": []}] */
  /* #swagger.parameters['userId'] = {
        in: 'path',
        type: 'string',
        required: true,
        description: 'User UUID'
      } */
  /* #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
          roleId: 'role-uuid'
        }
      } */
  /* #swagger.responses[201] = {
        description: 'Role assigned to user successfully',
        schema: {
          success: true,
          message: 'Role assigned to user successfully',
          data: {
            userRole: {
              id: 'uuid',
              userId: 'user-uuid',
              roleId: 'role-uuid',
              role: { $ref: '#/definitions/Role' },
              user: {
                id: 'uuid',
                email: 'user@example.com',
                username: 'username'
              },
              createdAt: '2024-01-01T00:00:00.000Z'
            }
          }
        }
      } */
  /* #swagger.responses[409] = {
        description: 'Role already assigned to user',
        schema: { $ref: '#/definitions/ErrorResponse' }
      } */
  userRoleController.assignRole,
);
router.all('/:userId/roles', methodNotAllowed);

router.put(
  '/:userId/roles',
  /* #swagger.tags = ['RBAC - User Roles'] */
  /* #swagger.description = 'Update user roles by replacing all existing roles with new ones. Requires admin role.' */
  /* #swagger.summary = 'Update User Roles (Replace All)' */
  /* #swagger.security = [{"bearerAuth": []}] */
  /* #swagger.parameters['userId'] = {
        in: 'path',
        type: 'string',
        required: true,
        description: 'User UUID'
      } */
  /* #swagger.parameters['body'] = {
        in: 'body',
        required: true,
        schema: {
          roleIds: ['role-uuid-1', 'role-uuid-2']
        }
      } */
  /* #swagger.responses[200] = {
        description: 'User roles updated successfully',
        schema: {
          success: true,
          message: 'User roles updated successfully',
          data: {
            roles: [
              { $ref: '#/definitions/Role' }
            ]
          }
        }
      } */
  userRoleController.updateUserRoles,
);
router.all('/:userId/roles', methodNotAllowed);

router.delete(
  '/:userId/roles/:roleId',
  /* #swagger.tags = ['RBAC - User Roles'] */
  /* #swagger.description = 'Remove a role from a user. Requires admin role.' */
  /* #swagger.summary = 'Remove Role from User' */
  /* #swagger.security = [{"bearerAuth": []}] */
  /* #swagger.parameters['userId'] = {
        in: 'path',
        type: 'string',
        required: true,
        description: 'User UUID'
      } */
  /* #swagger.parameters['roleId'] = {
        in: 'path',
        type: 'string',
        required: true,
        description: 'Role UUID'
      } */
  /* #swagger.responses[200] = {
        description: 'Role removed from user successfully',
        schema: {
          success: true,
          message: 'Role removed from user successfully',
          data: {}
        }
      } */
  /* #swagger.responses[404] = {
        description: 'User role assignment not found',
        schema: { $ref: '#/definitions/ErrorResponse' }
      } */
  userRoleController.removeRole,
);
router.all('/:userId/roles/:roleId', methodNotAllowed);

export default router;

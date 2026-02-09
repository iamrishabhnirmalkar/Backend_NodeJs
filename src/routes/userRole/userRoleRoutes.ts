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
  /* #swagger.tags = ['User Roles'] */
  /* #swagger.description = 'Get user roles' */
  /* #swagger.security = [{"bearerAuth": []}] */
  userRoleController.getUserRoles,
);
router.all('/:userId/roles', methodNotAllowed);

router.post(
  '/:userId/roles',
  /* #swagger.tags = ['User Roles'] */
  /* #swagger.description = 'Assign role to user' */
  /* #swagger.security = [{"bearerAuth": []}] */
  userRoleController.assignRole,
);
router.all('/:userId/roles', methodNotAllowed);

router.put(
  '/:userId/roles',
  /* #swagger.tags = ['User Roles'] */
  /* #swagger.description = 'Update user roles (replace all)' */
  /* #swagger.security = [{"bearerAuth": []}] */
  userRoleController.updateUserRoles,
);
router.all('/:userId/roles', methodNotAllowed);

router.delete(
  '/:userId/roles/:roleId',
  /* #swagger.tags = ['User Roles'] */
  /* #swagger.description = 'Remove role from user' */
  /* #swagger.security = [{"bearerAuth": []}] */
  userRoleController.removeRole,
);
router.all('/:userId/roles/:roleId', methodNotAllowed);

export default router;

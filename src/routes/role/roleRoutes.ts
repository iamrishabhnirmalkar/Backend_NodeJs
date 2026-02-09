import { Router } from 'express';
import { roleController } from '../../controllers';
import authenticate from '../../middlewares/authenticate';
import rbac from '../../middlewares/rbac';
import methodNotAllowed from '../../middlewares/methodNotAllowed';

const router: Router = Router();

// All role routes require authentication
router.use(authenticate);

// All role routes require admin role (you can change this permission as needed)
router.use(rbac.requireRole('admin'));

router.get(
  '/',
  /* #swagger.tags = ['Roles'] */
  /* #swagger.description = 'Get all roles' */
  /* #swagger.security = [{"bearerAuth": []}] */
  roleController.getAll,
);
router.all('/', methodNotAllowed);

router.get(
  '/:id',
  /* #swagger.tags = ['Roles'] */
  /* #swagger.description = 'Get role by ID' */
  /* #swagger.security = [{"bearerAuth": []}] */
  roleController.getById,
);
router.all('/:id', methodNotAllowed);

router.post(
  '/',
  /* #swagger.tags = ['Roles'] */
  /* #swagger.description = 'Create new role' */
  /* #swagger.security = [{"bearerAuth": []}] */
  roleController.create,
);
router.all('/', methodNotAllowed);

router.put(
  '/:id',
  /* #swagger.tags = ['Roles'] */
  /* #swagger.description = 'Update role' */
  /* #swagger.security = [{"bearerAuth": []}] */
  roleController.update,
);
router.all('/:id', methodNotAllowed);

router.delete(
  '/:id',
  /* #swagger.tags = ['Roles'] */
  /* #swagger.description = 'Delete role' */
  /* #swagger.security = [{"bearerAuth": []}] */
  roleController.delete,
);
router.all('/:id', methodNotAllowed);

router.post(
  '/:id/permissions',
  /* #swagger.tags = ['Roles'] */
  /* #swagger.description = 'Assign permissions to role' */
  /* #swagger.security = [{"bearerAuth": []}] */
  roleController.assignPermissions,
);
router.all('/:id/permissions', methodNotAllowed);

export default router;

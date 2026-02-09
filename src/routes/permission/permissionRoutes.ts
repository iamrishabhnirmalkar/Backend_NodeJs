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
  /* #swagger.tags = ['Permissions'] */
  /* #swagger.description = 'Get all permissions' */
  /* #swagger.security = [{"bearerAuth": []}] */
  permissionController.getAll,
);
router.all('/', methodNotAllowed);

router.get(
  '/:id',
  /* #swagger.tags = ['Permissions'] */
  /* #swagger.description = 'Get permission by ID' */
  /* #swagger.security = [{"bearerAuth": []}] */
  permissionController.getById,
);
router.all('/:id', methodNotAllowed);

router.post(
  '/',
  /* #swagger.tags = ['Permissions'] */
  /* #swagger.description = 'Create new permission' */
  /* #swagger.security = [{"bearerAuth": []}] */
  permissionController.create,
);
router.all('/', methodNotAllowed);

router.put(
  '/:id',
  /* #swagger.tags = ['Permissions'] */
  /* #swagger.description = 'Update permission' */
  /* #swagger.security = [{"bearerAuth": []}] */
  permissionController.update,
);
router.all('/:id', methodNotAllowed);

router.delete(
  '/:id',
  /* #swagger.tags = ['Permissions'] */
  /* #swagger.description = 'Delete permission' */
  /* #swagger.security = [{"bearerAuth": []}] */
  permissionController.delete,
);
router.all('/:id', methodNotAllowed);

export default router;

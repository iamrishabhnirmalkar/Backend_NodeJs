import { Router } from 'express';
import { authController } from '../../controllers';
import authenticate from '../../middlewares/authenticate';
import methodNotAllowed from '../../middlewares/methodNotAllowed';

const router: Router = Router();

// Public routes
router.post(
  '/register',
  /* #swagger.tags = ['Auth'] */
  /* #swagger.description = 'Register a new user' */
  authController.register,
);
router.all('/register', methodNotAllowed);

router.post(
  '/login',
  /* #swagger.tags = ['Auth'] */
  /* #swagger.description = 'Login user' */
  authController.login,
);
router.all('/login', methodNotAllowed);

router.post(
  '/refresh',
  /* #swagger.tags = ['Auth'] */
  /* #swagger.description = 'Refresh access token' */
  authController.refresh,
);
router.all('/refresh', methodNotAllowed);

router.post(
  '/logout',
  /* #swagger.tags = ['Auth'] */
  /* #swagger.description = 'Logout user' */
  authController.logout,
);
router.all('/logout', methodNotAllowed);

// Protected routes
router.get(
  '/me',
  /* #swagger.tags = ['Auth'] */
  /* #swagger.description = 'Get current user profile' */
  /* #swagger.security = [{"bearerAuth": []}] */
  authenticate,
  authController.me,
);
router.all('/me', methodNotAllowed);

export default router;

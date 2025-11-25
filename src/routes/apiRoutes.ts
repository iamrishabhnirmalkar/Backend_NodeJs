import { Router } from "express";
import apiController from "../controllers/apiController";
import validateHttpMethods from "../middlewares/validateHttpMethods";
import methodNotAllowed from "../middlewares/methodNotAllowed";

const router: Router = Router();

router.route("/self").get(apiController.self).all(methodNotAllowed);
router.route("/health").get(apiController.health).all(methodNotAllowed);

export default router;

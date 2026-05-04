import { Router } from "express";

import { userAuth } from "../middlewares/authentication.middleware";
import { authorize, Role } from "../middlewares/authorization.middleware";
import { createUser } from "../controllers/admin/admin.controller";

const router = Router();

router.route("/createUser").post(userAuth, authorize(Role.ADMIN), createUser);

export default router; //export the router to use it in other files

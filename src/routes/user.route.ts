import { Router } from "express";
import { LoginUser } from "../controllers/user/user.controller";

const router = Router();

router.route("/login").post(LoginUser);

export default router;

import { Router } from "express";
import {
  getCurrentUser,
  LoginUser,
  logoutUser,
} from "../controllers/user/user.controller";
import { userAuth } from "../middlewares/authentication.middleware";

const router = Router();

router.post("/login", LoginUser);
router.get("/me", userAuth, getCurrentUser);
router.post("/logout", userAuth, logoutUser);

export default router;

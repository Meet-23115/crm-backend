import { Router } from "express";
import { LoginUser } from "../controllers/user.controller";

const router = Router();

router.route("/").get(LoginUser);

import { Router } from "express";
import { createProject } from "../controllers/member/project.controller";

const router = Router();

router.route("/project").post(createProject);